"""Minimal, dependency-free PresentationML writer.

Written from scratch (instead of pptxgenjs / python-pptx) because the deck needs things those libraries
do not expose: freeform Bezier geometry, gradients with per-stop alpha, soft edges, Morph and p14
transitions, and real object-level animation timing trees.

Units: authoring is in inches (13.333 x 7.5 slide); everything is converted to EMU on output.
"""
from __future__ import annotations

import zipfile
from dataclasses import dataclass, field
from xml.sax.saxutils import escape

EMU = 914400
SLIDE_W, SLIDE_H = 13.333333, 7.5

NS = (
    'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
    'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"'
)
NS_SLD = NS + (
    ' xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"'
    ' xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main"'
    ' xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main"'
)
HDR = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'


def E(v: float) -> int:
    return int(round(v * EMU))


# --------------------------------------------------------------------------- colour / fill / line
def clr(c: str, alpha: float | None = None) -> str:
    if alpha is None or alpha >= 1:
        return f'<a:srgbClr val="{c}"/>'
    return f'<a:srgbClr val="{c}"><a:alpha val="{int(alpha * 100000)}"/></a:srgbClr>'


def solid(c: str, alpha: float | None = None) -> str:
    return f"<a:solidFill>{clr(c, alpha)}</a:solidFill>"


def lin(stops, angle=90) -> str:
    """Linear gradient. stops: [(pos 0..1, hex, alpha|None)]. angle in degrees (90 = top to bottom)."""
    gs = "".join(f'<a:gs pos="{int(p * 100000)}">{clr(c, a)}</a:gs>' for p, c, a in stops)
    return f'<a:gradFill rotWithShape="1"><a:gsLst>{gs}</a:gsLst><a:lin ang="{int(angle * 60000)}" scaled="0"/></a:gradFill>'


def rad(stops, cx=0.5, cy=0.5) -> str:
    """Radial gradient from a focus point; stop 0 is the centre."""
    # A circle-path gradient reaches 100% at the bounding-box corner, so an ellipse's own edge sits near 70%.
    # Scale the stops so that position 1.0 lands on the ellipse edge and glows fade out fully inside the shape.
    k = 0.70
    pts = [(p * k, c, a) for p, c, a in stops] + [(1.0, stops[-1][1], stops[-1][2])]
    gs = "".join(f'<a:gs pos="{int(p * 100000)}">{clr(c, a)}</a:gs>' for p, c, a in pts)
    l, t = int(cx * 100000), int(cy * 100000)
    return (f'<a:gradFill rotWithShape="1"><a:gsLst>{gs}</a:gsLst><a:path path="circle">'
            f'<a:fillToRect l="{l}" t="{t}" r="{100000 - l}" b="{100000 - t}"/></a:path></a:gradFill>')


NOFILL = "<a:noFill/>"


def ln(c=None, w=1.0, alpha=None, dash=None, cap="rnd", grad: str | None = None) -> str:
    if c is None and grad is None:
        return "<a:ln><a:noFill/></a:ln>"
    fill = grad if grad else solid(c, alpha)
    d = f'<a:prstDash val="{dash}"/>' if dash else ""
    return f'<a:ln w="{int(w * 12700)}" cap="{cap}">{fill}{d}<a:round/></a:ln>'


def effects(glow=None, soft=None, shadow=None) -> str:
    out = ""
    if shadow:  # (blur_pt, dist_pt, dir_deg, hex, alpha)
        b, d, a, c, al = shadow
        out += (f'<a:outerShdw blurRad="{int(b * 12700)}" dist="{int(d * 12700)}" dir="{int(a * 60000)}" '
                f'algn="ctr" rotWithShape="0">{clr(c, al)}</a:outerShdw>')
    if glow:  # (radius_pt, hex, alpha)
        r, c, al = glow
        out += f'<a:glow rad="{int(r * 12700)}">{clr(c, al)}</a:glow>'
    if soft:
        out += f'<a:softEdge rad="{int(soft * EMU)}"/>'
    return f"<a:effectLst>{out}</a:effectLst>" if out else ""


