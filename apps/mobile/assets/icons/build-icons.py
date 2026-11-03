"""Writes SYNQ's app icons as Icon Composer documents, for Liquid Glass.

    python3 build-icons.py              # every .icon, and previews/
    python3 build-icons.py --check DIR  # also every iOS appearance at 1024px in DIR/<icon>

The icon is the one 2.5.2 had, drawn in Photoshop: two arrows chasing each
other on charcoal. The arrows' shapes are traced from `icon-blue.png`, and every
icon's colors are read from its own PNG, so they look as they always have, with
the glass on top. Each arrow is its own glass layer, with the charcoal behind.

The PNGs stay as the source of the design. `synq` is the primary icon and
`icon-blue` is the same again as an alternate, under the name 2.5.2 gave it. iOS
remembers someone's choice by name, so `icon-*` names never change (README.md).
"""

from pathlib import Path
import json
import math
import shutil
import struct
import subprocess
import sys
import zlib

ROOT = Path(__file__).resolve().parent
ICTOOL = "/Applications/Xcode-27.app/Contents/Applications/Icon Composer.app/Contents/Executables/ictool"
RENDITIONS = ("Default", "Dark", "ClearLight", "ClearDark", "TintedLight", "TintedDark")
SIZE = 1024
# Settings shows each at 76 pt.
PREVIEW_SIZE = 228
SRGB = "/System/Library/ColorSync/Profiles/sRGB Profile.icc"
# The icons and the PNG each one's colors come from.
ICONS = {
    "synq": "icon-blue",
    "synq-dev": "synq-dev",
    "icon-blue": "icon-blue",
    "icon-mint": "icon-mint",
    "icon-red": "icon-red",
    "icon-yellow": "icon-yellow",
    "icon-purple": "icon-purple",
    "icon-orange": "icon-orange",
    "icon-pink": "icon-pink",
}
# Where each arrow's color is read, as (x, y): the end of its gradient at the
# top of the icon, and at the bottom. The first arrow goes from its deep tail,
# over the top, to its pale head; the second from its pale head to its deep tail.
ARROW_STOPS = (((545, 234), (238, 545)), ((787, 480), (480, 790)))
# Where the background's gradient is read.
BACKGROUND_STOPS = ((30, 30), (30, 994))
# iOS tints these, so they're the same in every icon.
TINTED_ARROWS = ("#ffffff", "#e6e6e6")
TINTED_BACKGROUND = ("#313131", "#141414")
# How far a traced outline may stray from the original, in pixels.
SIMPLIFY = 0.35
# The coverage an outline follows. Not exactly a half: coverage can land on that,
# which would put several outlines' corners on one point.
LEVEL = 0.50013


