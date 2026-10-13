"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle, RotateCcw, Search } from "lucide-react";
import type { ErrorSpottingOption } from "@/lib/types";

interface ErrorSpottingBlockProps {
  id: string;
  title: string;
  scenario: string;
  codeOrReport?: string;
  options: ErrorSpottingOption[];
  summary: string;
}

export function ErrorSpottingBlock({
  id,
  title,
  scenario,
  codeOrReport,
  options,
  summary,
}: ErrorSpottingBlockProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggleOption(optId: string) {
    if (submitted) return;
    setSelectedIds((prev) =>
      prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
    );
  }

  function handleCheck() {
    setSubmitted(true);
  }

  function handleReset() {
    setSelectedIds([]);
    setSubmitted(false);
  }

  // Calculate score: how many flaws correctly identified and how many non-flaws avoided
  const flawIds = options.filter((o) => o.isFlaw).map((o) => o.id);
  const correctFlawsIdentified = flawIds.every((id) => selectedIds.includes(id));
  const noFalseAlarms = selectedIds.every((id) => flawIds.includes(id));
  const isPerfect = correctFlawsIdentified && noFalseAlarms;

  return (
    <section className="error-spotting-block" id={`error-spot-${id}`}>
      <div className="block-kicker">
        <AlertTriangle size={17} /> Quality Control & Error Diagnosis
      </div>
      <h3>{title}</h3>
      <p className="error-spotting-scenario">{scenario}</p>

      {codeOrReport && (
        <div className="error-spotting-code">
          <div className="error-code-header">
            <Search size={14} /> Pipeline Artifact Under Review
          </div>
          <pre>
            <code>{codeOrReport}</code>
          </pre>
        </div>
      )}

      <div className="error-spotting-options">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2 block">
          Select all methodological or technical errors in this configuration:
        </span>
        {options.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          let itemClass = "";
          if (submitted) {
            if (option.isFlaw && isSelected) {
              itemClass = "flaw-caught";
            } else if (option.isFlaw && !isSelected) {
              itemClass = "flaw-missed";
            } else if (!option.isFlaw && isSelected) {
              itemClass = "false-alarm";
            } else {
              itemClass = "clean-pass";
            }
          } else if (isSelected) {
            itemClass = "is-selected";
          }

          return (
            <label
              key={option.id}
              className={`error-spotting-item block ${itemClass}`}
            >
              <div className="error-spotting-checkbox">
                {submitted ? (
                  option.isFlaw ? (
                    isSelected ? (
                      <CheckCircle2 size={17} className="text-[var(--success)]" />
                    ) : (
                      <XCircle size={17} className="text-[var(--warning)]" />
                    )
                  ) : isSelected ? (
                    <XCircle size={17} className="text-[var(--danger)]" />
                  ) : (
                    <CheckCircle2 size={17} className="text-zinc-400" />
                  )
                ) : (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    aria-label={option.description}
                    onChange={() => toggleOption(option.id)}
                  />
                )}
              </div>
              <div className="error-spotting-content">
                <p className="font-medium text-sm text-[var(--ink)]">{option.description}</p>
                {submitted && (
                  <p className="error-spotting-feedback">
                    {option.isFlaw ? (
                      <span className="text-[var(--warning)] font-semibold">[Fatal Flaw] </span>
                    ) : (
                      <span className="text-[var(--success)] font-semibold">[Valid Practice] </span>
                    )}
                    {option.explanation}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <div className="error-spotting-footer">
        {!submitted ? (
          <button
            type="button"
            className="button button--acid"
            disabled={selectedIds.length === 0}
            onClick={handleCheck}
          >
            Submit Diagnosis
          </button>
        ) : (
          <div className="error-spotting-verdict">
            <div className={`quiz-verdict ${isPerfect ? "success" : "retry"}`}>
              {isPerfect ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Flawless diagnosis! All errors caught with zero false alarms.</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={18} />
                  <span>Review the diagnostic feedback above to spot all issues.</span>
                </>
              )}
            </div>
            {!isPerfect && (
              <button type="button" className="button button--outline" onClick={handleReset}>
                <RotateCcw size={15} /> Try Again
              </button>
            )}
          </div>
        )}

        {submitted && (
          <div className="error-spotting-summary">
            <strong>QC Takeaway:</strong> {summary}
          </div>
        )}
      </div>
    </section>
  );
}
