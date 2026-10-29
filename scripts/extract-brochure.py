#!/usr/bin/env python3
"""Extracts site imagery from the KSA brochure (Kat_Arabia_saudi_HQ.pdf).

Run:  python3 scripts/extract-brochure.py [path/to/brochure.pdf]
Needs poppler (pdfimages, pdftoppm) and Pillow. Writes:
  public/images/<key>.webp          photos (services, industries, HSE, KSA)
  public/images/clients/<slug>.png  client logos cropped from page 15
"""
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
PDF = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "Kat_Arabia_saudi_HQ.pdf"
OUT = ROOT / "public" / "images"

# pdfimages index -> output key. Indexes come from `pdfimages -list` on the Oct 2026 brochure.
PHOTOS = {
    1: "ksa-vision", 2: "engineers-site",
    20: "svc-civil", 21: "svc-building", 22: "svc-industrial", 23: "svc-oil-gas",
    24: "svc-mep", 25: "svc-plant", 26: "svc-facility", 27: "hse-site",
    28: "ind-infrastructure", 29: "ind-oil-gas", 30: "ind-petrochemicals", 31: "svc-energy",
    32: "ind-manufacturing", 33: "ind-mining", 34: "ind-commercial", 35: "ind-government",
    36: "ind-healthcare", 37: "ind-hospitality", 38: "ind-logistics", 39: "ind-marine",
    40: "ind-renewables", 41: "ind-smart-cities",
}

# Page 15 logo grid, row-major. Cell geometry measured at 110 dpi.
LOGOS = [
    ("aramco", "Saudi Aramco"), ("sabic", "SABIC"), ("eagle-marine", "Eagle Marine"), ("zamil", "Zamil Group"),
    ("concord-stars", "Concord Stars Contracting"), ("gazmin", "GazMin Motors"), ("apcc", "APCC"), ("sobha", "Sobha Constructions"),
    ("azizi", "Azizi"), ("torri", "Torri Contracting"), ("aroma", "Aroma International Building Contracting"), ("cylingas", "Cylingas Engineering & Construction"),
    ("general-construction", "General Construction Co."), ("shapoorji-pallonji", "Shapoorji Pallonji"), ("bahri-mazroei", "Bahri & Mazroei"), ("ace-contracting", "ACE Contracting"),
    ("larsen-toubro", "Larsen & Toubro"), ("maaden", "Ma'aden"), ("deep-seafood", "The Deep Seafood Company"), ("noon", "noon"),
    ("khansaheb", "Khansaheb Group"), ("oasis-hills", "Oasis Hills Landscape Services"), ("pacific-marine", "Pacific Marine Engineering"), ("sierra", "Sierra Contracting"),
    ("plante", "Plante"), ("gptc", "GPTC"), ("sinopec", "Sinopec"), ("petroserve", "Petroserve International"),
    ("ssangyong", "SsangYong"),
]
COL_X = [(73, 253), (275, 456), (477, 659), (679, 861)]
ROW_Y = [(406, 494), (507, 595), (608, 697), (709, 798), (810, 899), (911, 1000), (1013, 1101), (1114, 1203)]
DPI = 300


def save_photo(src: Path, key: str) -> None:
    im = Image.open(src).convert("RGB")
    max_w = 1000 if abs(im.width - im.height) < 50 else 1600
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(OUT / f"{key}.webp", "WEBP", quality=80, method=6)


def trim(im: Image.Image) -> Image.Image:
    bg = Image.new("RGB", im.size, (255, 255, 255))
    box = ImageChops.difference(im, bg).convert("L").point(lambda p: 255 if p > 18 else 0).getbbox()
    return im.crop(box) if box else im


def to_transparent(im: Image.Image) -> Image.Image:
    """Near-white becomes transparent with a soft edge; coloured panels (noon, Bahri) stay."""
    rgba = im.convert("RGBA")
    px = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = px[x, y]
            lo = min(r, g, b)
            if lo > 222:
                px[x, y] = (r, g, b, max(0, int((255 - lo) * 255 / 33)))
    return rgba


def save_logos(tmp: Path) -> None:
    subprocess.run(["pdftoppm", "-r", str(DPI), "-png", "-f", "15", "-l", "15", str(PDF), str(tmp / "p15")], check=True)
    page = Image.open(next(tmp.glob("p15*.png"))).convert("RGB")
    s = DPI / 110
    inset, corner = 12, 48
    out = OUT / "clients"
    out.mkdir(exist_ok=True)
    for i, (slug, _name) in enumerate(LOGOS):
        (x0, x1), (y0, y1) = COL_X[i % 4], ROW_Y[i // 4]
        cell = page.crop((round(x0 * s) + inset, round(y0 * s) + inset, round(x1 * s) - inset, round(y1 * s) - inset))
        # Blank the rounded corners of the dashed cell border so trim() ignores them.
        w, h = cell.size
        for cx, cy in ((0, 0), (w - corner, 0), (0, h - corner), (w - corner, h - corner)):
            cell.paste((255, 255, 255), (cx, cy, cx + corner, cy + corner))
        logo = trim(cell)
        if logo.height > 160:
            logo = logo.resize((round(logo.width * 160 / logo.height), 160), Image.LANCZOS)
        to_transparent(logo).save(out / f"{slug}.png", optimize=True)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        subprocess.run(["pdfimages", "-png", str(PDF), str(tmp / "i")], check=True)
        for idx, key in PHOTOS.items():
            save_photo(tmp / f"i-{idx:03d}.png", key)
        save_logos(tmp)
    print(f"wrote {len(PHOTOS)} photos and {len(LOGOS)} logos to {OUT}")


if __name__ == "__main__":
    main()
