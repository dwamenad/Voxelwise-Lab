"use client";

import { useState } from "react";
import { Terminal, CheckCircle2, XCircle, RotateCcw, HelpCircle, ArrowRight } from "lucide-react";

interface CommandBuilderBlockProps {
  id: string;
  title: string;
  prompt: string;
  targetTokens: string[];
  scrambledTokens: string[];
  hint?: string;
  explanation: string;
}

export function CommandBuilderBlock({
  id,
  title,
  prompt,
  targetTokens,
  scrambledTokens,
  hint,
  explanation,
}: CommandBuilderBlockProps) {
  // Each token has an instance id so duplicate words can be tracked cleanly
  const [availableTokens, setAvailableTokens] = useState<{ id: string; text: string }[]>(
    scrambledTokens.map((t, i) => ({ id: `token-${i}-${t}`, text: t }))
  );
  const [selectedTokens, setSelectedTokens] = useState<{ id: string; text: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  function addToken(token: { id: string; text: string }) {
    if (submitted) return;
    setSelectedTokens([...selectedTokens, token]);
    setAvailableTokens(availableTokens.filter((t) => t.id !== token.id));
  }

  function removeToken(token: { id: string; text: string }) {
    if (submitted) return;
    setSelectedTokens(selectedTokens.filter((t) => t.id !== token.id));
    setAvailableTokens([...availableTokens, token]);
  }

  function handleReset() {
    setSelectedTokens([]);
    setAvailableTokens(scrambledTokens.map((t, i) => ({ id: `token-${i}-${t}`, text: t })));
    setSubmitted(false);
    setShowHint(false);
  }

  const userCommand = selectedTokens.map((t) => t.text).join(" ");
  const targetCommand = targetTokens.join(" ");
  const isMatch = userCommand.trim() === targetCommand.trim();

  return (
    <section className="command-builder-block" id={`builder-${id}`}>
      <div className="block-kicker">
        <Terminal size={17} /> Command Syntax Builder
      </div>
      <h3>{title}</h3>
      <p className="builder-prompt">{prompt}</p>

      {hint && (
        <div className="quiz-hint-wrapper">
          <button
            type="button"
            className="quiz-hint-toggle"
            onClick={() => setShowHint(!showHint)}
          >
            <HelpCircle size={15} /> {showHint ? "Hide hint" : "Show hint"}
          </button>
          {showHint && <p className="quiz-hint-text">{hint}</p>}
        </div>
      )}

      {/* Command Construction Window */}
      <div className="builder-canvas">
        <div className="builder-canvas-header">
          <span>Active Command Terminal</span>
          {selectedTokens.length > 0 && !submitted && (
            <button type="button" className="builder-clear-btn" onClick={handleReset}>
              Clear
            </button>
          )}
        </div>
        <div className="builder-dropzone">
          {selectedTokens.length === 0 ? (
            <span className="builder-placeholder">
              Click tokens below to build your FSL command in the correct order...
            </span>
          ) : (
            selectedTokens.map((tok) => (
              <button
                key={tok.id}
                type="button"
                className="builder-token builder-token--active"
                onClick={() => removeToken(tok)}
                title="Click to remove"
              >
                {tok.text}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Available Token Bank */}
      <div className="builder-token-bank">
        <span className="token-bank-label">Available arguments & flags:</span>
        <div className="token-bank-chips">
          {availableTokens.map((tok) => (
            <button
              key={tok.id}
              type="button"
              className="builder-token"
              onClick={() => addToken(tok)}
            >
              {tok.text}
            </button>
          ))}
          {availableTokens.length === 0 && (
            <span className="text-xs text-[var(--muted)] italic">All tokens placed.</span>
          )}
        </div>
      </div>

      {/* Actions and Validation */}
      <div className="builder-footer">
        {!submitted ? (
          <button
            type="button"
            className="button button--acid"
            disabled={selectedTokens.length === 0}
            onClick={() => setSubmitted(true)}
          >
            Run Command Verification <ArrowRight size={15} />
          </button>
        ) : (
          <div className="builder-result">
            <div className={`quiz-verdict ${isMatch ? "success" : "retry"}`}>
              {isMatch ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Valid Syntax! The command executed as expected.</span>
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  <span>Command syntax error or incorrect argument order.</span>
                </>
              )}
            </div>
            {!isMatch && (
              <button type="button" className="button button--outline" onClick={handleReset}>
                <RotateCcw size={15} /> Rebuild Command
              </button>
            )}
          </div>
        )}

        {submitted && (
          <div className="builder-explanation">
            <div className="font-mono text-xs bg-[var(--surface-sunken)] p-2 rounded border border-[var(--border)] mb-2">
              <span className="text-[var(--muted)] font-sans block mb-1">Expected syntax:</span>
              <code>{targetCommand}</code>
            </div>
            <p className="text-sm text-[var(--ink-secondary)]">{explanation}</p>
          </div>
        )}
      </div>
    </section>
  );
}
