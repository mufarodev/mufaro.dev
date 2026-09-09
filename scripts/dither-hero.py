"""Bake the hero texture: python3 scripts/dither-hero.py (requires Pillow)."""

from pathlib import Path
from PIL import Image

images = Path(__file__).resolve().parent.parent / "static" / "images"
source = Image.open(images / "hero-artwork.webp").convert("RGB")
result = Image.new("RGB", source.size)
bayer = ((0, 8, 2, 10), (12, 4, 14, 6), (3, 11, 1, 9), (15, 7, 13, 5))
pixels = []

for y in range(source.height):
    for x in range(source.width):
        r, g, b = source.getpixel((x, y))
        luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
        threshold = (bayer[y % 4][x % 4] + 0.5) / 16
        # Quantize lightness, preserving the artwork's subtle color differences.
        level = int(luminance / 255 * 5 + threshold) * 255 / 5
        offset = level - luminance
        pixels.append(tuple(round(max(0, min(255, c + offset))) for c in (r, g, b)))

result.putdata(pixels)
# Lossless encoding keeps the individual dither pixels intact.
result.save(images / "hero-artwork-dithered.webp", lossless=True, method=6)
