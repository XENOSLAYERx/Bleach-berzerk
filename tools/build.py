#!/usr/bin/env python3
"""Package Bleach: Berzerk into an importable .mcaddon.

A .mcaddon is simply a zip containing the behavior and resource pack
folders. Double-tapping / opening the produced file on a device with
Minecraft installed imports both packs automatically.

Usage:  python3 tools/build.py
Output: dist/BleachBerzerk.mcaddon
"""
import os
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
OUT = os.path.join(DIST, "BleachBerzerk.mcaddon")

PACKS = ["behavior_pack", "resource_pack"]
SKIP = {".git", "node_modules", "dist", "__pycache__"}


def add_dir(zf, base, arc_prefix):
    for dirpath, dirnames, filenames in os.walk(base):
        dirnames[:] = [d for d in dirnames if d not in SKIP]
        for name in filenames:
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, base)
            zf.write(full, os.path.join(arc_prefix, rel))


def main():
    os.makedirs(DIST, exist_ok=True)
    if os.path.exists(OUT):
        os.remove(OUT)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
        for pack in PACKS:
            add_dir(zf, os.path.join(ROOT, pack), pack)
    size = os.path.getsize(OUT)
    print(f"Built {OUT} ({size} bytes)")


if __name__ == "__main__":
    main()
