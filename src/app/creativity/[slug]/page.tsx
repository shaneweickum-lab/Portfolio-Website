import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXContent } from "@/components/mdx-content";
import { Tag } from "@/components/tag";
import { getAllCreativity, getCreativityItem } from "@/lib/content";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllCreativity().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getCreativityItem(slug);
  if (!item) return {};
  return {
    title: item.frontmatter.title,
    description: item.frontmatter.summary,
  };
}

export default async function CreativityDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const item = getCreativityItem(slug);
  if (!item) notFound();

  const { frontmatter, content, readingMinutes } = item;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/creativity"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} /> All creativity
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Tag accent="wonder">{frontmatter.medium}</Tag>
        <span className="text-xs text-muted">{readingMinutes} min read</span>
      </div>

      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
        {frontmatter.title}
      </h1>
      <p className="mt-4 text-lg text-muted">{frontmatter.summary}</p>

      <div className="mt-12">
        <MDXContent source={content} />
      </div>
    </div>
  );
}
