"""Create compact WebP versions of watercolor artwork used by the site."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "client-materials" / "Web image sources" / "watercolor"
OUTPUT = ROOT / "public" / "images" / "watercolor"

FILES = (
    "hives-two.png",
    "family-tradition.png",
    "contact-honey-jar.png",
    "contact-bee-flower.png",
    "news-beekeeper.png",
)


def main() -> None:
    for filename in FILES:
        source_path = SOURCE / filename
        output_path = OUTPUT / Path(filename).with_suffix(".webp")
        with Image.open(source_path) as source:
            image = source.convert("RGBA")
            image.save(output_path, "WEBP", quality=80, method=4, exact=True)
            print(f"{output_path.name}: {source_path.stat().st_size} -> {output_path.stat().st_size} bytes")


if __name__ == "__main__":
    main()