# --------------------------------------------------------------------------- text
def run(text, sz=20, color="F6F1E9", b=False, i=False, font=None, spc=None, grad=None, link=None, alpha=None, u=False):
    return dict(t=text, sz=sz, color=color, b=b, i=i, font=font, spc=spc, grad=grad, link=link, alpha=alpha, u=u)


def para(runs, algn="l", lnspc=None, bef=0, aft=0):
    if isinstance(runs, dict):
        runs = [runs]
    return dict(runs=runs, algn=algn, lnspc=lnspc, bef=bef, aft=aft)


@dataclass
class Ctx:
    """Per-slide state: id counter, relationships, hyperlink targets."""
    rels: list = field(default_factory=list)  # (rid, type, target, external)
    next_id: int = 2
    display: str = "Georgia"
    body: str = "Calibri"

    def nid(self) -> int:
        i = self.next_id
        self.next_id += 1
        return i

    def rel(self, typ: str, target: str, external=False) -> str:
        for rid, t, tg, ex in self.rels:
            if t == typ and tg == target:
                return rid
        rid = f"rId{len(self.rels) + 2}"  # rId1 = layout
        self.rels.append((rid, typ, target, external))
        return rid


def _rpr(r, ctx: Ctx, tag="a:rPr") -> str:
    font = r["font"] or ctx.body
    attrs = f'lang="en-IN" sz="{int(r["sz"] * 100)}" b="{1 if r["b"] else 0}" i="{1 if r["i"] else 0}" dirty="0"'
    if r["u"]:
        attrs += ' u="sng"'
    if r["spc"] is not None:
        attrs += f' spc="{int(r["spc"] * 100)}"'
    fill = r["grad"] if r["grad"] else solid(r["color"], r["alpha"])
    link = ""
    if r["link"]:
        rid = ctx.rel("http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", r["link"], True)
        link = f'<a:hlinkClick r:id="{rid}"/>'
    tf = f'<a:latin typeface="{font}"/><a:ea typeface="{font}"/><a:cs typeface="{font}"/>'
    return f"<{tag} {attrs}>{fill}{tf}{link}</{tag}>"


def txbody(paras, ctx: Ctx, anchor="t", ins=(0, 0, 0, 0), wrap=True, tag="p:txBody") -> str:
    ps = []
    for p in paras:
        ppr = f'<a:pPr algn="{p["algn"]}" marL="0" indent="0">'
        if p["lnspc"]:
            ppr += f'<a:lnSpc><a:spcPct val="{int(p["lnspc"] * 1000)}"/></a:lnSpc>'
        ppr += f'<a:spcBef><a:spcPts val="{int(p["bef"] * 100)}"/></a:spcBef><a:spcAft><a:spcPts val="{int(p["aft"] * 100)}"/></a:spcAft><a:buNone/></a:pPr>'
        rs = "".join(f'<a:r>{_rpr(r, ctx)}<a:t>{escape(r["t"])}</a:t></a:r>' for r in p["runs"])
        last = p["runs"][-1]
        ps.append(f'<a:p>{ppr}{rs}{_rpr(last, ctx, "a:endParaRPr")}</a:p>')
    l, t, r_, b = (E(v) for v in ins)
    w = "square" if wrap else "none"
    return (f'<{tag}><a:bodyPr wrap="{w}" lIns="{l}" tIns="{t}" rIns="{r_}" bIns="{b}" anchor="{anchor}" rtlCol="0">'
            f'<a:noAutofit/></a:bodyPr><a:lstStyle/>{"".join(ps)}</{tag}>')


