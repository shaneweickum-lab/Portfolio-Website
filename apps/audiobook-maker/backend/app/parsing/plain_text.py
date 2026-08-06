from pathlib import Path

from app.parsing.base import ParsedDocument


def parse_txt(path: Path) -> ParsedDocument:
    raw = path.read_text(encoding="utf-8", errors="replace")
    paragraphs = [p.strip() for p in raw.split("\n\n")]
    paragraphs = [p for p in paragraphs if p]
    return ParsedDocument(title=path.stem, paragraphs=paragraphs)
