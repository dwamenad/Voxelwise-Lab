import type { Metadata } from "next";
import { GlossaryBrowser } from "@/components/search/glossary-browser";

export const metadata: Metadata = { title: "Glossary", description: "Search plain-language definitions for FSL and fMRI analysis terms." };
export default async function GlossaryPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";
  return <main className="page-shell reference-page"><header className="page-intro"><span className="eyebrow">Reference</span><h1>FSL & fMRI glossary</h1><p>Plain-language definitions for the tools, files, and statistical concepts used across the curriculum.</p></header><GlossaryBrowser initialQuery={initialQuery} /></main>;
}
