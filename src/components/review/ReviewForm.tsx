"use client";

import { useActionState, useState } from "react";
import {
  submitReview,
  type SubmitReviewState,
} from "@/server/actions/submit-review";
import type { ReviewQuestion } from "@/server/review";

type AnswerMap = Record<string, string | string[]>;

const initialState: SubmitReviewState = { ok: false };

export function ReviewForm({
  teamSlug,
  questions,
}: {
  teamSlug: string;
  questions: ReviewQuestion[];
}) {
  const [answers, setAnswers] = useState<AnswerMap>(() =>
    Object.fromEntries(
      questions.map((q) => [q.findingId, q.spec.kind === "multi" ? [] : ""]),
    ),
  );
  const [state, formAction, pending] = useActionState(
    submitReview,
    initialState,
  );

  const allAnswered = questions.every((q) => {
    const a = answers[q.findingId];
    if (q.spec.kind === "multi") return Array.isArray(a) && a.length > 0;
    return typeof a === "string" && a.trim().length > 0;
  });

  const payload = JSON.stringify({
    teamSlug,
    answers: questions.map((q) => {
      const a = answers[q.findingId];
      const value = Array.isArray(a) ? a.join(", ") : a;
      return { findingId: q.findingId, value: value ?? "" };
    }),
  });

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="payload" value={payload} />

      {questions.map((q, i) => (
        <QuestionCard
          key={q.findingId}
          index={i + 1}
          question={q}
          value={answers[q.findingId] ?? (q.spec.kind === "multi" ? [] : "")}
          onChange={(v) =>
            setAnswers((prev) => ({ ...prev, [q.findingId]: v }))
          }
        />
      ))}

      {state.error ? (
        <div className="rounded-md border border-danger-soft bg-danger-soft px-4 py-2.5 text-[13px] text-danger-ink">
          {state.error}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-elevated p-[18px_22px]">
        <div className="text-[12.5px] text-ink-muted">
          {allAnswered
            ? `Ready to submit ${questions.length} ${questions.length === 1 ? "answer" : "answers"}.`
            : `Answer all ${questions.length} to submit.`}
        </div>
        <button
          type="submit"
          disabled={!allAnswered || pending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-[16px] py-[9px] text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </form>
  );
}

function QuestionCard({
  index,
  question,
  value,
  onChange,
}: {
  index: number;
  question: ReviewQuestion;
  value: string | string[];
  onChange: (v: string | string[]) => void;
}) {
  const { spec } = question;
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-[22px_24px]">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-soft font-mono text-[10.5px] font-bold text-primary">
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-[14.5px] font-semibold tracking-[-0.005em] text-ink">
            {spec.label ?? question.fieldLabel}
          </div>
          {spec.helpText ? (
            <div className="text-[12.5px] leading-[1.5] text-ink-soft">
              {spec.helpText}
            </div>
          ) : null}
          {question.triedNote && question.triedNote !== spec.helpText ? (
            <div className="mt-2 rounded bg-bg-subtle px-2.5 py-[7px] text-[11.5px] leading-[1.5] text-ink-muted">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
                Agent tried
              </span>{" "}
              {question.triedNote}
            </div>
          ) : null}
        </div>
        <span className="flex-shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
          {question.category}
        </span>
      </div>

      {spec.kind === "single" ? (
        <SingleSelect
          options={spec.options ?? []}
          value={typeof value === "string" ? value : ""}
          name={question.findingId}
          onChange={onChange}
        />
      ) : spec.kind === "multi" ? (
        <MultiSelect
          options={spec.options ?? []}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      ) : (
        <TextInput
          placeholder={spec.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
        />
      )}
    </div>
  );
}

function SingleSelect({
  options,
  value,
  name,
  onChange,
}: {
  options: { value: string; label: string; description?: string }[];
  value: string;
  name: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
              selected
                ? "border-primary bg-primary-soft"
                : "border-border-subtle hover:border-border-strong hover:bg-bg-subtle"
            }`}
          >
            <input
              type="radio"
              name={name}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="mt-[3px] h-4 w-4 accent-primary"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-ink">
                {opt.label}
              </div>
              {opt.description ? (
                <div className="mt-0.5 text-[11.5px] text-ink-muted">
                  {opt.description}
                </div>
              ) : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}

function MultiSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; description?: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
              selected
                ? "border-primary bg-primary-soft"
                : "border-border-subtle hover:border-border-strong hover:bg-bg-subtle"
            }`}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() =>
                onChange(
                  selected
                    ? value.filter((v) => v !== opt.value)
                    : [...value, opt.value],
                )
              }
              className="mt-[3px] h-4 w-4 accent-primary"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-ink">
                {opt.label}
              </div>
              {opt.description ? (
                <div className="mt-0.5 text-[11.5px] text-ink-muted">
                  {opt.description}
                </div>
              ) : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}

function TextInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="block w-full resize-y rounded-md border border-border bg-bg px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft"
    />
  );
}