# --------------------------------------------------------------------------- geometry
def custgeom(paths, w=1000, h=1000) -> str:
    """paths: list of subpaths; each a list of ('M',x,y) ('L',x,y) ('C',x1,y1,x2,y2,x3,y3) ('Z',)."""
    body = ""
    for sp in paths:
        seg = ""
        for c in sp:
            if c[0] == "M":
                seg += f'<a:moveTo><a:pt x="{int(c[1])}" y="{int(c[2])}"/></a:moveTo>'
            elif c[0] == "L":
                seg += f'<a:lnTo><a:pt x="{int(c[1])}" y="{int(c[2])}"/></a:lnTo>'
            elif c[0] == "C":
                seg += ('<a:cubicBezTo>' + "".join(f'<a:pt x="{int(c[k])}" y="{int(c[k + 1])}"/>' for k in (1, 3, 5)) + '</a:cubicBezTo>')
            elif c[0] == "Z":
                seg += "<a:close/>"
        body += seg
    return (f'<a:custGeom><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst/><a:rect l="0" t="0" r="r" b="b"/>'
            f'<a:pathLst><a:path w="{w}" h="{h}">{body}</a:path></a:pathLst></a:custGeom>')


def prst(name, adj=None) -> str:
    av = "".join(f'<a:gd name="{k}" fmla="val {int(v)}"/>' for k, v in (adj or {}).items())
    return f'<a:prstGeom prst="{name}"><a:avLst>{av}</a:avLst></a:prstGeom>'


# --------------------------------------------------------------------------- shapes
def xfrm(x, y, w, h, rot=0, flipH=False, flipV=False, tag="a:xfrm") -> str:
    a = ""
    if rot:
        a += f' rot="{int(rot * 60000)}"'
    if flipH:
        a += ' flipH="1"'
    if flipV:
        a += ' flipV="1"'
    return f'<{tag}{a}><a:off x="{E(x)}" y="{E(y)}"/><a:ext cx="{E(w)}" cy="{E(h)}"/></{tag}>'


@dataclass
class Node:
    id: int
    xml: str
    name: str
    x: float
    y: float
    w: float
    h: float
    has_text: bool = False


def shape(ctx: Ctx, name, x, y, w, h, geom=None, fill=NOFILL, line=None, fx="", rot=0, flipH=False, flipV=False,
          paras=None, anchor="t", ins=(0, 0, 0, 0), wrap=True, descr=None, title=False, textbox=False, link=None) -> Node:
    sid = ctx.nid()
    geom = geom or prst("rect")
    line = line if line is not None else ln(None)
    d = f' descr="{escape(descr)}"' if descr else ""
    hl = ""
    if link:
        rid = ctx.rel("http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", link, True)
        hl = f'<a:hlinkClick r:id="{rid}"/>'
    ph = '<p:ph type="title"/>' if title else ""
    cnv = '<p:cNvSpPr txBox="1"/>' if (textbox and not title) else ('<p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>' if title else "<p:cNvSpPr/>")
    tb = txbody(paras, ctx, anchor, ins, wrap) if paras else ""
    if not paras:
        tb = '<p:txBody><a:bodyPr rtlCol="0" anchor="ctr"/><a:lstStyle/><a:p><a:endParaRPr lang="en-IN"/></a:p></p:txBody>' if False else ""
    xml = (f'<p:sp><p:nvSpPr><p:cNvPr id="{sid}" name="{escape(name)}"{d}>{hl}</p:cNvPr>{cnv}<p:nvPr>{ph}</p:nvPr></p:nvSpPr>'
           f'<p:spPr>{xfrm(x, y, w, h, rot, flipH, flipV)}{geom}{fill}{line}{fx}</p:spPr>{tb}</p:sp>')
    return Node(sid, xml, name, x, y, w, h, bool(paras))


def text(ctx: Ctx, name, x, y, w, h, paras, anchor="t", wrap=True, title=False, fill=NOFILL, link=None) -> Node:
    return shape(ctx, name, x, y, w, h, paras=paras, anchor=anchor, wrap=wrap, textbox=True, title=title, fill=fill, link=link)


