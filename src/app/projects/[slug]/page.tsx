import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { MDXContent } from "@/components/mdx-content";
import { Tag } from "@/components/tag";
import { getAllProjects, getProject } from "@/lib/content";

type Params = Promise<{ slug: string }>;

const STATUS_LABEL: Record<string, string> = {
  shipped: "Shipped",
  "in-progress": "In progress",
  concept: "Concept",
};

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.frontmatter.title,
    description: project.frontmatter.summary,
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { frontmatter, content, readingMinutes } = project;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} /> All projects
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Tag accent="signal">{STATUS_LABEL[frontmatter.status]}</Tag>
        {frontmatter.role && <Tag>{frontmatter.role}</Tag>}
        <span className="text-xs text-muted">{readingMinutes} min read</span>
      </div>

      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
        {frontmatter.title}
      </h1>
      <p className="mt-4 text-lg text-muted">{frontmatter.summary}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {frontmatter.stack.map((tech) => (
          <Tag key={tech}>{tech}</Tag>
        ))}
      </div>

      {frontmatter.metrics && frontmatter.metrics.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {frontmatter.metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <p className="font-mono text-2xl font-semibold text-signal">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-muted">{metric.label}</p>
            </div>
          ))}
        </div>
      )}

      {frontmatter.links && frontmatter.links.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {frontmatter.links.map((link) => {
            const isInternal = link.href.startsWith("/");
            const linkClassName =
              "inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-foreground hover:border-signal/60 hover:text-signal";

            return isInternal ? (
              <Link key={link.href} href={link.href} className={linkClassName}>
                {link.label} <ArrowUpRight size={14} />
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                {link.label} <ArrowUpRight size={14} />
              </a>
            );
          })}
        </div>
      )}

      <div className="mt-12">
        <MDXContent source={content} />
      </div>
    </div>
  );
}
