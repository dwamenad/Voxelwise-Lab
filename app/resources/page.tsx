import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpenText, Download, ExternalLink, TerminalSquare, Wrench } from "lucide-react";

export const metadata: Metadata = { title: "Resources" };
export default function ResourcesPage() {
  const resources = [
    { icon: BookOpenText, title: "FSL & fMRI glossary", body: "Definitions for the image formats, tools, model outputs, and statistical language used in lessons.", href: "/glossary", label: "Open glossary" },
    { icon: Wrench, title: "Troubleshooting center", body: "Contextual checks adapted from the source guide for Neurodesk, Linux, DataLad, FEAT, FSLEyes, and fMRIPrep.", href: "/troubleshooting", label: "Find a fix" },
    { icon: TerminalSquare, title: "Original TUBRIC labs", body: "Review the public MIT-licensed curriculum repository that grounds this learning platform.", href: "https://github.com/tubric/2026s-fmri-class", label: "View source" },
  ];
  return <main className="page-shell resources-page"><header className="page-intro"><span className="eyebrow">Reference library</span><h1>Keep the method close at hand.</h1><p>Use focused references while working in Neurodesk. Course downloads will appear here as they pass scientific review.</p></header><div className="resource-index">{resources.map((resource, index) => { const Icon = resource.icon; return <article key={resource.title}><span>0{index + 1}</span><Icon /><div><h2>{resource.title}</h2><p>{resource.body}</p><Link href={resource.href} target={resource.href.startsWith("http") ? "_blank" : undefined}>{resource.label}{resource.href.startsWith("http") ? <ExternalLink /> : <ArrowUpRight />}</Link></div></article>; })}</div><section className="downloads-section"><div><span className="eyebrow">Course files</span><h2>Downloads in production</h2><p>Exercise datasets and timing files are linked from their course context so you always know which lesson and analysis space they belong to.</p></div><div><Download /><span><strong>Foundations command sheet</strong>PDF · scientific review pending</span><em>Coming soon</em></div><div><Download /><span><strong>First-level timing files</strong>FSL 3-column TXT bundle · review pending</span><em>Coming soon</em></div></section></main>;
}

