import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MDXContent } from "@/components/mdx-content";
import { Tag } from "@/components/tag";
import { getAllBooks, getBook, getWorld } from "@/lib/content";

type Params = Promise<{ slug: string }>;

const STATUS_LABEL: Record<string, string> = {
  published: "Published",
  drafting: "Drafting",
  editing: "Editing",
  concept: "Concept",
};

export function generateStaticParams() {
  return getAllBooks().map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) return {};
  return {
    title: book.frontmatter.title,
    description: book.frontmatter.summary,
  };
}

export default async function BookPage({ params }: { params: Params }) {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();

  const { frontmatter, content, readingMinutes } = book;
  const world = frontmatter.worldSlug ? getWorld(frontmatter.worldSlug) : undefined;

  return (
    <div>
      <div className="bg-noise relative overflow-hidden border-b border-border bg-gradient-to-b from-ember/10 via-surface-muted to-background">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft size={14} /> All books
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Tag accent="ember">{STATUS_LABEL[frontmatter.status]}</Tag>
            {frontmatter.genre && <Tag>{frontmatter.genre}</Tag>}
            <span className="text-xs text-muted">
              {readingMinutes} min read
            </span>
          </div>

          <h1 className="mt-6 font-display text-5xl font-medium tracking-tight text-foreground sm:text-6xl">
            {frontmatter.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            {frontmatter.summary}
          </p>

          {world && (
            <Link
              href={`/worlds/${world.slug}`}
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-ember"
            >
              Set in {world.frontmatter.title} <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-16">
        {frontmatter.excerptLabel && (
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember">
            {frontmatter.excerptLabel}
          </p>
        )}
        <MDXContent source={content} />
      </div>
    </div>
  );
}
