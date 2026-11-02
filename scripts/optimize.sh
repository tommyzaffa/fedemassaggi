#!/bin/bash
# Genera le versioni web (webp responsive) delle foto in img/src.
# Richiede cwebp (brew install webp) e python3 con Pillow.
set -e
cd "$(dirname "$0")/.."
SRC=img/src
OUT=img
TMP=$(mktemp -d)

# La foto del massaggio sportivo è in bianco e nero: la viriamo nei toni caldi del sito
python3 -I - "$SRC/tratt-sportivo.jpg" "$TMP/tratt-sportivo.jpg" <<'PY'
import sys
from PIL import Image, ImageOps
im = ImageOps.grayscale(Image.open(sys.argv[1]))
ImageOps.colorize(im, black="#1e1713", white="#f3e9dc", mid="#8a6f5c").save(sys.argv[2], quality=92)
PY

for f in "$SRC"/*.jpg; do
  name=$(basename "$f" .jpg)
  in="$f"; [ -f "$TMP/$name.jpg" ] && in="$TMP/$name.jpg"
  widths="640 1024 1600"
  case "$name" in motto-viso|lugano-sera) widths="640 1024 1600 2200";; esac
  for w in $widths; do
    cwebp -quiet -q 74 -m 6 -resize "$w" 0 -metadata none "$in" -o "$OUT/$name-$w.webp"
  done
done
rm -rf "$TMP"
