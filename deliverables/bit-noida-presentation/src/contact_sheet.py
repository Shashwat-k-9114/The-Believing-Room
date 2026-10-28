"""Contact sheet: python src/contact_sheet.py <slides_dir> <out.png>   (expects slide-NN.png files)"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

src, out = Path(sys.argv[1]), Path(sys.argv[2])
files = sorted(src.glob("slide-*.png"))
cols = 3
rows = -(-len(files) // cols)
tw, th, gap, pad, label_h = 760, 428, 28, 56, 44
W = pad * 2 + cols * tw + (cols - 1) * gap
H = pad * 2 + 70 + rows * (th + label_h) + (rows - 1) * gap
sheet = Image.new("RGB", (W, H), (22, 15, 28))
d = ImageDraw.Draw(sheet)
try:
    f_big = ImageFont.truetype("georgiab.ttf", 34)
    f_small = ImageFont.truetype("calibrib.ttf", 22)
except OSError:
    f_big = f_small = ImageFont.load_default()
d.text((pad, pad - 6), "The Believing Room · BIT Noida · 9 slides", font=f_big, fill=(227, 207, 168))
for i, f in enumerate(files):
    r, c = divmod(i, cols)
    x = pad + c * (tw + gap)
    y = pad + 70 + r * (th + label_h + gap)
    im = Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS)
    sheet.paste(im, (x, y))
    d.rectangle([x - 1, y - 1, x + tw, y + th], outline=(203, 174, 118), width=1)
    d.text((x, y + th + 8), f"{i + 1:02d}", font=f_small, fill=(203, 174, 118))
sheet.save(out)
print("wrote", out, sheet.size)
