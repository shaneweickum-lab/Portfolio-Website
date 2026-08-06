import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { MDXContent } from "@/components/mdx-content";
import { Tag } from "@/components/tag";
import { getAllSkills, getSkill } from "@/lib/content";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllSkills().map((skill) => ({ slug: skill.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) return {};
  return {
    title: skill.frontmatter.title,
    description: skill.frontmatter.summary,
  };
}

export default async function SkillPage({ params }: { params: Params }) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();

  const { frontmatter, content, readingMinutes, downloadHref, fileSizeLabel } = skill;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/projects/skills"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} /> All skills
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Tag accent="signal">v{frontmatter.version}</Tag>
        {frontmatter.category && <Tag>{frontmatter.category}</Tag>}
        <span className="text-xs text-muted">{readingMinutes} min read</span>
      </div>

      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
        {frontmatter.title}
      </h1>
      <p className="mt-4 text-lg text-muted">{frontmatter.summary}</p>

      {frontmatter.compatibleWith && (
        <p className="mt-3 text-sm text-muted">
          Compatible with <span className="text-foreground">{frontmatter.compatibleWith}</span>
        </p>
      )}

      <div className="mt-8">
        <a
          href={downloadHref}
          download
          className="inline-flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal/90"
        >
          <Download size={16} />
          Download skill
          {fileSizeLabel && <span className="text-white/70">({fileSizeLabel})</span>}
        </a>
      </div>

      <div className="mt-12">
        <MDXContent source={content} />
      </div>
    </div>
  );
}
