"use client";

import { useState } from "react";
import { CircleCheck, CircleX, RotateCcw } from "lucide-react";
import type { Quiz } from "@/lib/schema";

/**
 * "Check your understanding": one question at a time is answered by choosing
 * an option, which reveals whether it was right and why. Nothing is stored or
 * sent anywhere. Without JavaScript the answers are available in <details>.
 */
export function QuizCard({ quiz }: { quiz: Quiz }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const answered = picked.filter((p) => p !== null).length;
  const correct = picked.filter((p, i) => p === quiz.questions[i].answer).length;

  return (
    <div>
      <ol className="space-y-6">
        {quiz.questions.map((q, qi) => {
          const choice = picked[qi];
          const done = choice !== null;
          return (
            <li key={qi} className="card p-5">
              <fieldset>
                <legend className="text-[1.0625rem] font-semibold leading-snug text-text">
                  <span className="mr-2 font-mono text-sm text-ice">{qi + 1}.</span>
                  {q.prompt}
                </legend>
                <div className="mt-4 grid gap-2">
                  {q.choices.map((c, ci) => {
                    const isAnswer = ci === q.answer;
                    const isPicked = choice === ci;
                    const state = !done ? "idle" : isAnswer ? "right" : isPicked ? "wrong" : "other";
                    return (
                      <button
                        key={ci}
                        type="button"
                        disabled={done}
                        aria-pressed={isPicked}
                        onClick={() => setPicked((prev) => prev.map((p, i) => (i === qi ? ci : p)))}
                        className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-[0.9375rem] transition-colors ${
                          state === "idle"
                            ? "border-line-strong bg-elev/40 text-text hover:border-cyan"
                            : state === "right"
                              ? "border-cyan bg-cyan/10 text-text"
                              : state === "wrong"
                                ? "border-arc/60 bg-arc/10 text-text"
                                : "border-line text-muted"
                        }`}
                      >
                        <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center">
                          {state === "right" ? (
                            <CircleCheck className="h-5 w-5 text-cyan" />
                          ) : state === "wrong" ? (
                            <CircleX className="h-5 w-5 text-[#ff8fa3]" />
                          ) : (
                            <span className="h-3.5 w-3.5 rounded-full border border-muted" />
                          )}
                        </span>
                        <span>
                          {c}
                          {state === "right" ? <span className="sr-only"> (correct answer)</span> : null}
                          {state === "wrong" ? <span className="sr-only"> (your answer, not correct)</span> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div aria-live="polite">
                  {done ? (
                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-[#d5def2]">
                      <span className={`font-semibold ${choice === q.answer ? "text-cyan" : "text-[#ff8fa3]"}`}>
                        {choice === q.answer ? "Correct. " : "Not quite. "}
                      </span>
                      {q.explanation}
                    </p>
                  ) : null}
                </div>
                <noscript>
                  <details className="mt-3 text-sm text-muted">
                    <summary>Show the answer</summary>
                    <p className="mt-2">
                      {q.choices[q.answer]}. {q.explanation}
                    </p>
                  </details>
                </noscript>
              </fieldset>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
        <p className="text-sm text-muted">
          {answered === quiz.questions.length ? `You answered ${correct} of ${quiz.questions.length} correctly.` : `${answered} of ${quiz.questions.length} answered.`}
        </p>
        {answered > 0 ? (
          <button type="button" onClick={() => setPicked(quiz.questions.map(() => null))} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" /> Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}
