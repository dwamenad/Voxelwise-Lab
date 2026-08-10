"use client";

import { Search, TerminalSquare, X } from "lucide-react";
import { useMemo, useState } from "react";
import { troubleshootingArticles } from "@/lib/content/troubleshooting";
import type { TroubleshootingArticle } from "@/lib/types";

const categories: (TroubleshootingArticle["category"] | "All")[] = ["All", "Neurodesk", "Linux", "DataLad", "FEAT", "FSLEyes", "fMRIPrep"];

export function TroubleshootingBrowser({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const matches = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return troubleshootingArticles.filter((article) => (category === "All" || article.category === category) && (!normalized || `${article.title} ${article.symptom} ${article.resolution} ${article.tags.join(" ")}`.toLowerCase().includes(normalized)));
  }, [category, query]);
  return <>
    <div className="reference-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Describe the issue—try ‘command not found’" aria-label="Search troubleshooting articles" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X /></button>}</div>
    <div className="category-tabs" role="group" aria-label="Troubleshooting category">{categories.map((item) => <button type="button" key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <div className="troubleshooting-list" aria-live="polite">{matches.map((article) => <details key={article.id} open={matches.length === 1}><summary><span>{article.category}</span><div><h2>{article.title}</h2><p>{article.symptom}</p></div><span>+</span></summary><div className="troubleshooting-answer"><h3>What to do</h3><p>{article.resolution}</p>{article.commands && <div><span><TerminalSquare />Useful checks</span><pre><code>{article.commands.join("\n")}</code></pre></div>}</div></details>)}</div>
    {matches.length === 0 && <div className="empty-state"><Search /><h2>No matching article</h2><p>Try a shorter description or browse a related category.</p></div>}
  </>;
}

