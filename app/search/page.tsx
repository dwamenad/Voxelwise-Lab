import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Search, Terminal, BookOpen, Wrench, Layers } from "lucide-react";
import { searchContent, type SearchCategory } from "@/lib/content/search";

export const metadata: Metadata = { title: "Search FSL Academy" };

const categories: SearchCategory[] = [
  "All",
  "Courses",
  "Lessons",
  "Commands",
  "Glossary",
  "Troubleshooting",
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; cat?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const activeCategory = (typeof params.cat === "string" && categories.includes(params.cat as any)
    ? params.cat
    : "All") as SearchCategory;

  const results = searchContent(query, activeCategory);

  return (
    <main className="page-shell search-page max-w-4xl mx-auto px-4 py-8 space-y-6">
      <header className="page-intro">
        <span className="eyebrow">Search FSL Academy</span>
        <h1>{query ? <>Results for “{query}”</> : "Find a course, lesson, command, term, or fix."}</h1>
      </header>

      <form action="/search" className="search-page__form">
        <Search />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search varcope, mcflirt, registration, timing files…"
          autoFocus
          aria-label="Search all content"
        />
        {activeCategory !== "All" && <input type="hidden" name="cat" value={activeCategory} />}
        <button type="submit" className="button button--dark">
          Search
        </button>
      </form>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 pt-1 border-b border-[var(--border)] pb-3">
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          const href = `/search?q=${encodeURIComponent(query)}${cat !== "All" ? `&cat=${encodeURIComponent(cat)}` : ""}`;
          return (
            <Link
              key={cat}
              href={href}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                isActive
                  ? "bg-[var(--ink)] text-[var(--surface)] border-[var(--ink)] font-semibold"
                  : "bg-[var(--surface-sunken)] text-[var(--ink-secondary)] border-[var(--border)] hover:border-[var(--ink)]"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      {query && (
        <p className="result-count text-xs text-[var(--muted)]">
          {results.length} {results.length === 1 ? "result" : "results"} found
        </p>
      )}

      <div className="search-results space-y-3">
        {results.map((result) => (
          <Link
            key={`${result.type}-${result.id}`}
            href={result.href}
            className="p-4 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all flex items-start justify-between gap-4 group"
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--ink-secondary)]">
                  {result.type}
                </span>
                <h2 className="text-base font-bold text-[var(--ink)] group-hover:text-[var(--accent)]">
                  {result.title}
                </h2>
              </div>
              <p className="text-sm text-[var(--ink-secondary)]">{result.description}</p>
              {result.snippet && (
                <p className="text-xs text-[var(--muted)] font-mono bg-[var(--surface)] p-2 rounded border border-[var(--border)] mt-2">
                  {result.snippet}
                </p>
              )}
            </div>
            <ArrowUpRight
              size={18}
              className="text-[var(--muted)] group-hover:text-[var(--accent)] shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        ))}
      </div>

      {query && results.length === 0 && (
        <div className="empty-state text-center py-16 space-y-3">
          <Search size={36} className="mx-auto text-[var(--muted)]" />
          <h2 className="text-lg font-bold text-[var(--ink)]">Nothing matched yet</h2>
          <p className="text-sm text-[var(--ink-secondary)] max-w-md mx-auto">
            Try searching for specific terms like <code>mcflirt</code>, <code>bbr</code>, <code>feat</code>, <code>varcope</code>, or select the "All" category.
          </p>
        </div>
      )}
    </main>
  );
}
