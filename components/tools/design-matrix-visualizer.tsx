"use client";

import { useMemo, useState } from "react";
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  Plus,
  Trash2,
  HelpCircle,
} from "lucide-react";

interface EVConfig {
  id: string;
  name: string;
  type: "block" | "event" | "linear-trend" | "cosine-drift";
  onset: number; // in seconds
  duration: number; // in seconds
  period?: number; // for drift
  amplitude: number;
}

interface ContrastConfig {
  id: string;
  name: string;
  weights: number[];
}

export function DesignMatrixVisualizer() {
  const [numTRs, setNumTRs] = useState<number>(60);
  const [trSeconds, setTrSeconds] = useState<number>(2.0);
  const [applyHRF, setApplyHRF] = useState<boolean>(true);

  const [evs, setEvs] = useState<EVConfig[]>([
    { id: "ev-1", name: "Faces", type: "block", onset: 10, duration: 16, amplitude: 1 },
    { id: "ev-2", name: "Shapes", type: "block", onset: 36, duration: 16, amplitude: 1 },
    { id: "ev-3", name: "Linear Drift", type: "linear-trend", onset: 0, duration: 120, amplitude: 0.5 },
  ]);

  const [contrasts, setContrasts] = useState<ContrastConfig[]>([
    { id: "c-1", name: "Faces > Shapes", weights: [1, -1, 0] },
    { id: "c-2", name: "Task Mean (Faces + Shapes)", weights: [0.5, 0.5, 0] },
    { id: "c-3", name: "Shapes > Baseline", weights: [0, 1, 0] },
  ]);

  // Generate synthetic timeseries for each EV
  const { matrix, evNames, correlations } = useMemo(() => {
    const timePoints = Array.from({ length: numTRs }, (_, i) => i * trSeconds);
    const names = evs.map((e) => e.name);

    // Canonical double-gamma HRF approximation function (sampled at t)
    const hrf = (t: number) => {
      if (t < 0) return 0;
      const a1 = 6;
      const b1 = 1;
      const a2 = 16;
      const b2 = 1;
      const c = 1 / 6;
      const g1 = (Math.pow(t, a1 - 1) * Math.exp(-t * b1)) / 120; // 5!
      const g2 = (Math.pow(t, a2 - 1) * Math.exp(-t * b2)) / 1.307e12; // 15! approx
      return Math.max(0, g1 - c * g2);
    };

    // Build raw time courses
    const rawSignals: number[][] = evs.map((ev) => {
      return timePoints.map((t) => {
        if (ev.type === "block") {
          return t >= ev.onset && t < ev.onset + ev.duration ? ev.amplitude : 0;
        } else if (ev.type === "event") {
          return Math.abs(t - ev.onset) < trSeconds ? ev.amplitude : 0;
        } else if (ev.type === "linear-trend") {
          return (t / (numTRs * trSeconds)) * ev.amplitude;
        } else if (ev.type === "cosine-drift") {
          return Math.cos(((2 * Math.PI) / (ev.period || 60)) * t) * ev.amplitude;
        }
        return 0;
      });
    });

    // Optionally convolve with HRF for task EVs
    const convolvedSignals: number[][] = rawSignals.map((sig, evIdx) => {
      const ev = evs[evIdx];
      if (!applyHRF || ev.type === "linear-trend" || ev.type === "cosine-drift") {
        return sig;
      }
      const out = new Array(numTRs).fill(0);
      for (let i = 0; i < numTRs; i++) {
        let sum = 0;
        for (let j = 0; j <= i; j++) {
          const dt = (i - j) * trSeconds;
          sum += sig[j] * hrf(dt);
        }
        out[i] = sum;
      }
      // Normalize peak to amplitude
      const maxVal = Math.max(...out.map(Math.abs), 0.0001);
      return out.map((v) => (v / maxVal) * ev.amplitude);
    });

    // Compute Pearson correlation matrix between EVs
    const corrMatrix: number[][] = [];
    for (let i = 0; i < evs.length; i++) {
      corrMatrix[i] = [];
      const s1 = convolvedSignals[i];
      const m1 = s1.reduce((a, b) => a + b, 0) / numTRs;
      for (let j = 0; j < evs.length; j++) {
        if (i === j) {
          corrMatrix[i][j] = 1.0;
          continue;
        }
        const s2 = convolvedSignals[j];
        const m2 = s2.reduce((a, b) => a + b, 0) / numTRs;
        let num = 0;
        let den1 = 0;
        let den2 = 0;
        for (let k = 0; k < numTRs; k++) {
          const d1 = s1[k] - m1;
          const d2 = s2[k] - m2;
          num += d1 * d2;
          den1 += d1 * d1;
          den2 += d2 * d2;
        }
        const r = den1 * den2 > 0 ? num / Math.sqrt(den1 * den2) : 0;
        corrMatrix[i][j] = Number(r.toFixed(3));
      }
    }

    return { matrix: convolvedSignals, evNames: names, correlations: corrMatrix };
  }, [numTRs, trSeconds, applyHRF, evs]);

  // Adjust contrast weight length when EVs change
  function updateContrastWeight(contrastIdx: number, evIdx: number, val: number) {
    const updated = [...contrasts];
    const weights = [...(updated[contrastIdx].weights || [])];
    while (weights.length < evs.length) weights.push(0);
    weights[evIdx] = val;
    updated[contrastIdx] = { ...updated[contrastIdx], weights };
    setContrasts(updated);
  }

  function addContrast() {
    setContrasts([
      ...contrasts,
      {
        id: `c-${Date.now()}`,
        name: `Contrast ${contrasts.length + 1}`,
        weights: new Array(evs.length).fill(0),
      },
    ]);
  }

  function removeContrast(id: string) {
    setContrasts(contrasts.filter((c) => c.id !== id));
  }

  return (
    <div className="design-matrix-tool border border-[var(--border)] rounded-xl bg-[var(--surface)] p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-1">
            <Layers size={15} /> Interactive GLM Lab
          </div>
          <h2 className="text-xl font-bold text-[var(--ink)]">Design Matrix & Contrast Validator</h2>
          <p className="text-sm text-[var(--ink-secondary)]">
            Simulate Explanatory Variables (EVs), inspect the design matrix heatmap, detect regressor collinearity, and validate contrast vectors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium flex items-center gap-1.5 cursor-pointer bg-[var(--surface-sunken)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
            <input
              type="checkbox"
              checked={applyHRF}
              onChange={(e) => setApplyHRF(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            <span>Convolve with Double-Gamma HRF</span>
          </label>
        </div>
      </div>

      {/* Global Acquisition Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[var(--surface-sunken)] rounded-lg text-sm">
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Total TR Volumes</label>
          <input
            type="number"
            min={20}
            max={300}
            value={numTRs}
            onChange={(e) => setNumTRs(Math.max(20, parseInt(e.target.value) || 20))}
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2.5 py-1 text-sm font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Repetition Time (TR sec)</label>
          <input
            type="number"
            step={0.1}
            min={0.5}
            max={5.0}
            value={trSeconds}
            onChange={(e) => setTrSeconds(Math.max(0.5, parseFloat(e.target.value) || 2.0))}
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2.5 py-1 text-sm font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Total Run Duration</label>
          <span className="font-mono text-sm block mt-1">
            {(numTRs * trSeconds).toFixed(0)} seconds ({((numTRs * trSeconds) / 60).toFixed(1)} min)
          </span>
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] block mb-1">Active EVs Count</label>
          <span className="font-mono text-sm block mt-1">{evs.length} Regressors</span>
        </div>
      </div>

      {/* Visual Design Matrix & Regressor Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Matrix Heatmap Display */}
        <div className="lg:col-span-5 bg-[var(--surface-sunken)] p-4 rounded-xl border border-[var(--border)] flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 text-xs font-semibold text-[var(--ink-secondary)]">
            <span>FSL Design Matrix Heatmap (X)</span>
            <span>N={numTRs} × P={evs.length}</span>
          </div>

          <div className="relative border-2 border-[var(--ink)] bg-black p-1 shadow-md flex gap-1">
            {matrix.map((col, evIdx) => (
              <div key={evIdx} className="flex flex-col items-center" style={{ width: "38px" }}>
                <span className="text-[10px] text-white/80 font-mono mb-1 truncate max-w-full">
                  EV{evIdx + 1}
                </span>
                <div className="flex flex-col w-full h-[240px] bg-zinc-900 border border-zinc-700 overflow-hidden">
                  {col.map((val, tIdx) => {
                    // Normalize brightness between 0 and 255
                    const intensity = Math.min(255, Math.max(0, Math.round((val + 0.2) * 200)));
                    return (
                      <div
                        key={tIdx}
                        className="w-full"
                        style={{
                          height: `${240 / numTRs}px`,
                          backgroundColor: `rgb(${intensity}, ${intensity}, ${intensity})`,
                        }}
                        title={`EV${evIdx + 1} (${evNames[evIdx]}) TR=${tIdx}: ${val.toFixed(2)}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[var(--muted)] mt-3 text-center">
            Greyscale intensity represents modeled BOLD amplitude per TR (black = baseline, white = peak response).
          </p>
        </div>

        {/* Collinearity Matrix & Diagnostics */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[var(--surface-sunken)] p-4 rounded-xl border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--ink)] flex items-center gap-1.5 mb-2">
              <Sliders size={16} /> Regressor Collinearity Matrix (Pearson r)
            </h3>
            <p className="text-xs text-[var(--ink-secondary)] mb-3">
              Values close to |1.0| indicate high multicollinearity, which inflates parameter variance and reduces statistical efficiency.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                    <th className="p-2 text-left">EV</th>
                    {evNames.map((name, i) => (
                      <th key={i} className="p-2 text-center truncate max-w-[80px]">
                        EV{i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlations.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-[var(--border)]/50">
                      <td className="p-2 font-semibold text-[var(--ink)]">
                        EV{rIdx + 1} ({evNames[rIdx]})
                      </td>
                      {row.map((val, cIdx) => {
                        const absVal = Math.abs(val);
                        const isSevere = absVal > 0.8 && rIdx !== cIdx;
                        const isModerate = absVal > 0.5 && absVal <= 0.8 && rIdx !== cIdx;
                        const colorClass = isSevere
                          ? "bg-rose-500/20 text-rose-600 font-bold"
                          : isModerate
                          ? "bg-amber-500/20 text-amber-600"
                          : "text-[var(--ink-secondary)]";

                        return (
                          <td key={cIdx} className={`p-2 text-center rounded ${colorClass}`}>
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Contrast Vector Validator Section */}
      <div className="border-t border-[var(--border)] pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--ink)]">Contrast Vector Validator (cᵀ β)</h3>
            <p className="text-xs text-[var(--ink-secondary)]">
              Specify directional T-contrasts and verify vector weights, balance, and estimability.
            </p>
          </div>
          <button
            type="button"
            className="button button--outline text-xs py-1.5 px-3 flex items-center gap-1"
            onClick={addContrast}
          >
            <Plus size={14} /> Add Contrast
          </button>
        </div>

        <div className="space-y-3">
          {contrasts.map((contrast, cIdx) => {
            const weights = contrast.weights.slice(0, evs.length);
            while (weights.length < evs.length) weights.push(0);

            const sumWeights = weights.reduce((a, b) => a + b, 0);
            const isZeroVector = weights.every((w) => w === 0);
            const isDifferential = Math.abs(sumWeights) < 0.001 && !isZeroVector;
            const isSubtractive = weights.some((w) => w > 0) && weights.some((w) => w < 0);

            return (
              <div
                key={contrast.id}
                className="p-4 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border)] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded">
                      C{cIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={contrast.name}
                      onChange={(e) => {
                        const updated = [...contrasts];
                        updated[cIdx].name = e.target.value;
                        setContrasts(updated);
                      }}
                      className="text-sm font-semibold bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] px-1 py-0.5 outline-none"
                    />
                  </div>
                  {contrasts.length > 1 && (
                    <button
                      type="button"
                      className="text-[var(--muted)] hover:text-rose-500 self-end sm:self-auto"
                      onClick={() => removeContrast(contrast.id)}
                      title="Delete contrast"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Weights input */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-[var(--muted)] font-mono">Weights: [</span>
                  {evs.map((ev, evIdx) => (
                    <div key={ev.id} className="flex items-center gap-1">
                      <span className="text-xs text-[var(--ink-secondary)] truncate max-w-[70px]">
                        {ev.name}:
                      </span>
                      <input
                        type="number"
                        step={0.5}
                        value={weights[evIdx] ?? 0}
                        onChange={(e) =>
                          updateContrastWeight(cIdx, evIdx, parseFloat(e.target.value) || 0)
                        }
                        className="w-16 bg-[var(--surface)] border border-[var(--border)] rounded px-1.5 py-0.5 text-xs font-mono text-center"
                      />
                    </div>
                  ))}
                  <span className="text-xs text-[var(--muted)] font-mono">]</span>
                </div>

                {/* Validation Status */}
                <div className="text-xs pt-1 flex flex-wrap items-center gap-3">
                  {isZeroVector ? (
                    <span className="text-rose-600 flex items-center gap-1 font-medium">
                      <AlertTriangle size={14} /> Invalid: All weights are zero.
                    </span>
                  ) : (
                    <>
                      <span className="text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle2 size={14} /> Valid contrast vector.
                      </span>
                      {isDifferential && (
                        <span className="bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded font-mono">
                          Zero-sum balanced contrast (∑w = 0)
                        </span>
                      )}
                      {!isDifferential && (
                        <span className="bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded font-mono">
                          Non-zero sum (∑w = {sumWeights.toFixed(2)}) — estimates activation vs baseline
                        </span>
                      )}
                      {isSubtractive && (
                        <span className="text-[var(--muted)] italic">
                          Directional differential test
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
