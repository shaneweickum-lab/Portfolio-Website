from dataclasses import dataclass


@dataclass
class ParsedDocument:
    """A document normalized into an ordered list of paragraphs for TTS."""

    title: str
    paragraphs: list[str]


class UnsupportedFormatError(ValueError):
    pass


class EmptyDocumentError(ValueError):
    pass
