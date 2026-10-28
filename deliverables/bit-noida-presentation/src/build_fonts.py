"""Cut static Regular/Bold TTFs from the site's two variable fonts (Space Grotesk, DM Sans, both OFL).

Static files are what PowerPoint can install and embed. Output: fonts/static/*.ttf
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "fonts" / "static"
OUT.mkdir(parents=True, exist_ok=True)

JOBS = [
    ("SpaceGrotesk-VF.ttf", "Space Grotesk", [("Regular", {"wght": 400}), ("Bold", {"wght": 700})]),
    ("DMSans-VF.ttf", "DM Sans", [("Regular", {"wght": 400, "opsz": 14}), ("Bold", {"wght": 700, "opsz": 14})]),
]


def set_names(font, family, style):
    name = font["name"]
    full = f"{family} {style}".replace(" Regular", "")
    ps = f"{family.replace(' ', '')}-{style}"
    for rec in list(name.names):
        if rec.nameID in (1, 2, 3, 4, 6, 16, 17, 21, 22, 25):
            name.removeNames(nameID=rec.nameID)
    for pid, eid, lid in ((3, 1, 0x409), (1, 0, 0)):
        name.setName(family, 1, pid, eid, lid)
        name.setName(style, 2, pid, eid, lid)
        name.setName(f"{ps};static", 3, pid, eid, lid)
        name.setName(full if style != "Regular" else family, 4, pid, eid, lid)
        name.setName(ps, 6, pid, eid, lid)
    os2 = font["OS/2"]
    os2.fsType = 0  # installable embedding (OFL permits it)
    bold = style == "Bold"
    os2.usWeightClass = 700 if bold else 400
    os2.fsSelection = (os2.fsSelection & ~0x61) | (0x20 if bold else 0x40)
    font["head"].macStyle = 1 if bold else 0
    if "STAT" in font:
        del font["STAT"]


for src, family, styles in JOBS:
    for style, loc in styles:
        vf = TTFont(ROOT / "fonts" / src)
        inst = instantiateVariableFont(vf, loc, inplace=False)
        set_names(inst, family, style)
        dest = OUT / f"{family.replace(' ', '')}-{style}.ttf"
        inst.save(dest)
        print("wrote", dest.name)
