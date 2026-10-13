"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, Sparkles, RotateCcw } from "lucide-react";
import type { QuizOption } from "@/lib/types";

interface QuizBlockProps {
  id: string;
  question: string;
  options: QuizOption[];
  hint?: string;
  explanation?: string;
}

export function QuizBlock({ id, question, options, hint, explanation }: QuizBlockProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const selectedOption = options.find((opt) => opt.id === selectedId);
  const isCorrect = selectedOption?.isCorrect ?? false;

  function handleSelect(optId: string) {
    if (submitted && isCorrect) return;
    setSelectedId(optId);
    setSubmitted(false);
  }

  function handleCheck() {
    if (!selectedId) return;
    setSubmitted(true);
  }

  function handleReset() {
    setSelectedId(null);
    setSubmitted(false);
    setShowHint(false);
  }

  return (
    <section className="quiz-block" id={`quiz-${id}`}>
      <div className="block-kicker">
        <Sparkles size={17} /> Knowledge Check
      </div>
      <h3 className="quiz-question">{question}</h3>

      {hint && (
        <div className="quiz-hint-wrapper">
          <button
            type="button"
            className="quiz-hint-toggle"
            onClick={() => setShowHint(!showHint)}
          >
            <HelpCircle size={15} /> {showHint ? "Hide hint" : "Need a hint?"}
          </button>
          {showHint && <p className="quiz-hint-text">{hint}</p>}
        </div>
      )}

      <div className="quiz-options" role="radiogroup">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          let statusClass = "";
          if (submitted) {
            if (option.isCorrect) statusClass = "is-correct";
            else if (isSelected && !option.isCorrect) statusClass = "is-incorrect";
          } else if (isSelected) {
            statusClass = "is-selected";
          }

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`quiz-option ${statusClass}`}
              onClick={() => handleSelect(option.id)}
            >
              <div className="quiz-option-indicator">
                {submitted && option.isCorrect ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : submitted && isSelected && !option.isCorrect ? (
                  <XCircle size={18} className="text-rose-500" />
                ) : (
                  <span className={`quiz-radio-circle ${isSelected ? "checked" : ""}`} />
                )}
              </div>
              <div className="quiz-option-text">
                <span>{option.text}</span>
                {submitted && (isSelected || option.isCorrect) && (
                  <p className="quiz-option-explanation">{option.explanation}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="quiz-footer">
        {!submitted ? (
          <button
            type="button"
            className="button button--acid"
            disabled={!selectedId}
            onClick={handleCheck}
          >
            Check Answer
          </button>
        ) : (
          <div className="quiz-result-row">
            <div className={`quiz-verdict ${isCorrect ? "success" : "retry"}`}>
              {isCorrect ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Correct! Well done.</span>
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  <span>Not quite. Review the explanation and try again.</span>
                </>
              )}
            </div>
            {!isCorrect && (
              <button
                type="button"
                className="button button--outline"
                onClick={handleReset}
              >
                <RotateCcw size={15} /> Try Again
              </button>
            )}
          </div>
        )}
        {submitted && explanation && isCorrect && (
          <div className="quiz-deep-dive">
            <strong>Key takeaway:</strong> {explanation}
          </div>
        )}
      </div>
    </section>
  );
}