def picture(ctx: Ctx, name, rel_target, x, y, w, h, descr, crop=(0, 0, 0, 0), geom=None, soft=None, line=None, fx="", rot=0) -> Node:
    sid = ctx.nid()
    rid = ctx.rel("http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", rel_target)
    l, t, r_, b = (int(v * 100000) for v in crop)
    src = f'<a:srcRect l="{l}" t="{t}" r="{r_}" b="{b}"/>' if any((l, t, r_, b)) else ""
    geom = geom or prst("rect")
    line = line if line is not None else ""
    fx = fx or effects(soft=soft)
    xml = (f'<p:pic><p:nvPicPr><p:cNvPr id="{sid}" name="{escape(name)}" descr="{escape(descr)}"/>'
           f'<p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>'
           f'<p:blipFill><a:blip r:embed="{rid}"/>{src}<a:stretch><a:fillRect/></a:stretch></p:blipFill>'
           f'<p:spPr>{xfrm(x, y, w, h, rot)}{geom}{line}{fx}</p:spPr></p:pic>')
    return Node(sid, xml, name, x, y, w, h)


def group(ctx: Ctx, name, children: list[Node], descr=None) -> Node:
    gid = ctx.nid()
    x0 = min(c.x for c in children)
    y0 = min(c.y for c in children)
    x1 = max(c.x + c.w for c in children)
    y1 = max(c.y + c.h for c in children)
    d = f' descr="{escape(descr)}"' if descr else ""
    xml = (f'<p:grpSp><p:nvGrpSpPr><p:cNvPr id="{gid}" name="{escape(name)}"{d}/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
           f'<p:grpSpPr><a:xfrm><a:off x="{E(x0)}" y="{E(y0)}"/><a:ext cx="{E(x1 - x0)}" cy="{E(y1 - y0)}"/>'
           f'<a:chOff x="{E(x0)}" y="{E(y0)}"/><a:chExt cx="{E(x1 - x0)}" cy="{E(y1 - y0)}"/></a:xfrm></p:grpSpPr>'
           + "".join(c.xml for c in children) + "</p:grpSp>")
    return Node(gid, xml, name, x0, y0, x1 - x0, y1 - y0)


# --------------------------------------------------------------------------- animation
DUR_DEFAULT = 900


def _tgt(spid):
    return f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'


class Timing:
    """Builds <p:timing>. Each click group holds effects with absolute offsets from the click (or slide start for auto groups)."""

    def __init__(self):
        self.groups = []  # dict(auto=bool, effects=[...])
        self._id = 2
        self.text_shapes = set()

    def group(self, auto=False):
        g = dict(auto=auto, effects=[])
        self.groups.append(g)
        return g

    def add(self, g, node: Node, kind="fade", at=0, dur=DUR_DEFAULT, scale=0.88, rise=0.07, direction="left"):
        g["effects"].append(dict(node=node, kind=kind, at=at, dur=dur, scale=scale, rise=rise, direction=direction))
        if node.has_text:
            self.text_shapes.add(node.id)

    def _n(self):
        self._id += 1
        return self._id

    def _behaviors(self, e):
        spid, d, k = e["node"].id, e["dur"], e["kind"]
        tgt = _tgt(spid)

        def fade():
            return f'<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="{self._n()}" dur="{d}"/>{tgt}</p:cBhvr></p:animEffect>'

        def anim(attr, frm, to):
            return (f'<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base"><p:cTn id="{self._n()}" dur="{d}" fill="hold" decel="100000"/>{tgt}'
                    f'<p:attrNameLst><p:attrName>{attr}</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst>'
                    f'<p:tav tm="0"><p:val><p:strVal val="{frm}"/></p:val></p:tav><p:tav tm="100000"><p:val><p:strVal val="{to}"/></p:val></p:tav></p:tavLst></p:anim>')

        if k == "fade":
            return 10, 0, fade()
        if k == "wipe":
            sub, name = {"left": (8, "wipe(left)"), "right": (2, "wipe(right)"), "top": (1, "wipe(up)"), "bottom": (4, "wipe(down)")}[e["direction"]]
            return 22, sub, f'<p:animEffect transition="in" filter="{name}"><p:cBhvr><p:cTn id="{self._n()}" dur="{d}"/>{tgt}</p:cBhvr></p:animEffect>'
        if k == "rise":
            return 42, 4, anim("ppt_y", f'#ppt_y+{e["rise"]}', "#ppt_y") + fade()
        if k == "grow":
            s = e["scale"]
            return 53, 16, anim("ppt_w", f"#ppt_w*{s}", "#ppt_w") + anim("ppt_h", f"#ppt_h*{s}", "#ppt_h") + fade()
        raise ValueError(k)

    def _effect(self, e, first, auto):
        node_type = ("afterEffect" if auto else "clickEffect") if first else "withEffect"
        preset, sub, beh = self._behaviors(e)
        grp = ' grpId="0"' if e["node"].has_text else ""
        cid = self._n()
        sid = self._n()
        return (f'<p:par><p:cTn id="{cid}" presetID="{preset}" presetClass="entr" presetSubtype="{sub}" fill="hold"{grp} nodeType="{node_type}">'
                f'<p:stCondLst><p:cond delay="{e["at"]}"/></p:stCondLst><p:childTnLst>'
                f'<p:set><p:cBhvr><p:cTn id="{sid}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>{_tgt(e["node"].id)}'
                f'<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>'
                f'{beh}</p:childTnLst></p:cTn></p:par>')

    def xml(self):
        if not self.groups:
            return ""
        self._id = 2
        body = ""
        for g in self.groups:
            outer, inner = self._n(), self._n()
            effs = "".join(self._effect(e, i == 0, g["auto"]) for i, e in enumerate(sorted(g["effects"], key=lambda e: e["at"])))
            auto = '<p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond>' if g["auto"] else ""
            body += (f'<p:par><p:cTn id="{outer}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/>{auto}</p:stCondLst><p:childTnLst>'
                     f'<p:par><p:cTn id="{inner}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>{effs}</p:childTnLst></p:cTn></p:par>'
                     f'</p:childTnLst></p:cTn></p:par>')
        bld = "".join(f'<p:bldP spid="{i}" grpId="0" animBg="1"/>' for i in sorted(self.text_shapes))
        bld = f"<p:bldLst>{bld}</p:bldLst>" if bld else ""
        return ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
                '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
                f'{body}</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
                '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
                f'</p:childTnLst></p:cTn></p:par></p:tnLst>{bld}</p:timing>')