def read_png(path):
    """The rows of an 8-bit, non-interlaced PNG, as bytes per row, and its channels."""
    data = path.read_bytes()
    position, idat, width, height, kind = 8, b"", 0, 0, 0
    while position < len(data):
        length, name = struct.unpack(">I4s", data[position:position + 8])
        chunk = data[position + 8:position + 8 + length]
        if name == b"IHDR":
            width, height, depth, kind, _, _, interlace = struct.unpack(">IIBBBBB", chunk)
            assert depth == 8 and interlace == 0 and kind in (2, 6), path
        elif name == b"IDAT":
            idat += chunk
        position += 12 + length
    channels = 4 if kind == 6 else 3
    raw = zlib.decompress(idat)
    stride = width * channels
    rows, previous = [], bytes(stride)
    for y in range(height):
        start = y * (stride + 1)
        kind_of_filter, line = raw[start], bytearray(raw[start + 1:start + 1 + stride])
        for i in range(stride):
            left = line[i - channels] if i >= channels else 0
            up = previous[i]
            corner = previous[i - channels] if i >= channels else 0
            if kind_of_filter == 1:
                line[i] = (line[i] + left) & 255
            elif kind_of_filter == 2:
                line[i] = (line[i] + up) & 255
            elif kind_of_filter == 3:
                line[i] = (line[i] + (left + up) // 2) & 255
            elif kind_of_filter == 4:
                p = left + up - corner
                a, b, c = abs(p - left), abs(p - up), abs(p - corner)
                predictor = left if a <= b and a <= c else up if b <= c else corner
                line[i] = (line[i] + predictor) & 255
        previous = bytes(line)
        rows.append(previous)
    return rows, channels


def coverage_of(rows, channels):
    """Where the arrows are, 0 to 1. The background is gray, the same across each
    row, and the blue icon's arrows have a blue channel near 250, so blue's rise
    over that row's gray is the arrows' coverage, antialiasing included."""
    grid = []
    for row in rows:
        gray = row[0]
        grid.append([min(1, max(0, (row[x * channels + 2] - gray) / (250 - gray))) for x in range(len(row) // channels)])
    return grid


def trace(grid):
    """Marching squares at half coverage: closed outlines, with subpixel corners."""
    segments = {}

    def cross(a, b, ax, ay, bx, by):
        t = (LEVEL - a) / (b - a)
        return (ax + (bx - ax) * t, ay + (by - ay) * t)

    for y in range(len(grid) - 1):
        top, bottom = grid[y], grid[y + 1]
        for x in range(len(top) - 1):
            a, b, c, d = top[x], top[x + 1], bottom[x + 1], bottom[x]
            case = (a > LEVEL) * 8 + (b > LEVEL) * 4 + (c > LEVEL) * 2 + (d > LEVEL)
            if case in (0, 15):
                continue
            edge = {
                "n": lambda: cross(a, b, x, y, x + 1, y),
                "e": lambda: cross(b, c, x + 1, y, x + 1, y + 1),
                "s": lambda: cross(d, c, x, y + 1, x + 1, y + 1),
                "w": lambda: cross(a, d, x, y, x, y + 1),
            }
            pairs = {
                1: ("w", "s"), 2: ("s", "e"), 3: ("w", "e"), 4: ("e", "n"), 6: ("s", "n"),
                7: ("w", "n"), 8: ("n", "w"), 9: ("n", "s"), 11: ("n", "e"), 12: ("e", "w"),
                13: ("e", "s"), 14: ("s", "w"),
            }
            if case in (5, 10):
                first, second = (("w", "n"), ("e", "s")) if case == 5 else (("n", "e"), ("s", "w"))
                for start, end in (first, second):
                    segments[edge[start]()] = edge[end]()
                continue
            start, end = pairs[case]
            segments[edge[start]()] = edge[end]()
    loops = []
    while segments:
        start, point = segments.popitem()
        loop = [start]
        while point != start and point in segments:
            loop.append(point)
            point = segments.pop(point)
        if len(loop) > 8:
            loops.append(loop)
    return loops


def simplify(points):
    """Douglas-Peucker on an open run of points."""
    keep, stack = {0, len(points) - 1}, [(0, len(points) - 1)]
    while stack:
        first, last = stack.pop()
        (ax, ay), (bx, by) = points[first], points[last]
        dx, dy = bx - ax, by - ay
        squared = dx * dx + dy * dy or 1
        worst, at = 0, None
        for i in range(first + 1, last):
            x, y = points[i]
            # To the segment, not its line: a thin tail folds back past its ends.
            t = min(1, max(0, ((x - ax) * dx + (y - ay) * dy) / squared))
            distance = math.hypot(x - ax - t * dx, y - ay - t * dy)
            if distance > worst:
                worst, at = distance, i
        if at is not None and worst > SIMPLIFY:
            keep.add(at)
            stack += [(first, at), (at, last)]
    return [points[i] for i in sorted(keep)]


def arrow_paths():
    """The two arrows' outlines as SVG path data, the upper-left arrow first."""
    rows, channels = read_png(ROOT / "icon-blue.png")
    loops = trace(coverage_of(rows, channels))
    loops.sort(key=len, reverse=True)
    arrows = sorted(loops[:2], key=lambda loop: min(p[0] for p in loop))
    paths = []
    for loop in arrows:
        middle = len(loop) // 2
        outline = simplify(loop[:middle + 1])[:-1] + simplify(loop[middle:] + loop[:1])[:-1]
        paths.append("M " + " L ".join(f"{x:.2f} {y:.2f}" for x, y in outline) + " Z")
    return paths


def pixel(rows, channels, x, y):
    return "#" + rows[y][x * channels:x * channels + 3].hex()


def colors_of(png):
    rows, channels = read_png(ROOT / f"{png}.png")
    return {
        "arrows": [tuple(pixel(rows, channels, x, y) for x, y in stops) for stops in ARROW_STOPS],
        "background": tuple(pixel(rows, channels, x, y) for x, y in BACKGROUND_STOPS),
    }


def color(h):
    return "extended-srgb:" + ",".join(f"{int(h[i:i + 2], 16) / 255:.5f}" for i in (1, 3, 5)) + ",1.00000"


def fill(v):
    return {"linear-gradient": [color(v[0]), color(v[1])]} if isinstance(v, tuple) else {"solid": color(v)}


def document(colors):
    groups = []
    for index, gradient in enumerate(colors["arrows"]):
        groups.append({
            "name": f"Arrow {index + 1}",
            "layers": [{
                "image-name": f"arrow-{index + 1}.svg",
                "name": f"Arrow {index + 1}",
                "glass": True,
                # The usual fill must be the unqualified specialization: with a
                # plain "fill", ictool and iOS ignore the others (Vera found this).
                "fill-specializations": [
                    {"value": fill(gradient)},
                    {"appearance": "tinted", "value": fill(TINTED_ARROWS[index])},
                ],
            }],
            "shadow": {"kind": "layer-color", "opacity": .5},
            "shadow-specializations": [
                {"appearance": "dark", "value": {"kind": "neutral", "opacity": .5}},
                {"appearance": "tinted", "value": {"kind": "neutral", "opacity": .5}},
            ],
            "specular": True,
            "translucency": {"enabled": True, "value": .1},
        })
    return {
        "fill": fill(colors["background"]),
        "fill-specializations": [
            {"appearance": "tinted", "value": fill(TINTED_BACKGROUND)},
        ],
        "groups": groups,
        "supported-platforms": {"squares": "shared"},
    }


def write_bundle(name, png, paths):
    bundle = ROOT / f"{name}.icon"
    shutil.rmtree(bundle, ignore_errors=True)
    (bundle / "Assets").mkdir(parents=True)
    for index, path in enumerate(paths):
        (bundle / "Assets" / f"arrow-{index + 1}.svg").write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" viewBox="0 0 {SIZE} {SIZE}">'
            f'<path fill="#ffffff" d="{path}"/></svg>\n'
        )
    (bundle / "icon.json").write_text(json.dumps(document(colors_of(png)), indent=2) + "\n")
    return bundle


def render(bundle, rendition, output, size=SIZE):
    subprocess.run(
        [ICTOOL, str(bundle), "--export-image", "--output-file", str(output), "--platform", "iOS",
         "--rendition", rendition, "--width", str(size), "--height", str(size), "--scale", "1"]
        + (["--tint-color", ".58", "--tint-strength", "0.8"] if rendition.startswith("Tinted") else []),
        check=True, capture_output=True,
    )


def main():
    paths = arrow_paths()
    previews = ROOT / "previews"
    shutil.rmtree(previews, ignore_errors=True)
    previews.mkdir()
    for name, png in ICONS.items():
        bundle = write_bundle(name, png, paths)
        # Settings > App Icon shows the icons as they look on the home screen.
        if name.startswith("icon-"):
            output = previews / f"{name}.png"
            render(bundle, "Default", output, PREVIEW_SIZE)
            # ictool writes 16-bit Display P3; 8-bit sRGB is a third the size.
            subprocess.run(["sips", "-m", SRGB, str(output), "--out", str(output)], check=True, capture_output=True)
        if "--check" in sys.argv:
            check = Path(sys.argv[sys.argv.index("--check") + 1]) / name
            check.mkdir(parents=True, exist_ok=True)
            for rendition in RENDITIONS:
                render(bundle, rendition, check / f"{rendition}.png")
        print(name, flush=True)


if __name__ == "__main__":
    main()
