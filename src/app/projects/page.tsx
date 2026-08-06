import type { Metadata } from "next";
import { SectionHeader } from "@/components/section-header";
import { ProjectCard } from "@/components/cards";
import { getAllProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "AI engineering projects, agents, and applied ML work.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeader
        kicker="AI Engineering"
        title="Projects"
        description="Agentic systems, applied LLM tooling, and infrastructure built to actually run in production."
        accent="signal"
      />

      {projects.length === 0 ? (
        <p className="mt-12 text-muted">Projects are on their way.</p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
