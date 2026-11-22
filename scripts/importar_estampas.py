"""Preparar copias WebP transparentes y miniaturas para el probador.

Uso: python scripts/importar_estampas.py --version 0.10.0 --estampa NOMBRE ARCHIVO [--estampa NOMBRE ARCHIVO ...]
"""
import argparse
import hashlib
from pathlib import Path
import re
import unicodedata

from PIL import Image


def slug(value):
    latin = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", latin.lower()).strip("-")


def trimmed_rgba(source):
    with Image.open(source) as raw:
        image = raw.convert("RGBA")
    alpha = image.getchannel("A")
    clean = alpha.point(lambda value: 0 if value < 8 else value)
    bounds = clean.getbbox()
    if bounds is None or clean.getextrema()[0] != 0:
        raise ValueError(f"{source.name}: debe tener píxeles visibles y fondo transparente")
    image.putalpha(clean)
    cropped = image.crop(bounds)
    if max(cropped.size) < 180:
        raise ValueError(f"{source.name}: el área útil no alcanza 180 px")
    return cropped


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--version", required=True)
    parser.add_argument("--infantil", action="store_true", help="Importar al catálogo de Niño")
    parser.add_argument("--estampa", nargs=2, action="append", required=True, metavar=("NOMBRE", "ARCHIVO"))
    args = parser.parse_args()
    if not re.fullmatch(r"\d+\.\d+\.\d+", args.version):
        parser.error("la versión debe seguir X.Y.Z")

    root = Path(__file__).resolve().parents[1] / "src" / "features" / "probador"
    destination = root / "estampas"
    thumbnails = root / "miniaturas"
    if args.infantil:
        destination /= "infantil"
        thumbnails /= "infantil"
    seen = set()
    names = set()
    prepared = []
    for label, source in args.estampa:
        stem = slug(label)
        if not stem or stem in names:
            parser.error(f"estampa repetida o nombre vacío: {label}")
        image = trimmed_rgba(Path(source))
        signature = image.copy()
        signature.thumbnail((96, 96), Image.Resampling.LANCZOS)
        digest = hashlib.sha256(signature.tobytes()).hexdigest()
        if digest in seen:
            parser.error(f"el arte de {label} coincide con otra estampa de esta importación")
        names.add(stem)
        seen.add(digest)
        filename = f"{stem}-v{args.version}.webp"
        if (destination / filename).exists() or (thumbnails / filename).exists():
            parser.error(f"{filename} ya existe. Usá una versión nueva")
        prepared.append((filename, image))

    destination.mkdir(parents=True, exist_ok=True)
    thumbnails.mkdir(parents=True, exist_ok=True)
    for filename, image in prepared:
        image.thumbnail((640, 640), Image.Resampling.LANCZOS)
        image.save(destination / filename, quality=89, method=4, alpha_quality=100)
        image.thumbnail((160, 160), Image.Resampling.LANCZOS)
        image.save(thumbnails / filename, quality=81, method=4, alpha_quality=100)
        print(filename)


if __name__ == "__main__":
    main()
