import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { searchContent } from "@/lib/content/search";

export const metadata: Metadata = { title: "Search" };
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const results = searchContent(query);
  return <main className="page-shell search-page"><header className="page-intro"><span className="eyebrow">Search FSL Academy</span><h1>{query ? <>Results for “{query}”</> : "Find a course, lesson, term, or fix."}</h1></header><form action="/search" className="search-page__form"><Search /><input name="q" defaultValue={query} placeholder="Search varcope, registration, timing files…" autoFocus aria-label="Search all content" /><button className="button button--dark">Search</button></form>{query && <p className="result-count">{results.length} {results.length === 1 ? "result" : "results"}</p>}<div className="search-results">{results.map((result) => <Link key={`${result.type}-${result.id}`} href={result.href}><span>{result.type}</span><div><h2>{result.title}</h2><p>{result.description}</p></div><ArrowUpRight /></Link>)}</div>{query && results.length === 0 && <div className="empty-state"><Search /><h2>Nothing matched yet</h2><p>Try a shorter concept or use the glossary and troubleshooting categories.</p></div>}</main>;
}
