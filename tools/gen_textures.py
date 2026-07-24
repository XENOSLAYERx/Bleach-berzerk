#!/usr/bin/env python3
"""Generate the mod's placeholder item textures and pack icons.

Pure standard-library PNG writer (zlib + struct) so it runs anywhere
without Pillow. Produces simple, recognisable 16x16 item icons and
64x64 pack icons for Bleach: Berzerk.
"""
import os
import struct
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def write_png(path, width, height, pixels):
    """pixels: list of (r,g,b,a) rows-major, length width*height."""
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter type 0
        for x in range(width):
            r, g, b, a = pixels[y * width + x]
            raw += bytes((r, g, b, a))

    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)  # 8-bit RGBA
    idat = zlib.compress(bytes(raw), 9)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b""))


TRANSPARENT = (0, 0, 0, 0)


def blank(w, h):
    return [TRANSPARENT] * (w * h)


def px(buf, w, x, y, color):
    if 0 <= x < w and 0 <= y < w:
        buf[y * w + x] = color


def rect(buf, w, x0, y0, x1, y1, color):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            px(buf, w, x, y, color)


def gen_spirit_focus():
    w = 16
    b = blank(w, w)
    core = (170, 90, 240, 255)
    glow = (210, 160, 255, 255)
    for y in range(w):
        for x in range(w):
            dx, dy = x - 7.5, y - 7.5
            d = (dx * dx + dy * dy) ** 0.5
            if d < 4:
                b[y * w + x] = core
            elif d < 6:
                b[y * w + x] = glow
    return w, b


def gen_asauchi():
    w = 16
    b = blank(w, w)
    blade = (200, 205, 215, 255)
    edge = (240, 245, 250, 255)
    guard = (60, 60, 70, 255)
    hilt = (90, 60, 40, 255)
    # diagonal blade
    for i in range(11):
        px(b, w, 3 + i, 12 - i, blade)
        px(b, w, 3 + i, 11 - i, edge)
    rect(b, w, 2, 12, 4, 14, guard)
    rect(b, w, 1, 14, 3, 15, hilt)
    return w, b


def gen_quincy_cross():
    w = 16
    b = blank(w, w)
    c = (90, 170, 255, 255)
    g = (200, 230, 255, 255)
    rect(b, w, 7, 2, 8, 13, c)
    rect(b, w, 3, 6, 12, 7, c)
    px(b, w, 7, 2, g); px(b, w, 8, 2, g)
    return w, b


def gen_fullbring():
    w = 16
    b = blank(w, w)
    c = (80, 200, 120, 255)
    g = (170, 255, 200, 255)
    for y in range(w):
        for x in range(w):
            dx, dy = x - 7.5, y - 7.5
            d = (dx * dx + dy * dy) ** 0.5
            if 3 < d < 6:
                b[y * w + x] = c
            elif d <= 3:
                b[y * w + x] = g
    return w, b


def gen_hollow_mask():
    w = 16
    b = blank(w, w)
    bone = (240, 240, 235, 255)
    red = (200, 40, 40, 255)
    black = (20, 20, 20, 255)
    rect(b, w, 3, 3, 12, 12, bone)
    # eyes
    rect(b, w, 5, 6, 6, 8, black)
    rect(b, w, 9, 6, 10, 8, black)
    # red stripes
    rect(b, w, 3, 3, 12, 3, red)
    px(b, w, 7, 10, black); px(b, w, 8, 10, black)
    return w, b


def gen_pack_icon(rgb):
    w = 64
    b = blank(w, w)
    r, g, bl = rgb
    for y in range(w):
        for x in range(w):
            t = y / w
            b[y * w + x] = (int(r * (0.5 + t / 2)), int(g * (0.5 + t / 2)), int(bl * (0.5 + t / 2)), 255)
    # simple diagonal slash
    for i in range(w):
        px(b, w, i, min(w - 1, int(w - i * 0.9)), (255, 255, 255, 255))
        if i + 1 < w:
            px(b, w, i, min(w - 1, int(w - i * 0.9) - 1), (255, 255, 255, 255))
    return w, b


def main():
    items = {
        "spirit_focus": gen_spirit_focus,
        "asauchi": gen_asauchi,
        "quincy_cross": gen_quincy_cross,
        "fullbring_object": gen_fullbring,
        "hollow_mask": gen_hollow_mask,
    }
    for name, fn in items.items():
        w, buf = fn()
        write_png(os.path.join(ROOT, "resource_pack", "textures", "items", f"{name}.png"), w, w, buf)
        print("item texture:", name)

    w, buf = gen_pack_icon((120, 60, 180))
    write_png(os.path.join(ROOT, "resource_pack", "pack_icon.png"), w, w, buf)
    write_png(os.path.join(ROOT, "behavior_pack", "pack_icon.png"), w, w, buf)
    print("pack icons written")


if __name__ == "__main__":
    main()
