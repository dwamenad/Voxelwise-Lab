import type { Metadata } from "next";
import { TroubleshootingBrowser } from "@/components/search/troubleshooting-browser";

export const metadata: Metadata = { title: "Troubleshooting", description: "Find clear checks for common Neurodesk, Linux, FEAT, FSLEyes, DataLad, and fMRIPrep problems." };
export default async function TroubleshootingPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  return <main className="page-shell reference-page"><header className="page-intro"><span className="eyebrow">Troubleshooting center</span><h1>Start with the smallest check.</h1><p>Find the terminal, path, input, model, or report problem before changing your analysis.</p></header><div className="triage-strip"><span>01 · Environment</span><span>02 · Location</span><span>03 · Input</span><span>04 · Configuration</span><span>05 · Log</span></div><TroubleshootingBrowser initialQuery={typeof q === "string" ? q : ""} /></main>;
}
