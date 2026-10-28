"""Builds The_Believing_Room_BIT_Noida.pptx.  Run:  python src/build_deck.py

Palette, copy and imagery come from the website repo (src/app/globals.css, src/config/site.ts,
src/content/industries.ts, brand-source/*). Nothing here is fetched at build time.
"""
from __future__ import annotations

import sys
from pathlib import Path

import qrcode

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ooxml import *  # noqa: E402,F403

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "The_Believing_Room_BIT_Noida.pptx"

# ----------------------------------------------------------------------------- brand tokens (globals.css)
AUB, AUB2, BLACK = "160F1C", "1E1626", "0E0913"
PLUM, VIOLET, MAUVE, LAV = "2A1C33", "3F2C4D", "8C7A9B", "B7A9C4"
CHAMP, GOLD, DGOLD, PALE = "E3CFA8", "CBAE76", "A98A4F", "F4E6C6"
IVORY, PEARL, INK, DEEP = "F6F1E9", "EDE6DA", "1C1820", "7A5F2E"
ROSE, ORCHID = "D9B7A6", "9C86B0"  # industry accents from src/content/industries.ts

# Safe fonts: ship with Office on Windows and macOS. Brand fonts (Space Grotesk / DM Sans) are cut to fonts/static
# for anyone who wants to install them and flip these three constants.
DISPLAY, NUMERAL, BODY = "Georgia", "Cambria", "Calibri"

APPLY_URL = "https://www.thebelievingroom.com/register/candidate"  # verified live (HTTP 200) 2026-10-27
APPLY_SHORT = "thebelievingroom.com/register/candidate"

THEME = dict(
    name="The Believing Room", major=DISPLAY, minor=BODY,
    colors=dict(dk1=AUB, lt1=IVORY, dk2=AUB2, lt2=PEARL, accent1=GOLD, accent2=LAV, accent3=ROSE,
                accent4=ORCHID, accent5=VIOLET, accent6=DGOLD, hlink=CHAMP, folHlink=LAV),
)


def mix(a: str, b: str, t: float) -> str:
    """Blend hex a -> b by t."""
    ca = [int(a[i:i + 2], 16) for i in (0, 2, 4)]
    cb = [int(b[i:i + 2], 16) for i in (0, 2, 4)]
    return "".join(f"{round(x + (y - x) * t):02X}" for x, y in zip(ca, cb))


def new_slide(layout=1, bg=AUB, trans="fade", ms=1200) -> tuple[Slide, Ctx]:
    ctx = Ctx(display=DISPLAY, body=BODY)
    return Slide(ctx, layout=layout, bg=bg, trans=trans, trans_ms=ms), ctx


def T(ctx, name, x, y, w, h, text_, sz, color=IVORY, b=False, font=None, algn="l", anchor="t", lnspc=None, spc=None,
      alpha=None, title=False, link=None, wrap=True, **kw):
    """One-paragraph text box."""
    r = run(text_, sz, color, b, font=font or (DISPLAY if b else BODY), spc=spc, alpha=alpha, link=link)
    return text(ctx, name, x, y, w, h, [para(r, algn, lnspc)], anchor=anchor, title=title, wrap=wrap, **kw)


def eyebrow(ctx, name, x, y, w, label, color=CHAMP, algn="l"):
    return T(ctx, name, x, y, w, 0.35, label.upper(), 14, color, True, BODY, algn, spc=3)


# ----------------------------------------------------------------------------- shared morph objects
RIB_PATHS = {
    "rib1": [[("M", 0, 620), ("C", 220, 200, 520, 160, 1000, 420), ("L", 1000, 560), ("C", 560, 330, 260, 380, 0, 760), ("Z",)]],
    "rib2": [[("M", 0, 700), ("C", 240, 380, 560, 330, 1000, 560), ("L", 1000, 640), ("C", 580, 460, 280, 500, 0, 820), ("Z",)]],
    "rib3": [[("M", 0, 800), ("C", 300, 560, 620, 560, 1000, 760), ("L", 1000, 1000), ("L", 0, 1000), ("Z",)]],
}
RIB_FILL = {
    "dark": {"rib1": lin([(0, MAUVE, .55), (1, VIOLET, .85)], 0), "rib2": lin([(0, PALE, .85), (.5, GOLD, .85), (1, "8A6D3B", .75)], 0),
             "rib3": lin([(0, PLUM, 1), (1, AUB, 1)], 90)},
    "black": {"rib1": lin([(0, MAUVE, .40), (1, VIOLET, .70)], 0), "rib2": lin([(0, PALE, .70), (.5, GOLD, .70), (1, "8A6D3B", .60)], 0),
              "rib3": lin([(0, "1A1223", 1), (1, BLACK, 1)], 90)},
    "light": {"rib1": lin([(0, "D9CFE3", .75), (1, LAV, .60)], 0), "rib2": lin([(0, "F6E9CC", .90), (.5, CHAMP, .90), (1, GOLD, .85)], 0),
              "rib3": lin([(0, PEARL, 1), (1, "E3DACB", 1)], 90)},
}


def ribbons(slide: Slide, ctx: Ctx, mode: str, cfg) -> dict[str, Node]:
    """Three silk bands. Same names on every slide so PowerPoint's Morph carries them between slides."""
    out = {}
    for key, (x, y, w, h, *fl) in zip(("rib3", "rib1", "rib2"), (cfg[2], cfg[0], cfg[1])):
        flipH = "H" in (fl[0] if fl else "")
        flipV = "V" in (fl[0] if fl else "")
        out[key] = slide.add(shape(ctx, f"!!{key}", x, y, w, h, geom=custgeom(RIB_PATHS[key]), fill=RIB_FILL[mode][key],
                                   flipH=flipH, flipV=flipV))
    return out


def glow(slide, ctx, name, cx, cy, w, h, color, alpha):
    return slide.add(shape(ctx, name, cx - w / 2, cy - h / 2, w, h, geom=prst("ellipse"),
                           fill=rad([(0, color, alpha), (1, color, 0)])))


