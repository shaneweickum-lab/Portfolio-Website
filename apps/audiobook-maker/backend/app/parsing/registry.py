from pathlib import Path
from typing import Callable

from app.config import ENFORCE_PAYWALL, FORMAT_TIERS
from app.parsing.base import ParsedDocument, UnsupportedFormatError
from app.parsing.docx_doc import parse_docx
from app.parsing.markdown_doc import parse_markdown
from app.parsing.plain_text import parse_txt

PARSERS: dict[str, Callable[[Path], ParsedDocument]] = {
    "txt": parse_txt,
    "md": parse_markdown,
    "docx": parse_docx,
}


class PaywallError(PermissionError):
    pass


def extension_of(filename: str) -> str:
    return Path(filename).suffix.lstrip(".").lower()


def requires_paid_tier(extension: str) -> bool:
    return FORMAT_TIERS.get(extension) == "paid"


def parse_document(path: Path, extension: str, *, user_tier: str = "free") -> ParsedDocument:
    parser = PARSERS.get(extension)
    if parser is None:
        raise UnsupportedFormatError(f"Unsupported file format: .{extension}")

    if ENFORCE_PAYWALL and requires_paid_tier(extension) and user_tier != "paid":
        raise PaywallError(f".{extension} files require a paid plan")

    return parser(path)
