"""Prepare square product-card images from client originals.

Each source has an explicit focal point and crop scale so the subject remains
centered inside the square cards instead of relying on a generic center crop.
"""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "client-materials" / "Fotky" / "Vcely"
OUTPUT = ROOT / "public" / "images" / "photos"
OUTPUT_SIZE = 1000

# source filename: (output filename, focal x, focal y, square crop scale)
# Focal coordinates use the full image, from 0 (left/top) to 1 (right/bottom).
PRODUCTS = {
    "květový.jpg": ("med-kvetovy-jarni.webp", 0.50, 0.63, 0.90),
    "pastovany.jpg": ("med-kvetovy-jarni-pastovany.webp", 0.50, 0.63, 0.90),
    "lipovy.jpg": ("med-kvetovy-lipovy.webp", 0.50, 0.63, 0.90),
    "pohankový.jpg": ("med-kvetovy-pohankovy.webp", 0.50, 0.63, 0.90),
    "smíšený.jpg": ("med-smiseny.webp", 0.50, 0.63, 0.90),
    "medovicovy'.jpg": ("med-medovicovy-lesni.webp", 0.50, 0.63, 0.90),
    "propolisova' tinktura.jpg": ("propolisova-tinktura.webp", 0.50, 0.66, 0.65),
    "surovy' propolis.jpg": ("propolis-skrabany.webp", 0.50, 0.67, 0.78),
    "Včelí vosk.jpg": ("vceli-vosk.webp", 0.48, 0.50, 0.92),
    "motané svíčky.jpg": ("motane-svicky.webp", 0.47, 0.51, 0.85),
    "vyzimované včelstvo.jpg": ("vyzimovane-vcelstvo.webp", 0.35, 0.45, 0.82),
    "vyzimovaný oddělek.jpg": ("vyzimovany-oddelek.webp", 0.48, 0.38, 0.82),
    "letní oddělek.jpg": ("letni-oddelek.webp", 0.50, 0.50, 0.90),
}


def focal_square(image: Image.Image, focal_x: float, focal_y: float, scale: float) -> Image.Image:
    width, height = image.size
    side = round(min(width, height) * scale)
    center_x = round(width * focal_x)
    center_y = round(height * focal_y)
    left = max(0, min(width - side, center_x - side // 2))
    top = max(0, min(height - side, center_y - side // 2))
    return image.crop((left, top, left + side, top + side))


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for source_name, (output_name, focal_x, focal_y, scale) in PRODUCTS.items():
        source_path = SOURCE / source_name
        output_path = OUTPUT / output_name
        with Image.open(source_path) as source_image:
            image = ImageOps.exif_transpose(source_image).convert("RGB")
            image = focal_square(image, focal_x, focal_y, scale)
            image = image.resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.Resampling.LANCZOS)
            image.save(output_path, "WEBP", quality=84, method=6)
        print(f"{source_name} -> {output_name}")


if __name__ == "__main__":
    main()