def cone(slide, ctx, x, w, h, alpha=.34, y=0):
    return slide.add(shape(ctx, "!!cone", x, y, w, h,
                           geom=custgeom([[("M", 440, 0), ("L", 560, 0), ("L", 1000, 1000), ("L", 0, 1000), ("Z",)]]),
                           fill=lin([(0, "F0D49C", alpha), (1, GOLD, 0)], 90)))


def signature(slide, ctx, color=CHAMP, alpha=.8):
    return slide.add(T(ctx, "Brand signature", 0.9, 6.98, 5, 0.3, "THE BELIEVING ROOM", 12, color, True, BODY, spc=4, alpha=alpha))


def thin(slide, ctx, name, x, y, w, color, alpha=.3, h=0.014):
    return slide.add(shape(ctx, name, x, y, w, h, fill=solid(color, alpha)))


# ============================================================================= SLIDES
def slide1():
    s, c = new_slide(1, AUB, trans="none")
    glow(s, c, "!!glow1", 6.67, 1.2, 15, 8.5, GOLD, .40)
    glow(s, c, "!!glow2", 1.5, 5.8, 9, 6, LAV, .20)
    cn = cone(s, c, 1.7, 9.9, 5.6, .20)
    rb = ribbons(s, c, "dark", [(-1, 5.2, 15.4, 3.4), (-1, 5.7, 15.4, 3.1, "H"), (-1, 6.4, 15.4, 2.5)])
    ban = s.add(picture(c, "Logo banner", "../media/brand-banner.jpg", 0.77, 0.45, 11.8, 3.933 + 0.0, "The Believing Room logo: a golden B with a microphone, a tie and a victory-sign hand, beside the wordmark, on a purple stage under spotlights",
                        soft=0.55))
    # sizes: banner 2172x724 (3:1) -> 11.8 x 3.933
    ph = []
    xs = [0.97, 4.87, 8.67]
    labels = [("Your Talent.", IVORY), ("Your Stage.", IVORY), ("Your Opportunity.", GOLD)]
    for x, (lab, col) in zip(xs, labels):
        ph.append(s.add(T(c, f"Tagline: {lab}", x, 4.5, 3.9 if "Opp" in lab else 3.0, 0.7, lab, 30, col, False, DISPLAY, "l", anchor="ctr")))
    for i, x in enumerate((4.27, 8.07)):  # hairline dividers between the three phrases
        s.add(shape(c, f"Divider {i + 1}", x, 4.6, 0.014, 0.46, fill=solid(GOLD, .6)))
    bit = s.add(T(c, "Occasion", 0.9, 5.5, 11.5, 0.4, "A SPEAKING SESSION AT BIT NOIDA CAMPUS", 15, CHAMP, True, BODY, "ctr", spc=5))
    tm = s.timing
    g = tm.group(auto=True)
    tm.add(g, rb["rib3"], "fade", 0, 1800)
    tm.add(g, rb["rib1"], "wipe", 200, 2400, direction="left")
    tm.add(g, rb["rib2"], "wipe", 600, 2400, direction="left")
    tm.add(g, ban, "grow", 900, 2400, scale=.93)
    tm.add(g, cn, "fade", 700, 2800)
    for i, n in enumerate(ph):
        tm.add(g, n, "wipe", 3300 + i * 700, 800, direction="left")
    tm.add(g, bit, "fade", 5600, 1000)
    s.notes = NOTES[0]
    return s


def slide2():
    s, c = new_slide(2, IVORY, trans="morph", ms=1800)
    glow(s, c, "!!glow1", 11.2, 2.2, 9, 6.2, GOLD, .20)
    glow(s, c, "!!glow2", 2.2, 5.6, 7.5, 5.2, LAV, .22)
    ribbons(s, c, "light", [(-1.5, 5.7, 16.4, 3.4, "H"), (-1.5, 6.1, 16.4, 3.0), (-1.5, 7.0, 16.4, 2.2, "H")])
    # the resume: two sheets, then fragments
    back = s.add(shape(c, "Resume sheet (back)", 1.12, 1.0, 3.9, 5.2, geom=prst("rect"), fill=solid("E6DECF"), rot=4.5,
                       fx=effects(shadow=(18, 5, 90, INK, .18))))
    page = shape(c, "Resume sheet", 0.95, 1.05, 3.9, 5.2, fill=solid("FFFFFF"), fx=effects(shadow=(24, 8, 90, INK, .22)))
    s.add(page)
    GREY = "CFC7B9"
    s.add(T(c, "Resume heading", 1.3, 1.4, 3.2, 0.4, "RÉSUMÉ", 20, "8E877B", True, BODY, spc=6))
    s.add(shape(c, "Resume name bar", 1.3, 2.0, 2.3, 0.2, fill=solid("A59E92")))
    rows = [(2.5, 3.2, "CAPTION"), (3.4, 3.0, ""), (4.1, 2.9, ""), (4.8, 3.1, "")]
    for y, w, _ in rows:
        s.add(shape(c, "Resume line", 1.3, y, 0.9, 0.12, fill=solid("B5AD9F")))
        s.add(shape(c, "Resume line", 1.3, y + 0.24, w, 0.1, fill=solid(GREY)))
        s.add(shape(c, "Resume line", 1.3, y + 0.44, w * .8, 0.1, fill=solid(GREY)))
    sweep = s.add(shape(c, "Gold sweep over the resume", 0.45, 3.35, 4.9, 0.55, geom=prst("parallelogram", {"adj": 30000}),
                        fill=lin([(0, PALE, .92), (.5, GOLD, .92), (1, "8A6D3B", .85)], 0), rot=-7,
                        fx=effects(shadow=(14, 4, 90, DEEP, .35))))
    s.add(eyebrow(c, "Eyebrow", 5.75, 0.95, 6.5, "Before we begin", DEEP))
    head = s.add(text(c, "Headline", 5.75, 1.4, 7.1, 2.55,
                      [para([run("You are more than what’s written on your ", 46, INK, True, font=DISPLAY),
                             run("résumé.", 46, DEEP, True, font=DISPLAY)], lnspc=92)], title=True))
    lead = s.add(T(c, "Lead-in", 5.75, 4.1, 6.5, 0.4, "WHAT A RÉSUMÉ LEAVES OUT", 14, "6B6258", True, BODY, spc=3))
    items = ["The app you built at 2 a.m.", "How you explain what you know.", "The idea you can’t let go of."]
    it = []
    for i, tx in enumerate(items):
        y = 4.62 + i * 0.72
        dot = shape(c, f"Marker {i + 1}", 5.78, y + 0.17, 0.2, 0.2, geom=prst("ellipse"), fill=solid(GOLD))
        t_ = T(c, f"Human line {i + 1}", 6.2, y, 6.6, 0.55, tx, 28, INK, False, DISPLAY)
        s.add(dot); s.add(t_); it.append((dot, t_))
    tm = s.timing
    g = tm.group()
    tm.add(g, sweep, "wipe", 0, 1100, direction="left")
    for i, (dot, t_) in enumerate(it):
        tm.add(g, dot, "fade", 700 + i * 650, 600)
        tm.add(g, t_, "rise", 700 + i * 650, 800, rise=.04)
    # sweep must end up covering/crossing the page only briefly; it remains as a deliberate gold strike
    s.notes = NOTES[1]
    return s


