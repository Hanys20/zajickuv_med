"""Audit image references, dimensions and transfer sizes for the static site."""

import re
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE_EXTENSIONS = {".ts", ".tsx", ".css", ".md", ".json"}
RASTER_EXTENSIONS = {".png", ".webp", ".jpg", ".jpeg", ".gif", ".avif"}
REFERENCE_PATTERN = re.compile(r"/images/[A-Za-z0-9_./-]+\.(?:svg|png|webp|jpg|jpeg|gif|avif)")


def main() -> None:
    text = "\n".join(
        path.read_text(encoding="utf-8")
        for base in (ROOT / "src", ROOT / "content")
        for path in base.rglob("*")
        if path.is_file() and path.suffix.lower() in SOURCE_EXTENSIONS
    )
    references = sorted(set(REFERENCE_PATTERN.findall(text)))
    missing = [reference for reference in references if not (PUBLIC / reference.lstrip("/")).exists()]

    raster_rows = []
    for reference in references:
        path = PUBLIC / reference.lstrip("/")
        if path.suffix.lower() not in RASTER_EXTENSIONS or not path.exists():
            continue
        with Image.open(path) as image:
            raster_rows.append((path.stat().st_size, image.width, image.height, reference, bool(image.getexif())))

    print(f"Image references: {len(references)}")
    print(f"Referenced raster files: {len(raster_rows)}")
    print(f"Unique raster transfer size: {sum(row[0] for row in raster_rows) / 1024 / 1024:.2f} MiB")
    print(f"Missing references: {len(missing)}")
    for reference in missing:
        print(f"  MISSING {reference}")

    oversized = [row for row in raster_rows if row[0] > 500_000]
    print(f"Referenced raster files over 500 kB: {len(oversized)}")
    for size, width, height, reference, _ in sorted(oversized, reverse=True):
        print(f"  {size / 1024:.0f} KiB  {width}x{height}  {reference}")

    with_exif = [row for row in raster_rows if row[4]]
    print(f"Referenced raster files with EXIF metadata: {len(with_exif)}")

    if missing or oversized:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
