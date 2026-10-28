"""Static checks that do not need PowerPoint: package integrity, ids, rels, hyperlinks, QR decode, URL liveness.
Run: python src/verify.py  (after the PPTX and previews exist)"""
import re, sys, zipfile, urllib.request
from pathlib import Path
from lxml import etree
import cv2

ROOT = Path(__file__).resolve().parent.parent
PPTX = ROOT / "The_Believing_Room_BIT_Noida.pptx"
APPLY_URL = "https://www.thebelievingroom.com/register/candidate"
ok = True
def check(name, cond, detail=""):
    global ok
    ok &= bool(cond)
    print(("PASS " if cond else "FAIL ") + name + (f"  [{detail}]" if detail else ""))

z = zipfile.ZipFile(PPTX)
names = set(z.namelist())
check("zip integrity", z.testzip() is None)
bad = []
for n in names:
    if n.endswith((".xml", ".rels")):
        try: etree.fromstring(z.read(n))
        except Exception as e: bad.append((n, str(e)))
check("every XML part is well-formed", not bad, str(bad[:2]))
# relationship targets exist
missing = []
for n in names:
    if n.endswith(".rels"):
        base = Path(n).parent.parent
        for r in etree.fromstring(z.read(n)):
            if r.get("TargetMode") == "External": continue
            tgt = (base / r.get("Target")).as_posix() if not r.get("Target").startswith("/") else r.get("Target")[1:]
            tgt = str(Path(tgt)).replace("\\", "/")
            parts = []
            for seg in tgt.split("/"):
                if seg == "..": parts.pop()
                elif seg != ".": parts.append(seg)
            if "/".join(parts) not in names: missing.append((n, r.get("Target")))
check("every internal relationship target exists", not missing, str(missing[:3]))
# unique shape ids per slide
dups = []
for i in range(1, 10):
    x = z.read(f"ppt/slides/slide{i}.xml").decode()
    ids = re.findall(r'<p:cNvPr id="(\d+)"', x)
    if len(ids) != len(set(ids)): dups.append(i)
check("shape ids unique on every slide", not dups, str(dups))
# animation targets exist
tgt_bad = []
for i in range(1, 10):
    x = z.read(f"ppt/slides/slide{i}.xml").decode()
    ids = set(re.findall(r'<p:cNvPr id="(\d+)"', x))
    for sp in re.findall(r'<p:spTgt spid="(\d+)"', x):
        if sp not in ids: tgt_bad.append((i, sp))
check("every animation target resolves to a shape", not tgt_bad, str(tgt_bad[:3]))
# no external images; hyperlinks
ext = []
for n in names:
    if n.endswith(".rels"):
        for r in etree.fromstring(z.read(n)):
            if r.get("TargetMode") == "External": ext.append(r.get("Target"))
check("external references are only the apply URL", set(ext) == {APPLY_URL}, str(set(ext)))
check("no external images/media", not any("http" in (r.get("Target") or "") and "image" in (r.get("Type") or "") for n in names if n.endswith(".rels") for r in etree.fromstring(z.read(n))))
# URL liveness
try:
    code = urllib.request.urlopen(urllib.request.Request(APPLY_URL, headers={"User-Agent": "Mozilla/5.0"}), timeout=20).status
except Exception as e:
    code = str(e)
check("apply URL returns HTTP 200", code == 200, str(code))
# QR decode from the rendered final slide
img = cv2.imread(str(ROOT / "previews" / "slide-09.png"))
data, pts, _ = cv2.QRCodeDetector().detectAndDecode(img)
check("QR on slide 9 decodes to the apply URL (rendered 2560x1440 slide image)", data == APPLY_URL, repr(data))
# QR decode at reduced size (simulates a distant phone / projector)
small = cv2.resize(img, (640, 360), interpolation=cv2.INTER_AREA)
d2, _, _ = cv2.QRCodeDetector().detectAndDecode(small)
check("QR still decodes at 640x360", d2 == APPLY_URL, repr(d2))
sys.exit(0 if ok else 1)