def figure(s, c, name, cx, head_y, head_d, body_w, body_h, fill, line=None, gap=0.02):
    head = shape(c, f"{name} head", cx - head_d / 2, head_y, head_d, head_d, geom=prst("ellipse"), fill=fill, line=line)
    body = shape(c, f"{name} body", cx - body_w / 2, head_y + head_d + gap, body_w, body_h, geom=prst("round2SameRect", {"adj1": 50000, "adj2": 0}), fill=fill, line=line)
    return [head, body]


def slide3():
    s, c = new_slide(1, AUB, trans="doors", ms=1600)
    glow(s, c, "!!glow1", 9.6, 3.6, 10, 7.5, GOLD, .26)
    glow(s, c, "!!glow2", 1.5, 6.0, 8, 5.5, LAV, .16)
    cn = cone(s, c, 6.9, 5.4, 4.6, .28)
    ribbons(s, c, "dark", [(-1, 6.75, 15.4, 3.3), (-1, 7.0, 15.4, 3.0, "H"), (-1, 7.25, 15.4, 2.6)])
    s.add(eyebrow(c, "Eyebrow", 0.9, 1.0, 5, "Introducing"))
    s.add(text(c, "Headline", 0.9, 1.45, 5.9, 3.0,
               [para([run("What if your next opportunity began with ", 42, IVORY, True, font=DISPLAY), run("your story?", 42, GOLD, True, font=DISPLAY)], lnspc=94)], title=True))
    s.add(T(c, "Explainer", 0.9, 4.95, 5.0, 1.3, "A live pitch show. You, a stage, and the people who hire.", 24, LAV, False, BODY, lnspc=104))
    cx = 8.95
    # stage platform
    plat = [shape(c, "Stage platform", cx - 2.7, 3.95, 5.4, 1.15, geom=prst("ellipse"), fill=lin([(0, "6B5A7A", 1), (1, PLUM, 1)], 90), line=ln(GOLD, 1, .7)),
            shape(c, "Stage light pool", cx - 2.2, 4.1, 4.4, 0.8, geom=prst("ellipse"), fill=rad([(0, PALE, .75), (1, GOLD, 0)]))]
    cand_glow = shape(c, "Candidate glow", cx - 1.2, 2.2, 2.4, 2.9, geom=prst("ellipse"), fill=rad([(0, PALE, .45), (1, GOLD, 0)]))
    cand = figure(s, c, "Candidate", cx, 2.55, 0.54, 0.95, 1.55, lin([(0, PALE, 1), (1, GOLD, 1)], 90), line=ln(None))
    stage = group(c, "Stage and candidate", plat + [cand_glow] + cand, descr="A candidate standing in a spotlight on a stage")
    # panel
    panel = []
    for i, px in enumerate((-1.45, -0.48, 0.48, 1.45)):
        panel += figure(s, c, f"Panel member {i + 1}", cx + px, 5.55, 0.4, 0.72, 0.55, lin([(0, LAV, 1), (1, MAUVE, 1)], 90))
    panel.append(shape(c, "Panel desk", cx - 2.3, 6.42, 4.6, 0.2, geom=prst("roundRect", {"adj": 40000}), fill=lin([(0, VIOLET, 1), (1, PLUM, 1)], 90), line=ln(GOLD, 1, .75)))
    panel_g = group(c, "Recruiter panel", panel, descr="A panel of recruiters seated at a desk facing the stage")
    # audience
    aud = []
    n = 12
    for i in range(n):
        ax = cx - 3.3 + i * (6.6 / (n - 1))
        aud += figure(s, c, f"Audience {i + 1}", ax, 6.82, 0.36, 0.62, 0.4, solid("0F0A14"), line=ln(LAV, .6, .35))
    aud_g = group(c, "Audience", aud, descr="Rows of audience members watching")
    l1 = s.add(T(c, "Label candidate", cx + 0.8, 2.85, 2.4, 0.3, "THE CANDIDATE", 14, CHAMP, True, BODY, spc=3))
    l2 = s.add(T(c, "Label panel", cx + 2.5, 5.62, 1.8, 0.3, "THE PANEL", 14, CHAMP, True, BODY, spc=3))
    for n_ in (stage, panel_g, aud_g):
        s.add(n_)
    # re-order: labels last so they sit on top
    s.nodes.remove(l1); s.nodes.remove(l2); s.nodes += [l1, l2]
    tm = s.timing
    g = tm.group()
    tm.add(g, stage, "rise", 0, 1100, rise=.05)
    tm.add(g, l1, "fade", 900, 700)
    tm.add(g, panel_g, "rise", 1100, 1000, rise=.05)
    tm.add(g, l2, "fade", 1900, 700)
    tm.add(g, aud_g, "fade", 2000, 1200)
    s.notes = NOTES[2]
    return s


