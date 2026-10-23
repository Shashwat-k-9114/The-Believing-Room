"""Rebuild every derived brand asset from the untouched originals in brand-source/.

Run:  python scripts/build-brand-assets.py      (needs Pillow)

Originals are never modified. Outputs:
  public/brand/show-emblem-{640,1024}.webp  and .jpg   (Show_DP.png, downscaled only)
  public/brand/show-wordmark-{704,1408}.webp and .jpg   (Show.jpeg; the tool watermark at bottom right is retouched)
  public/brand/b-mark.svg                               (simplified B, the small-icon identity)
  src/app/icon.svg, src/app/apple-icon.png, src/app/favicon.ico, public/brand/icon-{192,512}.png,
  public/brand/icon-maskable-512.png                    (rasterised from the same B geometry)
  src/lib/og-emblem.ts                                  (small data URI of the emblem for the social preview)
Nothing is upscaled: the sources are 2048x2048 and 1408x768, and the largest output is no wider than its source.
"""
import base64, io, math, os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "brand-source")
OUT = os.path.join(ROOT, "public", "brand")
os.makedirs(OUT, exist_ok=True)


def save_pair(im, base, quality_webp=82, quality_jpg=84):
    rgb = im.convert("RGB")
    rgb.save(os.path.join(OUT, base + ".webp"), "WEBP", quality=quality_webp, method=6)
    rgb.save(os.path.join(OUT, base + ".jpg"), "JPEG", quality=quality_jpg, optimize=True, progressive=True)


# ---------------------------------------------------------------- show artwork
emb = Image.open(os.path.join(SRC, "Show_DP.png")).convert("RGB")
for w in (640, 1024):
    save_pair(emb.resize((w, w), Image.LANCZOS), f"show-emblem-{w}")

wm = Image.open(os.path.join(SRC, "Show.jpeg")).convert("RGB")
# Retouch the small four-point sparkle (an image-tool mark) at the bottom right: replace it with a blurred copy of its surroundings.
box = (1240, 600, 1330, 700)
patch = wm.crop(box).filter(ImageFilter.GaussianBlur(14))
mask = Image.new("L", (box[2] - box[0], box[3] - box[1]), 0)
ImageDraw.Draw(mask).ellipse((10, 10, 80, 90), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(8))
wm.paste(patch, box[:2], mask)
for w in (704, 1408):
    h = round(768 * w / 1408)
    save_pair(wm.resize((w, h), Image.LANCZOS) if w != 1408 else wm, f"show-wordmark-{w}")

# ---------------------------------------------------------------- LinkedIn banner (2172x724), used on /links
bn = Image.open(os.path.join(SRC, "linkedin-banner-tbr.png")).convert("RGB")
for w in (1000, 2000):
    save_pair(bn.resize((w, round(724 * w / 2172)), Image.LANCZOS), f"tbr-banner-{w}")

# ---------------------------------------------------------------- the simplified B (one geometry, SVG + raster)
OUTER = "M16 17 L23 10 H37 C46 10 51.5 14.5 51.5 21.5 C51.5 26.5 48.5 30 44 31.5 C50 33 54.5 37 54.5 43 C54.5 50.5 48.5 54 39.5 54 H16 Z"
C1 = "M25 18.5 V27.5 H35 C38.8 27.5 41 25.8 41 23 C41 20.2 38.8 18.5 35 18.5 Z"
C2 = "M25 36 V45.5 H38 C42.2 45.5 45 44 45 40.7 C45 37.5 42.2 36 38 36 Z"
B_D = f"{OUTER} {C1} {C2}"

SVG_DEFS = ('<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e0a8"/><stop offset="1" stop-color="#b78d43"/></linearGradient>'
            '<radialGradient id="bg" cx="0.5" cy="0.1" r="0.9"><stop offset="0" stop-color="#3b2252"/><stop offset="1" stop-color="#160f1c"/></radialGradient></defs>')
