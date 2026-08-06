import { marked } from "marked";

export interface ParsedDocument {
  title: string;
  paragraphs: string[];
}

function stripInlineMarkdown(raw: string): string {
  const html = marked.parseInline(raw) as string;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

function titleFromFilename(filename: string): string {
  return filename.replace(/\.[^./]+$/, "");
}

function splitParagraphs(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

async function parseTxt(file: File): Promise<ParsedDocument> {
  const raw = await file.text();
  return { title: titleFromFilename(file.name), paragraphs: splitParagraphs(raw) };
}

async function parseMarkdown(file: File): Promise<ParsedDocument> {
  const raw = await file.text();
  const tokens = marked.lexer(raw);
  const paragraphs: string[] = [];

  for (const token of tokens) {
    if (token.type === "heading" || token.type === "paragraph" || token.type === "blockquote") {
      const text = stripInlineMarkdown(token.text);
      if (text) paragraphs.push(text);
    } else if (token.type === "list") {
      for (const item of token.items) {
        const text = stripInlineMarkdown(item.text);
        if (text) paragraphs.push(text);
      }
    }
    // code, hr, space, and raw html tokens are intentionally not read aloud
  }

  return { title: titleFromFilename(file.name), paragraphs };
}

async function parseDocx(file: File): Promise<ParsedDocument> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return { title: titleFromFilename(file.name), paragraphs: splitParagraphs(value) };
}

const PARSERS: Record<string, (file: File) => Promise<ParsedDocument>> = {
  txt: parseTxt,
  md: parseMarkdown,
  docx: parseDocx,
};

export const SUPPORTED_EXTENSIONS = Object.keys(PARSERS);

export function extensionOf(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export async function parseDocument(file: File): Promise<ParsedDocument> {
  const extension = extensionOf(file.name);
  const parser = PARSERS[extension];
  if (!parser) {
    throw new Error(
      `.${extension} isn't supported yet. Try: ${SUPPORTED_EXTENSIONS.map((e) => `.${e}`).join(", ")}`,
    );
  }

  const document = await parser(file);
  if (document.paragraphs.length === 0) {
    throw new Error("No readable text was found in this document.");
  }
  return document;
}