def slide4():
    s, c = new_slide(1, BLACK, trans="morph", ms=1800)
    glow(s, c, "!!glow1", 4.3, 3.8, 11.5, 9.0, GOLD, .22)
    glow(s, c, "!!glow2", 11.5, 2.0, 7, 6, LAV, .16)
    cn = cone(s, c, 0.5, 7.6, 7.5, .16)
    ribbons(s, c, "black", [(-1, 5.7, 15.4, 3.9), (-1, 6.2, 15.4, 3.5), (-1, 6.9, 15.4, 2.8)])
    s.add(eyebrow(c, "Eyebrow", 0.9, 0.7, 6, "What we’ve been building"))
    burst = shape(c, "Burst glow", 0.0, 0.6, 8.6, 6.8, geom=prst("ellipse"), fill=rad([(0, PALE, .55), (.5, GOLD, .22), (1, GOLD, 0)]))
    rings = [shape(c, f"Halo ring {i + 1}", 4.2 - r, 3.75 - r, 2 * r, 2 * r, geom=prst("ellipse"), fill=NOFILL, line=ln(GOLD, 1.25, a))
             for i, (r, a) in enumerate(((2.5, .55), (3.4, .35), (4.4, .2)))]
    for r_ in [burst] + rings:
        s.add(r_)
    num = s.add(text(c, "16", 0.2, 0.55, 8.1, 6.4,
                     [para(run("16", 420, GOLD, True, font=NUMERAL, grad=lin([(0, "FFF3D6", None), (.45, GOLD, None), (1, "8A6D3B", None)], 90)), "ctr", lnspc=82)],
                     anchor="ctr", wrap=False, title=True))
    word = s.add(T(c, "Recruiters", 7.9, 2.15, 4.9, 0.95, "RECRUITERS", 44, IVORY, True, DISPLAY, spc=1.5))
    sec = s.add(T(c, "Secured", 7.9, 3.0, 4.9, 0.95, "secured.", 48, GOLD, True, DISPLAY))
    lines = [s.add(T(c, f"Promise {i + 1}", 7.9, 4.35 + i * 0.52, 5.2, 0.5, t_, 26, LAV if i < 2 else CHAMP, False, BODY))
             for i, t_ in enumerate(("Real recruiters.", "Real conversations.", "Real possibilities."))]
    note = s.add(text(c, "Qualifier", 7.9, 6.35, 5.0, 0.7, [para(run("Each recruiter makes their own decisions.", 15, LAV, font=BODY, alpha=.9)), para(run("No outcome is guaranteed.", 15, LAV, font=BODY, alpha=.9))]))
    tm = s.timing
    g = tm.group()
    tm.add(g, burst, "grow", 0, 2200, scale=.35)
    for i, r_ in enumerate(rings):
        tm.add(g, r_, "grow", 300 + i * 350, 1600, scale=.6)
    tm.add(g, num, "grow", 500, 1700, scale=.72)
    tm.add(g, word, "rise", 2000, 900, rise=.05)
    tm.add(g, sec, "rise", 2350, 900, rise=.05)
    for i, l_ in enumerate(lines):
        tm.add(g, l_, "fade", 3200 + i * 550, 800)
    tm.add(g, note, "fade", 5100, 900)
    s.notes = NOTES[3]
    return s


def illustration(kind, c, cx, cy, col):
    """Geometric marks drawn in native shapes. Centred on (cx, cy); roughly 1.7in square."""
    L = ln(col, 2.25, .95)
    soft = solid(col, .22)
    n = []
    if kind == "tech":  # stacked layers + a node: architecture
        for i, (dx, w) in enumerate(((0, 1.5), (0.22, 1.5), (-0.1, 1.5))):
            n.append(shape(c, f"Layer {i + 1}", cx - 0.75 + dx, cy - 0.15 + i * 0.4, w, 0.28, geom=prst("roundRect", {"adj": 30000}), fill=soft, line=L))
        n.append(shape(c, "Node stem", cx - 0.02, cy - 0.78, 0.04, 0.58, fill=solid(col, .95)))
        n.append(shape(c, "Node", cx - 0.17, cy - 0.98, 0.34, 0.34, geom=prst("ellipse"), fill=solid(col, .95)))
    elif kind == "fin":  # pediment + columns: structure
        n.append(shape(c, "Pediment", cx - 0.85, cy - 0.85, 1.7, 0.55, geom=prst("triangle"), fill=soft, line=L))
        for i in range(4):
            n.append(shape(c, f"Column {i + 1}", cx - 0.68 + i * 0.4, cy - 0.2, 0.17, 0.9, fill=solid(col, .9)))
        n.append(shape(c, "Base", cx - 0.9, cy + 0.78, 1.8, 0.14, fill=solid(col, .95)))
    elif kind == "sales":  # speech bubble with radiating marks: narrative
        n.append(shape(c, "Bubble", cx - 0.75, cy - 0.5, 1.5, 1.0, geom=prst("wedgeRoundRectCallout", {"adj1": -28000, "adj2": 68000, "adj3": 16667}), fill=soft, line=L))
        for i, w in enumerate((0.9, 0.62)):
            n.append(shape(c, f"Bubble line {i + 1}", cx - 0.45, cy - 0.2 + i * 0.26, w, 0.1, fill=solid(col, .9)))
        for i, (dx, dy, rot) in enumerate(((0.88, -0.72, 35), (1.02, -0.38, 5), (0.68, -0.98, 65))):
            n.append(shape(c, f"Spark {i + 1}", cx + dx - 0.15, cy + dy, 0.3, 0.045, fill=solid(col, .95), rot=rot))
    else:  # anim: trajectory + frames: motion
        pts = [(-0.85, 0.55, .25, .18), (-0.42, -0.05, .45, .26), (0.02, -0.5, .7, .34), (0.5, -0.12, .9, .42), (0.88, 0.55, 1.0, .5)]
        n.append(shape(c, "Trajectory", cx - 0.9, cy - 0.7, 1.8, 1.3,
                       geom=custgeom([[("M", 0, 1000), ("C", 250, -250, 750, -250, 1000, 1000)]]), fill=NOFILL, line=ln(col, 1.75, .6, dash="dash")))
        for i, (dx, dy, a, d) in enumerate(pts):
            n.append(shape(c, f"Frame {i + 1}", cx + dx - d / 2, cy + dy - d / 2, d, d, geom=prst("ellipse"), fill=solid(col, a), line=ln(col, 1.5, min(1, a + .2))))
        n.append(shape(c, "Floor", cx - 1.0, cy + 0.82, 2.0, 0.05, fill=solid(col, .8)))
    return n


