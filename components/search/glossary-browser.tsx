"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { glossaryTerms } from "@/lib/content/glossary";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function GlossaryBrowser({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? glossaryTerms.filter((item) => `${item.term} ${item.definition}`.toLowerCase().includes(normalized)) : glossaryTerms;
  }, [query]);

  return <>
    <div className="reference-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search terms—try ‘varcope’" aria-label="Search glossary" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X /></button>}</div>
    <nav className="alphabet-nav" aria-label="Glossary letters">{letters.map((letter) => <a className={matches.some((item) => item.term.toUpperCase().startsWith(letter)) ? "" : "is-disabled"} href={`#letter-${letter}`} key={letter}>{letter}</a>)}</nav>
    <div className="glossary-list" aria-live="polite">{matches.length ? matches.map((item, index) => {
      const letter = item.term[0].toUpperCase();
      const firstOfLetter = index === 0 || matches[index - 1].term[0].toUpperCase() !== letter;
      return <article key={item.slug} id={firstOfLetter ? `letter-${letter}` : undefined}><div><span>{firstOfLetter ? letter : ""}</span></div><div><h2>{item.term}</h2><p>{item.definition}</p>{item.relatedCourseSlugs.length > 0 && <div className="related-links"><span>Appears in</span>{item.relatedCourseSlugs.map((slug) => <Link key={slug} href={`/courses/${slug}`}>{slug.replaceAll("-", " ")}</Link>)}</div>}</div></article>;
    }) : <div className="empty-state"><Search /><h2>No matching terms</h2><p>Try a tool name, output type, or statistical concept.</p></div>}</div>
  </>;
}

