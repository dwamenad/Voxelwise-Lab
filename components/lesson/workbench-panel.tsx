"use client";

import { useState } from "react";
import {
  Terminal as TerminalIcon,
  Layers,
  Maximize2,
  Minimize2,
  X,
  Play,
} from "lucide-react";
import type { Lesson } from "@/lib/types";

interface WorkbenchPanelProps {
  lesson: Lesson;
}

export function WorkbenchPanel({ lesson }: WorkbenchPanelProps) {
  const [activeTab, setActiveTab] = useState<"terminal" | "matrix">("terminal");
  const [expanded, setExpanded] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  // Terminal state
  const [history, setHistory] = useState<
    { type: "cmd" | "out" | "err"; text: string }[]
  >([
    { type: "out", text: "FSL practice simulator — example responses only" },
    { type: "out", text: "Commands are simulated in your browser. No files are processed. Use Neurodesk for real analysis." },
  ]);
  const [inputVal, setInputVal] = useState("");

  // Extract commands from current lesson
  const suggestedCommands = lesson.blocks
    .filter((b) => b.type === "command")
    .map((b) => (b as Extract<typeof b, { type: "command" }>).command);

  function runCommand(cmd: string) {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newLogs: { type: "cmd" | "out" | "err"; text: string }[] = [
      ...history,
      { type: "cmd", text: `$ ${trimmed}` },
    ];

    if (trimmed.split(/\s+/)[0] === "fslinfo") {
      newLogs.push({
        type: "out",
        text: "data_type      INT16\ndim1           64\ndim2           64\ndim3           36\ndim4           180\npixdim1        3.000000\npixdim2        3.000000\npixdim3        3.000000\npixdim4        2.000000",
      });
    } else if (trimmed.split(/\s+/)[0] === "mcflirt") {
      newLogs.push({
        type: "out",
        text: "MCFLIRT v2.0 - motion correction\nRegistering 180 volumes to volume 90...\nCalculating 6 DOF rigid body matrices...\nWriting output: bold_mcf.nii.gz\nWriting plots: bold_mcf.par\nDone.",
      });
    } else if (trimmed.split(/\s+/)[0] === "bet") {
      newLogs.push({
        type: "out",
        text: "Brain Extraction Tool v2.1\nEstimating tessellated sphere mesh...\nThresholding with -f 0.4...\nGenerated highres_brain.nii.gz and highres_brain_mask.nii.gz.",
      });
    } else if (trimmed.split(/\s+/)[0] === "fslmaths") {
      newLogs.push({
        type: "out",
        text: "fslmaths: processing pipeline complete. Saved output volume.",
      });
    } else if (trimmed.split(/\s+/)[0] === "fslstats") {
      newLogs.push({
        type: "out",
        text: "28.4529 14820",
      });
    } else if (trimmed.split(/\s+/)[0] === "feat") {
      newLogs.push({
        type: "out",
        text: "FEAT 6.00\nParsing design.fsf...\nPre-stats: MCFLIRT, BET, temporal highpass (100s).\nStats: GLM estimation via FILM prewhitening.\nPost-stats: Cluster thresholding (Z > 3.1, p < 0.05).\nReport written to .feat/report.html.",
      });
    } else if (trimmed === "clear") {
      setHistory([]);
      setInputVal("");
      return;
    } else {
      newLogs.push({
        type: "err",
        text: `Unsupported command in this simulator: ${trimmed}. No sample response is available.`,
      });
    }

    setHistory(newLogs);
    setInputVal("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      runCommand(inputVal);
    }
  }

  if (isClosed) {
    return (
      <button
        type="button"
        className="fixed bottom-4 right-4 z-40 bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)] rounded-full px-4 py-2 text-xs font-bold shadow-xl flex items-center gap-2 hover:border-[var(--accent)] transition-all"
        onClick={() => setIsClosed(false)}
      >
        <TerminalIcon size={14} /> Open Research Workbench
      </button>
    );
  }

  return (
    <aside
      className={`workbench-panel ${
        expanded ? "workbench-panel--expanded" : ""
      } flex flex-col bg-[var(--surface-sunken)] border-l border-[var(--border)] h-full overflow-hidden`}
      aria-label="Research Workbench"
    >
      {/* Workbench Header */}
      <div className="workbench-panel__header px-4 py-2.5 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "terminal"
                ? "bg-[var(--surface-sunken)] text-[var(--accent)] border border-[var(--border)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
            onClick={() => setActiveTab("terminal")}
          >
            <TerminalIcon size={13} />
            <span>Terminal</span>
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "matrix"
                ? "bg-[var(--surface-sunken)] text-[var(--accent)] border border-[var(--border)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
            onClick={() => setActiveTab("matrix")}
          >
            <Layers size={13} />
            <span>Design Matrix</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1.5 text-[var(--muted)] hover:text-[var(--ink)] rounded"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Restore panel size" : "Expand workbench"}
          >
            {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button
            type="button"
            className="p-1.5 text-[var(--muted)] hover:text-[var(--ink)] rounded"
            onClick={() => setIsClosed(true)}
            title="Collapse workbench"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Tab 1: Terminal View */}
      {activeTab === "terminal" && (
        <div className="workbench-terminal flex-1 flex flex-col overflow-hidden bg-[#0a0c10] text-[#f3f4f6] font-mono text-xs">
          {/* Terminal Window Controls */}
          <div className="px-3 py-1.5 bg-[#0e1117] border-b border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 text-zinc-400 text-[10px]">FSL practice · simulated</span>
            </div>
            <button
              type="button"
              className="text-[10px] text-zinc-500 hover:text-zinc-300"
              onClick={() => setHistory([])}
            >
              Clear
            </button>
          </div>

          {/* Terminal Output Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 leading-relaxed selection:bg-[var(--acid)] selection:text-black">
            {history.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.type === "cmd"
                    ? "text-[var(--accent)] font-bold"
                    : line.type === "err"
                    ? "text-rose-400"
                    : "text-zinc-300"
                }
              >
                <span className="whitespace-pre-wrap">{line.text}</span>
              </div>
            ))}
          </div>

          {/* Lesson Suggestions Bar */}
          {suggestedCommands.length > 0 && (
            <div className="p-2 bg-[#0e1117] border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-zinc-500 shrink-0 text-[10px] uppercase font-sans font-semibold">
                Lesson commands:
              </span>
              {suggestedCommands.slice(0, 3).map((cmd, i) => (
                <button
                  key={i}
                  type="button"
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] shrink-0 font-mono transition-colors truncate max-w-[200px]"
                  onClick={() => runCommand(cmd)}
                  title={`Run: ${cmd}`}
                >
                  {cmd}
                </button>
              ))}
            </div>
          )}

          {/* Interactive Command Input Line */}
          <div className="p-2.5 bg-[#07080b] border-t border-zinc-800 flex items-center gap-2">
            <span className="text-[var(--accent)] font-bold text-sm">$</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type FSL command or 'clear'..."
              className="flex-1 bg-transparent text-white font-mono text-xs outline-none placeholder:text-zinc-600"
              aria-label="FSL practice command"
            />
            <button
              type="button"
              className="p-1 rounded text-zinc-400 hover:text-[var(--accent)]"
              onClick={() => runCommand(inputVal)}
              aria-label="Run simulated command"
            >
              <Play size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Design Matrix & Heatmap */}
      {activeTab === "matrix" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--surface-sunken)]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--ink)]">Example GLM Design Matrix (X)</span>
            <span className="text-[10px] font-mono text-[var(--muted)]">N=60 TRs × P=3 EVs</span>
          </div>

          <p className="text-xs text-[var(--ink-secondary)]">
            This panel shows a fixed example. <a href="/tools" className="text-[var(--accent)] underline">Open the interactive design matrix simulator</a> to adjust timing and contrasts.
          </p>

          {/* Matrix Heatmap */}
          <div className="p-3 bg-black rounded-lg border border-zinc-800 flex justify-center gap-2">
            {[
              { name: "Task_A", color: "from-zinc-800 to-white" },
              { name: "Task_B", color: "from-zinc-900 to-zinc-200" },
              { name: "Motion_X", color: "from-black to-zinc-400" },
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[9px] text-zinc-400 font-mono mb-1">{col.name}</span>
                <div className="w-8 h-36 bg-gradient-to-b rounded-xs border border-zinc-700/60 overflow-hidden flex flex-col justify-around p-0.5">
                  <div className="w-full h-4 bg-white/90 rounded-2xs" />
                  <div className="w-full h-6 bg-zinc-600/50 rounded-2xs" />
                  <div className="w-full h-8 bg-zinc-900 rounded-2xs" />
                  <div className="w-full h-5 bg-white/80 rounded-2xs" />
                </div>
              </div>
            ))}
          </div>

          {/* Collinearity Mini-Grid */}
          <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)] space-y-2">
            <span className="text-xs font-semibold text-[var(--ink)] block">
              Regressor Collinearity (Pearson r)
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
              <div className="p-1 bg-zinc-800/40 rounded text-zinc-300">1.00</div>
              <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded">0.08</div>
              <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded">-0.12</div>
              <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded">0.08</div>
              <div className="p-1 bg-zinc-800/40 rounded text-zinc-300">1.00</div>
              <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded">0.04</div>
              <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded">-0.12</div>
              <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded">0.04</div>
              <div className="p-1 bg-zinc-800/40 rounded text-zinc-300">1.00</div>
            </div>
            <p className="text-[10px] text-[var(--muted)]">
              Illustrative values only. Assess design efficiency using the full model and your contrasts.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