def slide5():
    s, c = new_slide(1, AUB, trans="fade", ms=1400)
    glow(s, c, "!!glow1", 9.0, 1.4, 11, 6.5, GOLD, .16)
    glow(s, c, "!!glow2", 2.0, 5.0, 8, 6, LAV, .14)
    ribbons(s, c, "dark", [(-1, 6.0, 15.4, 3.2, "H"), (-1, 6.35, 15.4, 2.9), (-1, 6.9, 15.4, 2.4)])
    s.add(text(c, "Headline", 0.9, 0.8, 8.2, 1.2, [para([run("Four paths. ", 46, IVORY, True, font=DISPLAY), run("One room.", 46, GOLD, True, font=DISPLAY)])], title=True))
    s.add(T(c, "Subhead", 9.3, 0.8, 3.4, 1.1, "Whatever you’re good at, there’s a way to show it.", 22, LAV, False, BODY, lnspc=100))
    defs = [("tech", "IT & Technology", "Show them how you build.", LAV, 2.55),
            ("fin", "Finance", "Make the numbers speak.", GOLD, 2.2),
            ("sales", "Sales & Marketing", "Sell the idea. Starting with yourself.", ROSE, 2.65),
            ("anim", "Animation & Multimedia", "Let the work move them.", ORCHID, 2.3)]
    groups = []
    W, GAP, X0, BOT = 2.78, 0.28, 0.78, 7.12
    for i, (kind, name, tag, col, top) in enumerate(defs):
        x, h = X0 + i * (W + GAP), BOT - top
        parts = []
        top_c, bot_c = mix(PLUM, col, .10), mix(AUB, col, .52)
        parts.append(shape(c, f"{name} arch", x, top, W, h, geom=prst("round2SameRect", {"adj1": 50000, "adj2": 0}),
                           fill=lin([(0, top_c, 1), (1, bot_c, 1)], 90), line=ln(col, 1.25, .85)))
        parts.append(shape(c, f"{name} inner arch", x + 0.2, top + 0.2, W - 0.4, h - 0.2, geom=prst("round2SameRect", {"adj1": 50000, "adj2": 0}),
                           fill=NOFILL, line=ln(IVORY, 0.75, .22)))
        parts += illustration(kind, c, x + W / 2, top + 1.55, mix(col, "FFFFFF", .35))
        parts.append(T(c, f"{name} title", x + 0.2, BOT - 1.95, W - 0.4, 0.95, name, 22, IVORY, True, DISPLAY, "ctr", anchor="b", lnspc=95))
        parts.append(T(c, f"{name} line", x + 0.22, BOT - 0.95, W - 0.44, 0.7, tag, 16, IVORY, False, BODY, "ctr", lnspc=98, alpha=.92))
        groups.append(group(c, f"Path: {name}", parts, descr=f"{name}: {tag}"))
    for g_ in groups:
        s.add(g_)
    tm = s.timing
    g = tm.group()
    for i, g_ in enumerate(groups):
        tm.add(g, g_, "rise", i * 420, 1000, rise=.06)
    s.notes = NOTES[4]
    return s


def bez(x0, y0, x1, y1, k=.5):
    dx = (x1 - x0) * k
    return [("M", x0, y0), ("C", x0 + dx, y0, x1 - dx, y1, x1, y1)]


def segment_shape(c, name, p0, p1, line):
    x0, y0 = p0; x1, y1 = p1
    left, top = min(x0, x1), min(y0, y1)
    w, h = abs(x1 - x0), max(abs(y1 - y0), 0.01)
    sx, sy = 1000 / w, 1000 / h
    path = [[("M", (x0 - left) * sx, (y0 - top) * sy),
             ("C", (x0 + (x1 - x0) * .5 - left) * sx, (y0 - top) * sy, (x0 + (x1 - x0) * .5 - left) * sx, (y1 - top) * sy, (x1 - left) * sx, (y1 - top) * sy)]]
    return shape(c, name, left, top, w, h, geom=custgeom(path), fill=NOFILL, line=line)