# --------------------------------------------------------------------------- transitions
def transition(kind: str, ms=1200) -> str:
    """Native slide transitions. 'morph' falls back to fade where Morph is unsupported."""
    if kind == "morph":
        return ('<mc:AlternateContent><mc:Choice Requires="p159">'
                f'<p:transition spd="slow" p14:dur="{ms}"><p159:morph option="byObject"/></p:transition></mc:Choice>'
                '<mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>')
    if kind == "fade":
        return ('<mc:AlternateContent><mc:Choice Requires="p14">'
                f'<p:transition spd="slow" p14:dur="{ms}"><p:fade/></p:transition></mc:Choice>'
                '<mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>')
    if kind == "doors":
        return ('<mc:AlternateContent><mc:Choice Requires="p14">'
                f'<p:transition spd="slow" p14:dur="{ms}"><p14:doors dir="vert"/></p:transition></mc:Choice>'
                '<mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>')
    if kind == "none":
        return ""
    raise ValueError(kind)


# --------------------------------------------------------------------------- slide assembly
@dataclass
class Slide:
    ctx: Ctx
    layout: int = 1
    bg: str = "160F1C"
    nodes: list = field(default_factory=list)
    timing: Timing = field(default_factory=Timing)
    trans: str = "fade"
    trans_ms: int = 1200
    notes: str = ""

    def add(self, n: Node) -> Node:
        self.nodes.append(n)
        return n

    def xml(self) -> str:
        return (HDR + f'<p:sld {NS_SLD}><p:cSld><p:bg><p:bgPr>{solid(self.bg)}<a:effectLst/></p:bgPr></p:bg><p:spTree>'
                '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
                '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
                + "".join(n.xml for n in self.nodes) +
                '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>'
                + transition(self.trans, self.trans_ms) + self.timing.xml() + '</p:sld>')

    def rels_xml(self) -> str:
        rows = [f'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout{self.layout}.xml"/>']
        for rid, typ, tgt, ext in self.ctx.rels:
            m = ' TargetMode="External"' if ext else ""
            rows.append(f'<Relationship Id="{rid}" Type="{typ}" Target="{escape(tgt)}"{m}/>')
        rows.append(f'<Relationship Id="rId{len(self.ctx.rels) + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide{{N}}.xml"/>')
        return HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + "".join(rows) + "</Relationships>"


