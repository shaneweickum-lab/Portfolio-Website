from pathlib import Path

import markdown as markdown_lib
from bs4 import BeautifulSoup

from app.parsing.base import ParsedDocument

BLOCK_TAGS = ["p", "li", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"]


def parse_markdown(path: Path) -> ParsedDocument:
    raw = path.read_text(encoding="utf-8", errors="replace")
    html = markdown_lib.markdown(raw, extensions=["extra"])
    soup = BeautifulSoup(html, "html.parser")

    for code_block in soup.find_all(["pre", "code"]):
        code_block.decompose()

    paragraphs: list[str] = []
    for element in soup.find_all(BLOCK_TAGS):
        text = element.get_text(" ", strip=True)
        if text:
            paragraphs.append(text)

    return ParsedDocument(title=path.stem, paragraphs=paragraphs)
