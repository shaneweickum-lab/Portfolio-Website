import type { Metadata } from "next";
import { SectionHeader } from "@/components/section-header";
import { BookCard } from "@/components/cards";
import { getAllBooks } from "@/lib/content";

export const metadata: Metadata = {
  title: "Books",
  description: "Novels, novellas, and long-form fiction in progress.",
};

export default function BooksPage() {
  const books = getAllBooks();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeader
        kicker="Authoring"
        title="Books"
        description="Novels and long-form fiction, in various states of being written, rewritten, and stubbornly finished."
        accent="ember"
      />

      {books.length === 0 ? (
        <p className="mt-12 text-muted">Chapters are still being written.</p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