# --------------------------------------------------------------------------- package parts
def theme_xml(name, major, minor, colors: dict) -> str:
    c = colors
    def s(tag, v):
        return f'<a:{tag}><a:srgbClr val="{v}"/></a:{tag}>'
    return (HDR + f'<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="{escape(name)}"><a:themeElements>'
            f'<a:clrScheme name="{escape(name)}">' + s("dk1", c["dk1"]) + s("lt1", c["lt1"]) + s("dk2", c["dk2"]) + s("lt2", c["lt2"])
            + "".join(s(f"accent{i}", c[f"accent{i}"]) for i in range(1, 7)) + s("hlink", c["hlink"]) + s("folHlink", c["folHlink"]) + '</a:clrScheme>'
            f'<a:fontScheme name="{escape(name)}"><a:majorFont><a:latin typeface="{major}"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>'
            f'<a:minorFont><a:latin typeface="{minor}"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>'
            '<a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>'
            '<a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>'
            '<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>'
            '<a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>'
            '</a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>')


def master_xml(display, body, fg, ) -> str:
    title = (f'<p:sp><p:nvSpPr><p:cNvPr id="2" name="Title Placeholder 1"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr>'
             f'<p:spPr>{xfrm(0.9, 0.7, 11.5, 1.6)}<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>'
             '<p:txBody><a:bodyPr lIns="0" tIns="0" rIns="0" bIns="0" anchor="t"><a:noAutofit/></a:bodyPr><a:lstStyle/>'
             '<a:p><a:r><a:rPr lang="en-IN"/><a:t>Click to edit title</a:t></a:r></a:p></p:txBody></p:sp>')
    lvl = (f'<a:lvl1pPr algn="l"><a:lnSpc><a:spcPct val="95000"/></a:lnSpc><a:spcBef><a:spcPts val="0"/></a:spcBef><a:buNone/>'
           f'<a:defRPr sz="4400" b="1" kern="1200"><a:solidFill><a:srgbClr val="{fg}"/></a:solidFill><a:latin typeface="{display}"/><a:ea typeface="{display}"/><a:cs typeface="{display}"/></a:defRPr></a:lvl1pPr>')
    other = (f'<a:lvl1pPr marL="0" algn="l"><a:buNone/><a:defRPr sz="2000" kern="1200"><a:solidFill><a:srgbClr val="{fg}"/></a:solidFill>'
             f'<a:latin typeface="{body}"/><a:ea typeface="{body}"/><a:cs typeface="{body}"/></a:defRPr></a:lvl1pPr>')
    return (HDR + f'<p:sldMaster {NS}><p:cSld><p:bg><p:bgPr>{solid("160F1C")}<a:effectLst/></p:bgPr></p:bg><p:spTree>'
            '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
            + title + '</p:spTree></p:cSld>'
            '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>'
            '<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/><p:sldLayoutId id="2147483650" r:id="rId2"/></p:sldLayoutIdLst>'
            f'<p:txStyles><p:titleStyle>{lvl}</p:titleStyle><p:bodyStyle>{other}</p:bodyStyle><p:otherStyle>{other}</p:otherStyle></p:txStyles></p:sldMaster>')


def layout_xml(name, bg, fg) -> str:
    title = ('<p:sp><p:nvSpPr><p:cNvPr id="2" name="Title 1"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr><p:spPr/>'
             '<p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-IN"/><a:t>Click to edit title</a:t></a:r></a:p></p:txBody></p:sp>')
    return (HDR + f'<p:sldLayout {NS} preserve="1" userDrawn="1"><p:cSld name="{escape(name)}"><p:bg><p:bgPr>{solid(bg)}<a:effectLst/></p:bgPr></p:bg><p:spTree>'
            '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
            + title + '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>')


