import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Tag } from "@/components/tag";
import type { Book, CreativityItem, Project, World } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  shipped: "Shipped",
  "in-progress": "In progress",
  concept: "Concept",
  published: "Published",
  drafting: "Drafting",
  editing: "Editing",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-signal/50"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">
          {project.frontmatter.title}
        </h3>
        <ArrowUpRight
          size={18}
          className="mt-1 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
        />
      </div>
      <p className="mt-2 text-sm text-muted">{project.frontmatter.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Tag accent="signal">{STATUS_LABEL[project.frontmatter.status]}</Tag>
        {project.frontmatter.stack.slice(0, 3).map((tech) => (
          <Tag key={tech}>{tech}</Tag>
        ))}
      </div>
    </Link>
  );
}

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-ember/50"
    >
      <div className="flex aspect-[3/2] items-end bg-gradient-to-br from-ember/20 via-surface-muted to-surface p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember">
          {book.frontmatter.genre ?? "Fiction"}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-medium text-foreground">
          {book.frontmatter.title}
        </h3>
        <p className="mt-2 text-sm text-muted">{book.frontmatter.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag accent="ember">{STATUS_LABEL[book.frontmatter.status]}</Tag>
        </div>
      </div>
    </Link>
  );
}

export function WorldCard({ world }: { world: World }) {
  return (
    <Link
      href={`/worlds/${world.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-ember/50"
    >
      <div className="flex aspect-[3/2] items-end bg-noise bg-gradient-to-br from-surface-muted to-surface p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember">
          {world.frontmatter.scope ?? "World"}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-medium text-foreground">
          {world.frontmatter.title}
        </h3>
        <p className="mt-2 text-sm text-muted">{world.frontmatter.summary}</p>
        {world.frontmatter.factions && (
          <div className="mt-4 flex flex-wrap gap-2">
            {world.frontmatter.factions.slice(0, 3).map((f) => (
              <Tag key={f} accent="ember">
                {f}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export function CreativityCard({ item }: { item: CreativityItem }) {
  return (
    <Link
      href={`/creativity/${item.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-wonder/50"
    >
      <Tag accent="wonder">{item.frontmatter.medium}</Tag>
      <h3 className="mt-3 font-display text-lg font-medium text-foreground">
        {item.frontmatter.title}
      </h3>
      <p className="mt-2 text-sm text-muted">{item.frontmatter.summary}</p>
    </Link>
  );
}
