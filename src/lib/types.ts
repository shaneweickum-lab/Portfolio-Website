export type ContentCategory = "projects" | "books" | "worlds" | "creativity" | "skills";

export interface Link {
  label: string;
  href: string;
}

export interface Metric {
  label: string;
  value: string;
}

interface BaseFrontmatter {
  title: string;
  summary: string;
  date: string;
  tags?: string[];
  featured?: boolean;
  coverImage?: string;
  draft?: boolean;
}

export interface ProjectFrontmatter extends BaseFrontmatter {
  role?: string;
  stack: string[];
  status: "shipped" | "in-progress" | "concept";
  links?: Link[];
  metrics?: Metric[];
}

export interface BookFrontmatter extends BaseFrontmatter {
  genre?: string;
  status: "published" | "drafting" | "editing" | "concept";
  wordCount?: number;
  worldSlug?: string;
  excerptLabel?: string;
}

export interface WorldFrontmatter extends BaseFrontmatter {
  scope?: string;
  factions?: string[];
  bookSlugs?: string[];
}

export interface CreativityFrontmatter extends BaseFrontmatter {
  medium: string;
}

export interface SkillFrontmatter extends BaseFrontmatter {
  version: string;
  category?: string;
  compatibleWith?: string;
}

export type FrontmatterFor<C extends ContentCategory> = C extends "projects"
  ? ProjectFrontmatter
  : C extends "books"
    ? BookFrontmatter
    : C extends "worlds"
      ? WorldFrontmatter
      : C extends "creativity"
        ? CreativityFrontmatter
        : SkillFrontmatter;

export interface ContentEntry<F> {
  slug: string;
  frontmatter: F;
  content: string;
  readingMinutes: number;
}

export type Project = ContentEntry<ProjectFrontmatter>;
export type Book = ContentEntry<BookFrontmatter>;
export type World = ContentEntry<WorldFrontmatter>;
export type CreativityItem = ContentEntry<CreativityFrontmatter>;
export type Skill = ContentEntry<SkillFrontmatter> & { downloadHref: string; fileSizeLabel: string | null };