def notes_master_xml() -> str:
    return (HDR + f'<p:notesMaster {NS}><p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg><p:spTree>'
            '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
            '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Slide Image Placeholder 1"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg" idx="2"/></p:nvPr></p:nvSpPr>'
            '<p:spPr><a:xfrm><a:off x="685800" y="1143000"/><a:ext cx="5486400" cy="3086100"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln w="12700"><a:solidFill><a:prstClr val="black"/></a:solidFill></a:ln></p:spPr></p:sp>'
            '<p:sp><p:nvSpPr><p:cNvPr id="3" name="Notes Placeholder 2"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" sz="quarter" idx="3"/></p:nvPr></p:nvSpPr>'
            '<p:spPr><a:xfrm><a:off x="685800" y="4400550"/><a:ext cx="5486400" cy="3600450"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>'
            '<p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-IN"/><a:t>Click to edit Master text styles</a:t></a:r></a:p></p:txBody></p:sp>'
            '</p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>'
            '<p:notesStyle><a:lvl1pPr marL="0" algn="l"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/></a:defRPr></a:lvl1pPr></p:notesStyle></p:notesMaster>')


def notes_slide_xml(text_: str) -> str:
    ps = "".join(f'<a:p><a:r><a:rPr lang="en-IN" dirty="0"/><a:t>{escape(t)}</a:t></a:r></a:p>' for t in text_.split("\n"))
    return (HDR + f'<p:notes {NS}><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
            '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Slide Image Placeholder 1"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg"/></p:nvPr></p:nvSpPr><p:spPr/></p:sp>'
            f'<p:sp><p:nvSpPr><p:cNvPr id="3" name="Notes Placeholder 2"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>{ps}</p:txBody></p:sp>'
            '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>')


