"""Prepare the selected, previously unused client photos for the farm gallery."""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "client-materials" / "Fotky" / "Vcely" / "Obrázkový kolotoč"
OUTPUT = ROOT / "public" / "images" / "gallery"

PHOTOS = (
    ("20210317_131603.jpg", "vceli-vosk-a-svicky.webp"),
    ("20210807_065106.jpg", "prace-u-ulu.webp"),
    ("DSC06176.jpg", "ramek-se-vcelami.webp"),
    ("DSC06202.jpg", "vcely-pred-ulem.webp"),
    ("DSC06282.jpg", "kontrola-ramku.webp"),
    ("DSC06301.jpg", "zivot-na-farme.webp"),
    ("DSC06319.jpg", "vcela-na-kvetu.webp"),
    ("DSC06335.jpg", "staceni-medu.webp"),
    ("DSC06417.jpg", "druhy-medu.webp"),
    ("DSC06470.jpg", "plny-plast.webp"),
    ("DSC06479.jpg", "rada-ulu.webp"),
    ("DSC06515.jpg", "vcelnice-v-lese.webp"),
)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for old_photo in OUTPUT.glob("*.webp"):
        old_photo.unlink()
    for source_name, output_name in PHOTOS:
        with Image.open(SOURCE / source_name) as source:
            image = ImageOps.exif_transpose(source).convert("RGB")
            image.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
            image.save(OUTPUT / output_name, "WEBP", quality=78, method=4)
            print(f"{output_name}: {image.width}x{image.height}")


if __name__ == "__main__":
    main()