def slide6():
    s, c = new_slide(1, AUB, trans="morph", ms=1600)
    glow(s, c, "!!glow1", 10.5, 2.2, 10, 6.5, GOLD, .18)
    glow(s, c, "!!glow2", 1.5, 5.5, 8, 6, LAV, .14)
    ribbons(s, c, "dark", [(-1, 6.1, 15.4, 3.3), (-1, 6.5, 15.4, 3.0, "H"), (-1, 7.0, 15.4, 2.4)])
    s.add(eyebrow(c, "Eyebrow", 0.9, 0.7, 6, "How it works"))
    s.add(text(c, "Headline", 0.9, 1.1, 7.4, 1.9, [para(run("Your path to the", 46, IVORY, True, font=DISPLAY), lnspc=92),
                                                  para(run("spotlight.", 46, GOLD, True, font=DISPLAY), lnspc=92)], title=True))
    P = [(1.2, 5.3), (3.75, 4.6), (6.3, 3.95), (8.85, 3.25), (11.2, 2.5)]
    steps = [("Apply", "Tell us what you can do."), ("Shortlist", "Our team reviews applications."), ("Pitch", "Present live, then take the panel’s questions."),
             ("Recruiter Evaluation", "Each recruiter decides for themselves."), ("Potential Opportunity", "An internship or early-career role, possibly.")]
    for i in range(4):  # faint guide path, always visible
        s.add(segment_shape(c, f"Guide {i + 1}", P[i], P[i + 1], ln(LAV, 2, .28, dash="sysDash")))
    gold = lin([(0, PALE, 1), (1, GOLD, 1)], 0)
    segs = [s.add(segment_shape(c, f"Path {i + 1}", P[i], P[i + 1], ln(None, 6, grad=gold))) for i in range(4)]
    nodes, labels = [], []
    for i, ((x, y), (t_, d_)) in enumerate(zip(P, steps)):
        r = 0.34 if i < 4 else 0.46
        halo = shape(c, f"Node {i + 1} halo", x - r * 2, y - r * 2, r * 4, r * 4, geom=prst("ellipse"), fill=rad([(0, GOLD, .45), (1, GOLD, 0)]))
        if i < 4:
            disc = shape(c, f"Node {i + 1}", x - r, y - r, 2 * r, 2 * r, geom=prst("ellipse"), fill=lin([(0, PALE, 1), (1, GOLD, 1)], 90), line=ln(AUB, 2.5, 1),
                         paras=[para(run(str(i + 1), 24, AUB, True, font=NUMERAL), "ctr")], anchor="ctr")
        else:
            disc = shape(c, f"Node {i + 1}", x - r, y - r, 2 * r, 2 * r, geom=prst("star4", {"adj": 22000}), fill=lin([(0, "FFFFFF", 1), (1, GOLD, 1)], 90), line=ln(None))
        nodes.append(group(c, f"Step {i + 1} marker", [halo, disc]))
        lw = 2.4
        labels.append(text(c, f"Step {i + 1} label", (10.72 if i == 4 else x - 0.34), y + 0.62, (2.4 if i == 4 else 2.0 if i == 3 else lw), 1.5,
                           [para(run(t_, 24, IVORY, True, font=DISPLAY), "l", 92), para(run(d_, 17, LAV, False, font=BODY), "l", 98, bef=5)], anchor="t"))
    for n_ in nodes + labels:
        s.add(n_)
    foot = s.add(T(c, "Qualifier", 6.0, 6.4, 6.85, 0.35, "Recruiters make their own selection decisions. No outcome is guaranteed.", 15, LAV, False, BODY, "r", alpha=.9))
    tm = s.timing
    g1 = tm.group()
    tm.add(g1, nodes[0], "grow", 0, 700, scale=.5); tm.add(g1, labels[0], "fade", 200, 700)
    tm.add(g1, segs[0], "wipe", 500, 900, direction="left")
    tm.add(g1, nodes[1], "grow", 1350, 700, scale=.5); tm.add(g1, labels[1], "fade", 1500, 700)
    tm.add(g1, segs[1], "wipe", 1900, 900, direction="left")
    tm.add(g1, nodes[2], "grow", 2750, 700, scale=.5); tm.add(g1, labels[2], "fade", 2900, 700)
    g2 = tm.group()
    tm.add(g2, segs[2], "wipe", 0, 900, direction="left")
    tm.add(g2, nodes[3], "grow", 850, 700, scale=.5); tm.add(g2, labels[3], "fade", 1000, 700)
    tm.add(g2, segs[3], "wipe", 1500, 900, direction="left")
    tm.add(g2, nodes[4], "grow", 2350, 900, scale=.4); tm.add(g2, labels[4], "fade", 2500, 800)
    tm.add(g2, foot, "fade", 3300, 700)
    s.notes = NOTES[5]
    return s


def slide7():
    s, c = new_slide(2, IVORY, trans="fade", ms=1400)
    glow(s, c, "!!glow1", 10.5, 3.0, 9, 6, GOLD, .18)
    glow(s, c, "!!glow2", 1.5, 6.0, 7, 5, LAV, .22)
    ribbons(s, c, "light", [(-1.5, 5.6, 16.4, 3.6, "H"), (-1.5, 6.0, 16.4, 3.3, "H"), (-1.5, 7.0, 16.4, 2.2)])
    s.add(text(c, "Headline", 0.9, 0.95, 5.8, 2.3,
               [para(run("More than", 52, INK, True, font=DISPLAY), lnspc=90), para([run("an ", 52, INK, True, font=DISPLAY), run("internship.", 52, DEEP, True, font=DISPLAY)], lnspc=90)], title=True))
    s.add(T(c, "Message", 0.9, 3.45, 4.9, 1.2, "The point is to be seen, not just screened.", 26, "3B3440", False, DISPLAY, lnspc=100))
    s.add(T(c, "Qualifier", 0.9, 5.2, 4.6, 0.9, "Experiences vary by candidate. Nothing here is guaranteed; recruiters make their own decisions.", 15, "5E5666", False, BODY, lnspc=100))
    rows = [("A stage", "to show what you can do."), ("Recruiters", "who see it first-hand."), ("Practice", "presenting your ideas under real questions."),
            ("Feedback", "and connections worth keeping."), ("A possible path", "to an internship or early-career role.")]
    nodes = []
    for i, (a, b_) in enumerate(rows):
        y = 0.95 + i * 1.12
        parts = [shape(c, f"Row {i + 1} rule", 6.75, y, 5.85, 0.014, fill=solid(INK, .22)),
                 shape(c, f"Row {i + 1} dot", 6.75, y + 0.3, 0.17, 0.17, geom=prst("ellipse"), fill=solid(GOLD)),
                 text(c, f"Row {i + 1} text", 7.15, y + 0.12, 5.5, 0.98,
                      [para(run(a, 30, INK, True, font=DISPLAY), lnspc=92), para(run(b_, 21, "4A4252", False, font=BODY), lnspc=98, bef=2)])]
        nodes.append(group(c, f"Benefit {i + 1}", parts))
    for n_ in nodes:
        s.add(n_)
    s.add(shape(c, "Closing rule", 6.75, 0.95 + 5 * 1.12, 5.85, 0.014, fill=solid(INK, .22)))
    tm = s.timing
    g = tm.group()
    for i, n_ in enumerate(nodes):
        tm.add(g, n_, "rise", i * 520, 850, rise=.04)
    s.notes = NOTES[6]
    return s


