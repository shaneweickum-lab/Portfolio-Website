import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type {
  Book,
  ContentCategory,
  ContentEntry,
  CreativityItem,
  FrontmatterFor,
  Project,
  Skill,
  World,
} from "@/lib/types";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const SKILLS_ZIP_ROOT = path.join(process.cwd(), "public", "skills");

function readCategory<C extends ContentCategory>(
  category: C,
): ContentEntry<FrontmatterFor<C>>[] {
  const dir = path.join(CONTENT_ROOT, category);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".mdx"));

  const entries = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);

    return {
      slug,
      frontmatter: data as FrontmatterFor<C>,
      content,
      readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    };
  });

  const isProd = process.env.NODE_ENV === "production";

  return entries
    .filter((entry) => !(isProd && entry.frontmatter.draft))
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime(),
    );
}

function readOne<C extends ContentCategory>(
  category: C,
  slug: string,
): ContentEntry<FrontmatterFor<C>> | undefined {
  return readCategory(category).find((entry) => entry.slug === slug);
}

export function getAllProjects(): Project[] {
  return readCategory("projects");
}

export function getProject(slug: string): Project | undefined {
  return readOne("projects", slug);
}

export function getAllBooks(): Book[] {
  return readCategory("books");
}

export function getBook(slug: string): Book | undefined {
  return readOne("books", slug);
}

export function getAllWorlds(): World[] {
  return readCategory("worlds");
}

export function getWorld(slug: string): World | undefined {
  return readOne("worlds", slug);
}

export function getAllCreativity(): CreativityItem[] {
  return readCategory("creativity");
}

export function getCreativityItem(slug: string): CreativityItem | undefined {
  return readOne("creativity", slug);
}

export function getBooksInWorld(worldSlug: string): Book[] {
  return getAllBooks().filter((book) => book.frontmatter.worldSlug === worldSlug);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function withDownloadInfo(entry: ContentEntry<FrontmatterFor<"skills">>): Skill {
  const zipPath = path.join(SKILLS_ZIP_ROOT, `${entry.slug}.zip`);
  const exists = fs.existsSync(zipPath);
  return {
    ...entry,
    downloadHref: `/skills/${entry.slug}.zip`,
    fileSizeLabel: exists ? formatFileSize(fs.statSync(zipPath).size) : null,
  };
}

export function getAllSkills(): Skill[] {
  return readCategory("skills").map(withDownloadInfo);
}

export function getSkill(slug: string): Skill | undefined {
  const entry = readOne("skills", slug);
  return entry ? withDownloadInfo(entry) : undefined;
}

export function getFeatured() {
  return {
    projects: getAllProjects().filter((p) => p.frontmatter.featured),
    books: getAllBooks().filter((b) => b.frontmatter.featured),
    worlds: getAllWorlds().filter((w) => w.frontmatter.featured),
    creativity: getAllCreativity().filter((c) => c.frontmatter.featured),
    skills: getAllSkills().filter((s) => s.frontmatter.featured),
  };
}
