import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXContent } from "@/components/mdx-content";
import { Tag } from "@/components/tag";
import { getAllWorlds, getBooksInWorld, getWorld } from "@/lib/content";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllWorlds().map((world) => ({ slug: world.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) return {};
  return {
    title: world.frontmatter.title,
    description: world.frontmatter.summary,
  };
}

export default async function WorldPage({ params }: { params: Params }) {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) notFound();

  const { frontmatter, content, readingMinutes } = world;
  const books = getBooksInWorld(slug);

  return (
    <div>
      <div className="bg-noise relative overflow-hidden border-b border-border bg-gradient-to-b from-ember/10 via-surface-muted to-background">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <Link
            href="/worlds"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft size={14} /> All worlds
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {frontmatter.scope && <Tag accent="ember">{frontmatter.scope}</Tag>}
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

          {frontmatter.factions && frontmatter.factions.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {frontmatter.factions.map((faction) => (
                <Tag key={faction} accent="ember">
                  {faction}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <MDXContent source={content} />

        {books.length > 0 && (
          <div className="mt-16 rounded-2xl border border-border bg-surface p-8">
            <h2 className="font-display text-xl font-medium text-foreground">
              Stories set here
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {books.map((book) => (
                <Link
                  key={book.slug}
                  href={`/books/${book.slug}`}
                  className="text-sm text-ember hover:underline"
                >
                  {book.frontmatter.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
