"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clipboard,
  Download,
  Info,
  Laptop2,
  Lightbulb,
  ListChecks,
  ShieldCheck,
  TerminalSquare,
  Wrench,
} from "lucide-react";
import type { LessonBlock } from "@/lib/types";
import { NarratedVideoPlayer } from "@/components/lesson/narrated-video-player";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return <button type="button" className="copy-button" onClick={copy}>{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? "Copied" : "Copy"}</button>;
}

function CalloutIcon({ variant }: { variant: Extract<LessonBlock, { type: "callout" }>["variant"] }) {
  if (variant === "quality-control") return <ShieldCheck />;
  if (variant === "warning") return <AlertTriangle />;
  if (variant === "desktop") return <Laptop2 />;
  return <Info />;
}

export function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  const firstPractice = blocks.findIndex((block) => block.type === "neurodesk-task");
  const firstSummary = blocks.findIndex((block) => block.type === "summary");
  return <div className="lesson-blocks">{blocks.map((block, index) => {
    const key = `${block.type}-${index}`;
    switch (block.type) {
      case "text":
        return <p className="lesson-prose" key={key}>{block.body}</p>;
      case "heading":
        return block.level === 2 ? <h2 key={key}>{block.text}</h2> : <h3 key={key}>{block.text}</h3>;
      case "video":
        return <NarratedVideoPlayer key={key} block={block} />;
      case "image":
        return <figure className="lesson-image" key={key}><div><Image src={block.src} alt={block.alt} width={1600} height={1000} sizes="(max-width: 900px) 100vw, 760px" /></div>{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
      case "concept":
        return <section className="concept-block" key={key}><div className="block-kicker"><Lightbulb size={17} />Key concept</div><h2>{block.title}</h2><p>{block.body}</p>{block.terms && <div className="term-links">{block.terms.map((term) => <Link key={term} href={`/glossary?q=${encodeURIComponent(term)}`}>{term}</Link>)}</div>}</section>;
      case "command":
        return <section className="command-block" key={key}><div className="command-block__header"><span><TerminalSquare size={17} />{block.filename ?? "Terminal"}</span><CopyButton value={block.command} /></div><pre><code>{block.command}</code></pre><p>{block.explanation}</p>{block.breakdown && <dl>{block.breakdown.map((item) => <div key={item.token}><dt>{item.token}</dt><dd>{item.meaning}</dd></div>)}</dl>}</section>;
      case "callout":
        return <aside className={`callout callout--${block.variant}`} key={key}><CalloutIcon variant={block.variant} /><div><h3>{block.title}</h3><p>{block.body}</p></div></aside>;
      case "neurodesk-task":
        return <section className="task-block" id={index === firstPractice ? "practice" : undefined} key={key}><div className="block-kicker"><Laptop2 size={17} />Practice</div><h2>{block.title}</h2><ol>{block.steps.map((step, stepIndex) => <li key={step}><span>{stepIndex + 1}</span><p>{step}</p></li>)}</ol>{block.command && <div className="task-command"><pre><code>{block.command}</code></pre><CopyButton value={block.command} /></div>}</section>;
      case "expected-output":
        return <section className="expected-block" key={key}><div className="block-kicker"><CheckCircle2 size={17} />Check your work</div><h2>{block.title}</h2><pre><code>{block.output}</code></pre><p>{block.explanation}</p></section>;
      case "troubleshooting":
        return <aside className="troubleshooting-block" key={key}><Wrench /><div><div className="block-kicker">Troubleshooting</div><h3>{block.title}</h3><p>{block.body}</p>{block.command && <div className="inline-command"><pre><code>{block.command}</code></pre><CopyButton value={block.command} /></div>}</div></aside>;
      case "download":
        return <div className="download-block" key={key}><Download /><div><h3>{block.title}</h3><p>{block.format}{block.size ? ` · ${block.size}` : ""}</p></div>{block.available ? <a href={block.href} className="button button--outline">Download</a> : <span>Coming soon</span>}</div>;
      case "self-check":
        return <details className="self-check" key={key}><summary><span><CircleHelp size={19} />Self-check</span><ChevronDown /></summary><div><h3>{block.question}</h3><button type="button">Reveal answer</button><p>{block.answer}</p></div></details>;
      case "summary":
        return <section className="summary-block" id={index === firstSummary ? "summary" : undefined} key={key}><div className="block-kicker"><ListChecks size={17} />Lesson summary</div><h2>What to carry forward</h2><ul>{block.points.map((point) => <li key={point}><Check size={17} />{point}</li>)}</ul></section>;
    }
  })}</div>;
}
