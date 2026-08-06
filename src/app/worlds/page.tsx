import type { Metadata } from "next";
import { SectionHeader } from "@/components/section-header";
import { WorldCard } from "@/components/cards";
import { getAllWorlds } from "@/lib/content";

export const metadata: Metadata = {
  title: "Worlds",
  description: "Fictional worlds, their histories, factions, and rules.",
};

export default function WorldsPage() {
  const worlds = getAllWorlds();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeader
        kicker="Worldbuilding"
        title="Worlds"
        description="The settings behind the stories — histories, factions, magic systems, and the internal logic that holds them together."
        accent="ember"
      />

      {worlds.length === 0 ? (
        <p className="mt-12 text-muted">Maps are still being drawn.</p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {worlds.map((world) => (
            <WorldCard key={world.slug} world={world} />
          ))}
        </div>
      )}
    </div>
  );
}