def write_package(path, slides: list[Slide], media: dict[str, bytes], theme: dict, title: str, author: str):
    """media: {'image1.jpg': bytes}. Slide image rel targets must be '../media/<name>'."""
    n = len(slides)
    ct = ['<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
          '<Default Extension="xml" ContentType="application/xml"/>',
          '<Default Extension="jpg" ContentType="image/jpeg"/>', '<Default Extension="jpeg" ContentType="image/jpeg"/>',
          '<Default Extension="png" ContentType="image/png"/>',
          '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
          '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>',
          '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>',
          '<Override PartName="/ppt/slideLayouts/slideLayout2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>',
          '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>',
          '<Override PartName="/ppt/theme/theme2.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>',
          '<Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/>',
          '<Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>',
          '<Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>',
          '<Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>',
          '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
          '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>']
    for i in range(1, n + 1):
        ct.append(f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>')
        ct.append(f'<Override PartName="/ppt/notesSlides/notesSlide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>')
    R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    pres_rels = [f'<Relationship Id="rId1" Type="{R}/slideMaster" Target="slideMasters/slideMaster1.xml"/>',
                 f'<Relationship Id="rId2" Type="{R}/notesMaster" Target="notesMasters/notesMaster1.xml"/>']
    for i in range(1, n + 1):
        pres_rels.append(f'<Relationship Id="rId{i + 2}" Type="{R}/slide" Target="slides/slide{i}.xml"/>')
    base = n + 2
    pres_rels += [f'<Relationship Id="rId{base + 1}" Type="{R}/presProps" Target="presProps.xml"/>',
                  f'<Relationship Id="rId{base + 2}" Type="{R}/viewProps" Target="viewProps.xml"/>',
                  f'<Relationship Id="rId{base + 3}" Type="{R}/theme" Target="theme/theme1.xml"/>',
                  f'<Relationship Id="rId{base + 4}" Type="{R}/tableStyles" Target="tableStyles.xml"/>']
    sld_ids = "".join(f'<p:sldId id="{255 + i}" r:id="rId{i + 2}"/>' for i in range(1, n + 1))
    presentation = (HDR + f'<p:presentation {NS} saveSubsetFonts="1"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>'
                    f'<p:notesMasterIdLst><p:notesMasterId r:id="rId2"/></p:notesMasterIdLst><p:sldIdLst>{sld_ids}</p:sldIdLst>'
                    f'<p:sldSz cx="{E(SLIDE_W)}" cy="{E(SLIDE_H)}"/><p:notesSz cx="6858000" cy="9144000"/>'
                    '<p:defaultTextStyle><a:lvl1pPr marL="0" algn="l"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl1pPr></p:defaultTextStyle></p:presentation>')
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", HDR + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' + "".join(ct) + "</Types>")
        z.writestr("_rels/.rels", HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                   f'<Relationship Id="rId1" Type="{R}/officeDocument" Target="ppt/presentation.xml"/>'
                   '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
                   f'<Relationship Id="rId3" Type="{R}/extended-properties" Target="docProps/app.xml"/></Relationships>')
        z.writestr("docProps/core.xml", HDR + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
                   f'<dc:title>{escape(title)}</dc:title><dc:creator>{escape(author)}</dc:creator></cp:coreProperties>')
        z.writestr("docProps/app.xml", HDR + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Microsoft Office PowerPoint</Application>'
                   f'<PresentationFormat>Widescreen</PresentationFormat><Slides>{n}</Slides></Properties>')
        z.writestr("ppt/presentation.xml", presentation)
        z.writestr("ppt/_rels/presentation.xml.rels", HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + "".join(pres_rels) + "</Relationships>")
        z.writestr("ppt/presProps.xml", HDR + f'<p:presentationPr {NS}/>')
        z.writestr("ppt/viewProps.xml", HDR + f'<p:viewPr {NS}><p:normalViewPr><p:restoredLeft sz="15620"/><p:restoredTop sz="94660"/></p:normalViewPr><p:slideViewPr><p:cSldViewPr><p:cViewPr><p:scale><a:sx n="100" d="100"/><a:sy n="100" d="100"/></p:scale><p:origin x="0" y="0"/></p:cViewPr><p:guideLst/></p:cSldViewPr></p:slideViewPr><p:gridSpacing cx="72008" cy="72008"/></p:viewPr>')
        z.writestr("ppt/tableStyles.xml", HDR + '<a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>')
        th = theme_xml(theme["name"], theme["major"], theme["minor"], theme["colors"])
        z.writestr("ppt/theme/theme1.xml", th)
        z.writestr("ppt/theme/theme2.xml", th)
        z.writestr("ppt/slideMasters/slideMaster1.xml", master_xml(theme["major"], theme["minor"], "F6F1E9"))
        z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                   f'<Relationship Id="rId1" Type="{R}/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="{R}/slideLayout" Target="../slideLayouts/slideLayout2.xml"/>'
                   f'<Relationship Id="rId3" Type="{R}/theme" Target="../theme/theme1.xml"/></Relationships>')
        for i, (nm, bg) in enumerate((("Believing Room Dark", "160F1C"), ("Believing Room Ivory", "F6F1E9")), 1):
            z.writestr(f"ppt/slideLayouts/slideLayout{i}.xml", layout_xml(nm, bg, "F6F1E9"))
            z.writestr(f"ppt/slideLayouts/_rels/slideLayout{i}.xml.rels", HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                       f'<Relationship Id="rId1" Type="{R}/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>')
        z.writestr("ppt/notesMasters/notesMaster1.xml", notes_master_xml())
        z.writestr("ppt/notesMasters/_rels/notesMaster1.xml.rels", HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                   f'<Relationship Id="rId1" Type="{R}/theme" Target="../theme/theme2.xml"/></Relationships>')
        for i, s in enumerate(slides, 1):
            z.writestr(f"ppt/slides/slide{i}.xml", s.xml())
            z.writestr(f"ppt/slides/_rels/slide{i}.xml.rels", s.rels_xml().replace("{N}", str(i)))
            z.writestr(f"ppt/notesSlides/notesSlide{i}.xml", notes_slide_xml(s.notes))
            z.writestr(f"ppt/notesSlides/_rels/notesSlide{i}.xml.rels", HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                       f'<Relationship Id="rId1" Type="{R}/notesMaster" Target="../notesMasters/notesMaster1.xml"/>'
                       f'<Relationship Id="rId2" Type="{R}/slide" Target="../slides/slide{i}.xml"/></Relationships>')
        for name, data in media.items():
            z.writestr(f"ppt/media/{name}", data)
