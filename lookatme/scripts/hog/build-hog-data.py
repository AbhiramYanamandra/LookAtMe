"""
Builds the real data behind the HOG accelerator visuals.

    python3 -I scripts/hog/build-hog-data.py contact <cifar_bw dir> <out.png>
    python3 -I scripts/hog/build-hog-data.py build <cifar_bw dir> <expected.txt> <idx> [<idx> ...]

`contact` writes a numbered contact sheet of the images with the strongest edge
structure, for choosing which ones to show. `build` computes the HOG pipeline
for the chosen images, checks each 288-value result against the course's
reference output (expected.txt, produced by HoG/hog.py), and writes:

    public/images/hog/<idx>-{raw,norm,mag}.png   32x32 intermediates
    src/lib/hog-data-images.js                   cells, features, bins, magnitudes

The pipeline is a numpy port of HoG/hog.py: gamma x**2.5, contrast
normalisation, [-1 0 1] gradients, angle in [0, 180), 8 magnitude-weighted bins
per 8x8 cell, 2x2-cell blocks with 50% overlap, L2-normalised -> 288 features.
"""

import ast
import json
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CELL, BINS = 8, 8


def load(path):
    img = np.asarray(Image.open(path).convert("L"), dtype=float)
    # hog.py compares PIL's (32, 32) size tuple with a [32, 32] list, so it
    # always runs this same-size bicubic resize; mirror it exactly.
    img = np.asarray(Image.fromarray(img).resize([32, 32], resample=Image.BICUBIC), dtype=float)
    return img


def hog(img):
    g = img ** 2.5
    norm = (g - g.mean()) / g.std()
    grad = np.zeros((32, 32))
    mag = np.zeros((32, 32))
    dy = norm[2:, 1:-1] - norm[:-2, 1:-1]
    dx = norm[1:-1, 2:] - norm[1:-1, :-2] + 0.0001
    ang = np.arctan(dy / dx) * (180 / np.pi)
    ang[ang < 0] += 180
    grad[1:-1, 1:-1] = ang
    mag[1:-1, 1:-1] = np.sqrt(dy * dy + dx * dx)
    cells = np.zeros((4, 4, BINS))
    for i in range(4):
        for j in range(4):
            sl = (slice(i * CELL, i * CELL + CELL), slice(j * CELL, j * CELL + CELL))
            cells[i, j], _ = np.histogram(grad[sl], bins=BINS, range=(0, 180), weights=mag[sl])
    feats = []
    for i in range(3):
        for j in range(3):
            blk = cells[i : i + 2, j : j + 2]
            feats += (blk / np.linalg.norm(blk)).flatten().tolist()
    # Bin per pixel, as np.histogram assigns it (180 lands in the last bin).
    bins = np.minimum((grad / (180 / BINS)).astype(int), BINS - 1)
    return norm, grad, mag, bins, cells, np.array(feats)


def to_png(arr, path, lo=None, hi=None):
    lo = arr.min() if lo is None else lo
    hi = arr.max() if hi is None else hi
    out = np.clip((arr - lo) / (hi - lo + 1e-12), 0, 1)
    Image.fromarray((out * 255).round().astype(np.uint8), "L").save(path, optimize=True)


def contact(cifar, out):
    names = sorted(os.listdir(cifar), key=lambda n: int(n.split(".")[0]))
    scored = []
    for n in names:
        _, _, mag, _, cells, _ = hog(load(os.path.join(cifar, n)))
        # Favour images whose cell histograms are peaky (clear edges), not noise.
        peak = (cells.max(axis=2) / (cells.sum(axis=2) + 1e-9)).mean()
        scored.append((peak * np.log1p(mag.mean()), n))
    scored.sort(reverse=True)
    top = [n for _, n in scored[:60]]
    sheet = Image.new("L", (10 * 72, 6 * 84), 255)
    from PIL import ImageDraw

    d = ImageDraw.Draw(sheet)
    for k, n in enumerate(top):
        im = Image.open(os.path.join(cifar, n)).convert("L").resize((64, 64), Image.NEAREST)
        x, y = (k % 10) * 72 + 4, (k // 10) * 84 + 4
        sheet.paste(im, (x, y))
        d.text((x, y + 66), n.split(".")[0], fill=0)
    sheet.save(out)
    print(" ".join(n.split(".")[0] for n in top))


def build(cifar, expected, idxs):
    rows = np.array([ast.literal_eval(l) for l in open(expected).read().strip().split("\n")])
    os.makedirs(os.path.join(ROOT, "public/images/hog"), exist_ok=True)
    images = []
    for idx in idxs:
        norm, grad, mag, bins, cells, feats = hog(load(os.path.join(cifar, f"{idx}.bmp")))
        diffs = np.abs(rows - feats).max(axis=1)
        row = int(diffs.argmin())
        assert diffs[row] < 1e-6, f"image {idx}: no matching reference row (best {diffs[row]:.2e})"
        print(f"image {idx}: matches expected.txt row {row} (max abs diff {diffs[row]:.1e})")
        base = os.path.join(ROOT, "public/images/hog", str(idx))
        raw = np.asarray(Image.open(os.path.join(cifar, f"{idx}.bmp")).convert("L"), dtype=float)
        to_png(raw, f"{base}-raw.png", 0, 255)
        to_png(norm, f"{base}-norm.png")
        to_png(mag, f"{base}-mag.png", 0, np.percentile(mag, 99))
        images.append(
            {
                "idx": idx,
                "cells": np.round(cells / cells.max(), 3).tolist(),
                "features": np.round(feats, 4).tolist(),
                "bins": "".join(str(b) for b in bins.flatten()),
                "mag": "".join(chr(48 + int(v)) for v in np.clip(mag / np.percentile(mag, 99) * 9, 0, 9).round().flatten()),
            }
        )
    out = os.path.join(ROOT, "src/lib/hog-data-images.js")
    with open(out, "w") as f:
        f.write(
            "// Generated by scripts/hog/build-hog-data.py from the CIFAR-10 benchmark images.\n"
            "// Each image's 288 features were checked against the course reference output\n"
            "// (HoG/expected.txt) to within 1e-6. Do not edit by hand.\n"
            "//\n"
            "// cells: 4x4 cell histograms (8 bins, scaled to the image's largest bin).\n"
            "// bins: orientation bin (0-7, 22.5 deg each) per pixel, row-major.\n"
            "// mag: gradient magnitude per pixel, quantised 0-9, row-major.\n"
            f"export const HOG_IMAGES = {json.dumps(images, separators=(',', ':'))};\n"
        )
    print("wrote", out)


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "contact":
        contact(sys.argv[2], sys.argv[3])
    elif mode == "build":
        build(sys.argv[2], sys.argv[3], [int(a) for a in sys.argv[4:]])
    else:
        sys.exit(__doc__)
