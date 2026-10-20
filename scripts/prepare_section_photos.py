"""Prepare client photos for the three story sections.

The crops keep the main subject near the centre of each responsive image area.
Run from the repository root with: python scripts/prepare_section_photos.py
"""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "client-materials" / "Fotky" / "Vcely"
OUTPUT = ROOT / "public" / "images" / "photos"

# source, output, output size, focal point (relative x/y), retained crop scale
PHOTOS = (
    ("jak to celé začalo.jpg", "o-farme-apiary-family.jpg", (1800, 1200), (0.50, 0.50), 1.00),
    ("jak včelaříme.jpg", "jak-vcelarime-honeycomb.jpg", (1600, 1200), (0.62, 0.60), 0.88),
    ("včelaření po generace.jpg", "story-rodinna-tradice.jpg", (1800, 1200), (0.50, 0.50), 1.00),
)


def focal_crop(image: Image.Image, size: tuple[int, int], focal: tuple[float, float], scale: float) -> Image.Image:
    target_ratio = size[0] / size[1]
    source_ratio = image.width / image.height

    if source_ratio >= target_ratio:
        crop_height = round(image.height * scale)
        crop_width = round(crop_height * target_ratio)
    else:
        crop_width = round(image.width * scale)
        crop_height = round(crop_width / target_ratio)

    center_x = round(image.width * focal[0])
    center_y = round(image.height * focal[1])
    left = max(0, min(image.width - crop_width, center_x - crop_width // 2))
    top = max(0, min(image.height - crop_height, center_y - crop_height // 2))

    return image.crop((left, top, left + crop_width, top + crop_height)).resize(
        size, Image.Resampling.LANCZOS
    )


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for source_name, output_name, size, focal, scale in PHOTOS:
        with Image.open(SOURCE / source_name) as source:
            image = ImageOps.exif_transpose(source).convert("RGB")
            prepared = focal_crop(image, size, focal, scale)
            prepared.save(OUTPUT / output_name, "JPEG", quality=88, optimize=True, progressive=True)
            print(f"{output_name}: {prepared.width}x{prepared.height}")


if __name__ == "__main__":
    main()