def slide8():
    s, c = new_slide(1, AUB, trans="fade", ms=1600)
    glow(s, c, "!!glow1", 3.4, 3.7, 9, 8, GOLD, .26)
    glow(s, c, "!!glow2", 11.5, 5.5, 8, 6, LAV, .14)
    ribbons(s, c, "dark", [(-1, 5.35, 15.4, 3.4), (-1, 5.75, 15.4, 3.1, "H"), (-1, 6.5, 15.4, 2.4)])
    s.add(shape(c, "Outer arch", 0.74, 0.42, 5.2, 6.7, geom=prst("round2SameRect", {"adj1": 50000, "adj2": 0}), fill=NOFILL, line=ln(GOLD, 1, .4)))
    s.add(picture(c, "Emblem in arch", "../media/brand-emblem.jpg", 0.98, 0.7, 4.72, 6.1,
                  "The Believing Room emblem: a golden letter B with a microphone, a tie and a hand making a victory sign, on a purple stage",
                  crop=(0.085, 0, 0.145, 0), geom=prst("round2SameRect", {"adj1": 50000, "adj2": 0}), line=ln(GOLD, 1.75, .9)))
    s.add(eyebrow(c, "Eyebrow", 6.75, 1.1, 6.2, "BIT Noida Campus · Where we started"))
    t1 = s.add(text(c, "Headline", 6.75, 1.65, 6.1, 2.0, [para(run("It started with students like us.", 42, IVORY, True, font=DISPLAY), lnspc=96)], title=True))
    t2 = s.add(text(c, "Second line", 6.75, 3.95, 5.9, 2.4, [para(run("Now we’re building a stage for students like you.", 42, GOLD, True, font=DISPLAY), lnspc=96)]))
    tm = s.timing
    g0 = tm.group(auto=True)
    tm.add(g0, t1, "wipe", 400, 1400, direction="left")
    g = tm.group()
    tm.add(g, t2, "wipe", 0, 1500, direction="left")
    s.notes = NOTES[7]
    return s


def qr_shape(c, name, x, y, size, url, color=AUB):
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, box_size=1, border=0)
    q.add_data(url)
    q.make(fit=True)
    m = q.get_matrix()
    n = len(m)
    sub = []
    for r, row in enumerate(m):  # merge horizontal runs
        cx_ = 0
        while cx_ < n:
            if row[cx_]:
                e = cx_
                while e < n and row[e]:
                    e += 1
                sub.append([("M", cx_, r), ("L", e, r), ("L", e, r + 1), ("L", cx_, r + 1), ("Z",)])
                cx_ = e
            else:
                cx_ += 1
    k = 1000 / n
    sub = [[tuple([cmd[0]] + [v * k for v in cmd[1:]]) for cmd in sp] for sp in sub]
    return shape(c, name, x, y, size, size, geom=custgeom(sub), fill=solid(color),
                 descr=f"QR code linking to {url}"), n


def slide9():
    s, c = new_slide(1, AUB, trans="morph", ms=1800)
    glow(s, c, "!!glow1", 4.0, 3.2, 10, 8, GOLD, .22)
    glow(s, c, "!!glow2", 11.0, 3.6, 8, 7, LAV, .16)
    ribbons(s, c, "dark", [(-1, 5.5, 15.4, 3.2), (-1, 5.9, 15.4, 3.0, "H"), (-1, 6.55, 15.4, 2.3)])
    ring = s.add(shape(c, "Emblem ring", 0.88, 0.62, 1.56, 1.56, geom=prst("ellipse"), fill=NOFILL, line=ln(GOLD, 2, .9)))
    s.add(picture(c, "Emblem", "../media/brand-emblem.jpg", 0.94, 0.68, 1.44, 1.44, "The Believing Room emblem", geom=prst("ellipse")))
    s.add(T(c, "Wordmark", 2.7, 0.95, 5, 0.4, "THE BELIEVING ROOM", 20, CHAMP, True, BODY, spc=5))
    s.add(T(c, "Brand line", 2.7, 1.38, 5, 0.4, "Where Opportunity Meets Belief.", 18, LAV, False, BODY))
    head = s.add(text(c, "Headline", 0.9, 2.3, 6.6, 3.0,
                      [para(run("Your story", 62, IVORY, True, font=DISPLAY), lnspc=90), para(run("deserves an", 62, IVORY, True, font=DISPLAY), lnspc=90),
                       para(run("audience.", 62, GOLD, True, font=DISPLAY), lnspc=90)], title=True))
    cta = s.add(shape(c, "Call to action", 0.9, 5.45, 4.1, 0.9, geom=prst("roundRect", {"adj": 50000}), fill=lin([(0, PALE, 1), (1, GOLD, 1)], 90),
                      fx=effects(shadow=(22, 6, 90, "000000", .45)), link=APPLY_URL,
                      paras=[para(run("Apply to pitch", 28, AUB, True, font=DISPLAY), "ctr")], anchor="ctr"))
    url = s.add(T(c, "URL", 0.9, 6.55, 6.4, 0.4, APPLY_SHORT, 22, CHAMP, False, BODY, link=APPLY_URL))
    label = s.add(eyebrow(c, "Scan label", 8.05, 0.78, 4.5, "Scan to apply", CHAMP, "ctr"))
    card = s.add(shape(c, "QR card", 8.05, 1.25, 4.5, 4.5, geom=prst("roundRect", {"adj": 5000}), fill=solid("FFFFFF"), fx=effects(glow=(18, GOLD, .35), shadow=(24, 8, 90, "000000", .5))))
    qr, nmod = qr_shape(c, "QR code", 8.05 + 0.3, 1.25 + 0.3, 3.9, APPLY_URL)
    s.add(qr)
    cap = s.add(T(c, "Scan note", 8.05, 5.95, 4.5, 0.4, "Point your phone camera at the code.", 17, LAV, False, BODY, "ctr"))
    tm = s.timing
    g = tm.group(auto=True)
    tm.add(g, label, "fade", 200, 900)
    tm.add(g, card, "grow", 300, 1300, scale=.9)
    tm.add(g, qr, "fade", 900, 900)
    tm.add(g, head, "wipe", 700, 1400, direction="left")
    tm.add(g, cta, "rise", 2000, 900, rise=.04)
    tm.add(g, url, "fade", 2500, 800)
    tm.add(g, cap, "fade", 2700, 800)
    s.notes = NOTES[8]
    return s


