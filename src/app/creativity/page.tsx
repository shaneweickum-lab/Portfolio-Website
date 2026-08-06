import type { Metadata } from "next";
import { SectionHeader } from "@/components/section-header";
import { CreativityCard } from "@/components/cards";
import { getAllCreativity } from "@/lib/content";

export const metadata: Metadata = {
  title: "Creativity",
  description: "Short-form writing, art experiments, and creative side quests.",
};

export default function CreativityPage() {
  const items = getAllCreativity();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeader
        kicker="Creativity"
        title="The overflow"
        description="Flash fiction, poems, prompt experiments, and anything else too small to be a book but too fun not to make."
        accent="wonder"
      />

      {items.length === 0 ? (
        <p className="mt-12 text-muted">Nothing here yet — check back soon.</p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <CreativityCard key={item.slug} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