with open(os.path.join(ROOT, "src", "app", "icon.svg"), "w", encoding="utf-8") as f:
    f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">{SVG_DEFS}<rect width="64" height="64" rx="14" fill="url(#bg)"/><path d="{B_D}" fill="url(#g)" fill-rule="evenodd"/></svg>\n')
with open(os.path.join(OUT, "b-mark.svg"), "w", encoding="utf-8") as f:
    f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">{SVG_DEFS}<path d="{B_D}" fill="url(#g)" fill-rule="evenodd"/></svg>\n')


def sample(path):
    """Tiny SVG path sampler (M, L, H, V, C, Z; absolute) -> list of subpaths of points."""
    import re
    toks = re.findall(r"[MLHVCZ]|-?\d+\.?\d*", path)
    subs, cur, i, pos = [], [], 0, (0.0, 0.0)
    while i < len(toks):
        t = toks[i]; i += 1
        if t == "M":
            if cur: subs.append(cur)
            pos = (float(toks[i]), float(toks[i + 1])); i += 2; cur = [pos]
        elif t == "L":
            pos = (float(toks[i]), float(toks[i + 1])); i += 2; cur.append(pos)
        elif t == "H":
            pos = (float(toks[i]), pos[1]); i += 1; cur.append(pos)
        elif t == "V":
            pos = (pos[0], float(toks[i])); i += 1; cur.append(pos)
        elif t == "C":
            p = [float(x) for x in toks[i:i + 6]]; i += 6
            p0 = pos
            for s in range(1, 25):
                u = s / 24
                x = (1-u)**3*p0[0] + 3*(1-u)**2*u*p[0] + 3*(1-u)*u**2*p[2] + u**3*p[4]
                y = (1-u)**3*p0[1] + 3*(1-u)**2*u*p[1] + 3*(1-u)*u**2*p[3] + u**3*p[5]
                cur.append((x, y))
            pos = (p[4], p[5])
        elif t == "Z":
            pass
    if cur: subs.append(cur)
    return subs


def render_b(size, *, rounded, scale=1.0, ss=4):
    S = size * ss
    sc = S / 64 * scale
    off = (S - 64 * sc) / 2
    mask = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(mask)
    subs = sample(B_D)
    d.polygon([(off + x * sc, off + y * sc) for x, y in subs[0]], fill=255)
    for sub in subs[1:]:
        d.polygon([(off + x * sc, off + y * sc) for x, y in sub], fill=0)
    # background: aubergine with a soft lavender glow at the top
    bg = Image.new("RGB", (S, S), (22, 15, 28))
    px = bg.load()
    for y in range(S):
        for x in range(S):
            dx, dy = (x / S - 0.5), (y / S - 0.1)
            k = max(0.0, 1 - math.hypot(dx, dy) / 0.9)
            px[x, y] = (round(22 + 37 * k), round(15 + 19 * k), round(28 + 56 * k))
    # gold gradient fill
    gold = Image.new("RGB", (S, S))
    gp = gold.load()
    top, bot = (243, 224, 168), (183, 141, 67)
    for y in range(S):
        t = min(1, max(0, (y - off) / (64 * sc)))
        c = tuple(round(top[i] + (bot[i] - top[i]) * t) for i in range(3))
        for x in range(S):
            gp[x, y] = c
    bg.paste(gold, (0, 0), mask)
    out = bg.resize((size, size), Image.LANCZOS)
    if rounded:
        rm = Image.new("L", (S, S), 0)
        ImageDraw.Draw(rm).rounded_rectangle((0, 0, S - 1, S - 1), radius=S * 14 // 64, fill=255)
        rm = rm.resize((size, size), Image.LANCZOS)
        rgba = out.convert("RGBA")
        rgba.putalpha(rm)
        return rgba
    return out


render_b(180, rounded=False).save(os.path.join(ROOT, "src", "app", "apple-icon.png"))
render_b(192, rounded=True).save(os.path.join(OUT, "icon-192.png"))
render_b(512, rounded=True).save(os.path.join(OUT, "icon-512.png"))
render_b(512, rounded=False, scale=0.72).save(os.path.join(OUT, "icon-maskable-512.png"))
ico = [render_b(s, rounded=True) for s in (48, 32, 16)]
ico[0].save(os.path.join(ROOT, "src", "app", "favicon.ico"), format="ICO", sizes=[(48, 48), (32, 32), (16, 16)], append_images=ico[1:])
# contact sheet for eyeballing small sizes (not shipped)
sheet = Image.new("RGB", (640, 140), (244, 238, 228))
x = 10
for s in (16, 32, 48, 64, 96, 128):
    im = render_b(s, rounded=True)
    sheet.paste(im, (x, 10), im); x += s + 14
sheet.save(os.path.join(ROOT, "test-results", "icon-sheet.png")) if os.path.isdir(os.path.join(ROOT, "test-results")) else None

# ---------------------------------------------------------------- data URI for the social preview
small = emb.resize((420, 420), Image.LANCZOS)
buf = io.BytesIO()
small.save(buf, "JPEG", quality=80, optimize=True)
uri = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
with open(os.path.join(ROOT, "src", "lib", "og-emblem.ts"), "w", encoding="utf-8") as f:
    f.write("// Generated by scripts/build-brand-assets.py from brand-source/Show_DP.png. Do not edit.\n")
    f.write(f'export const OG_EMBLEM = "{uri}";\n')
print("built; og emblem bytes:", len(buf.getvalue()))