NOTES = [
    # 1
    "Walk on while the opening plays; it runs by itself, about six seconds. Let the logo land before you speak.\n"
    "Open warmly: \"Good morning. We're the founders of The Believing Room, and this is our college.\"\n"
    "Read the three lines slowly: Your Talent. Your Stage. Your Opportunity.\n"
    "Tell them what the next few minutes are: what we're building, why it exists, and how you can be part of it. Keep it under a minute.",
    # 2
    "Start with a question: how many of you have sent a résumé and heard nothing back?\n"
    "Click once. The gold strike crosses the résumé and three things appear that no résumé holds.\n"
    "Say them, then personalise: the app you built at 2 a.m., how you explain things to friends, the idea you keep coming back to.\n"
    "Land the point: a page can't hold all of that. We think the people who hire should get to meet it.\n"
    "Do not criticise recruiters or claim anything about how hiring works everywhere. This is about how it feels from a student's side.",
    # 3
    "The doors open on the stage. Pause on the headline: what if your next opportunity began with your story?\n"
    "Click once; the scene builds. The candidate is in the light, the panel sits in front, the audience watches.\n"
    "Explain it in plain words: a live pitch show. You present what you can do, in your own words, and recruiters on the panel question you. It is filmed.\n"
    "If someone asks, mention that the format is inspired by the energy of live entrepreneurial pitching, adapted for students and recruitment.",
    # 4
    "This is the moment. Before you click, say: here is what we've been building. Then click once and stay quiet for the reveal; it takes about five seconds.\n"
    "Sixteen recruiters secured. Say the number, then the line: real recruiters, real conversations, real possibilities.\n"
    "Be precise about what it means: sixteen recruiters have come on board for the show. Each recruiter makes their own decisions.\n"
    "Do not say sixteen companies, sixteen internships or sixteen jobs, and do not promise offers. We have not named the recruiters on this slide because we only name them once confirmed.",
    # 5
    "Click once and the four paths rise in turn.\n"
    "Technology: show them how you build. Finance: make the numbers speak. Sales and marketing: sell the idea, starting with yourself. Animation and multimedia: let the work move them.\n"
    "Key message: talent comes in more than one shape. You do not need a perfect transcript; you need something real to show.\n"
    "Invite them to find themselves in one of the four. Do not suggest that every path has openings, or promise any particular number of roles.",
    # 6
    "Two clicks. The first draws the journey up to the pitch; the second finishes it.\n"
    "Apply: tell us what you can do. Shortlist: our team reviews applications. Pitch: you present live and take the panel's questions.\n"
    "Second click: recruiters evaluate, and each recruiter decides for themselves. Potential opportunity: possibly an internship or an early-career role.\n"
    "Read the line at the bottom aloud. Being shortlisted does not guarantee a slot, and no outcome is guaranteed. Honesty here builds trust.",
    # 7
    "Click once; the five lines rise one after another.\n"
    "Frame it bigger than an internship. A stage to show what you can do. Recruiters who see it first-hand. Practice presenting ideas under real questions. Feedback and connections worth keeping. And a possible path to an internship or early-career role.\n"
    "The line to remember: the point is to be seen, not just screened.\n"
    "These are things we are building toward; experiences vary by candidate and none is guaranteed. Say so in your own words.",
    # 8
    "Slow down. The first line appears by itself; click for the second.\n"
    "Tell the real story in two or three sentences: you sat in these seats, here is what you wished existed, and this is what you are building.\n"
    "Keep it warm and short: it started with students like us; now we're building a stage for students like you.\n"
    "We are here as alumni sharing something we are building. Do not describe BIT Noida as a partner, sponsor or endorser.",
    # 9
    "The slide builds itself and then holds. Leave it up for the rest of the session.\n"
    "Say it: your story deserves an audience. Then the one ask: scan the code and apply to pitch.\n"
    "The code and the button both open the candidate application page. Give people a few quiet seconds to scan; mention the address on screen for anyone who prefers typing.\n"
    "Close with thanks and take questions with this frame still projected.",
]


def main():
    slides = [slide1(), slide2(), slide3(), slide4(), slide5(), slide6(), slide7(), slide8(), slide9()]
    media = {p.name: p.read_bytes() for p in (ROOT / "assets").glob("brand-*.jpg")}
    write_package(OUT, slides, media, THEME, "The Believing Room: BIT Noida", "The Believing Room")
    notes = ["# The Believing Room at BIT Noida: speaker notes\n", "Target: 6 to 8 minutes. Roughly 45 to 60 seconds a slide, plus pauses.\n"]
    titles = ["The opening", "The hook", "Introducing The Believing Room", "16 recruiters", "Four paths", "How the journey works", "What students gain", "Back to where it began", "The finale"]
    for i, (t_, n_) in enumerate(zip(titles, NOTES), 1):
        notes.append(f"\n## {i}. {t_}\n")
        notes += [f"- {line}\n" for line in n_.split("\n")]
    (ROOT / "SPEAKER_NOTES.md").write_text("".join(notes), encoding="utf-8")
    print("wrote", OUT, f"({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
