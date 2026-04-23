"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type AdaPanelProps = {
  fieldLabel: string | null;
  fieldSubject?: string | null;
  fieldValue?: string | null;
};

/**
 * Ada reviewer-assistant panel. Visual prototype — all content is canned.
 * Ada appears as the 3rd column in ReviewShell when the URL has
 * `?ada=<fieldId>`. The close button clears the param.
 */
export function AdaPanel({
  fieldLabel,
  fieldSubject,
  fieldValue,
}: AdaPanelProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const closeHref = (() => {
    const next = new URLSearchParams(params.toString());
    next.delete("ada");
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  })();

  const isActive = fieldLabel !== null;
  return (
    <aside className="flex min-h-full flex-col border-l border-border bg-bg-elevated">
      <Header
        fieldLabel={fieldLabel}
        fieldSubject={fieldSubject}
        closeHref={closeHref}
        showClose={isActive}
      />
      {isActive ? (
        <Transcript fieldLabel={fieldLabel} fieldValue={fieldValue} />
      ) : (
        <EmptyState />
      )}
      <MicBar disabled={!isActive} />
    </aside>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-10 text-center">
      <div className="mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-bg-subtle">
        <svg
          className="h-6 w-6 text-ink-faint"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3 className="mb-2 text-[14.5px] font-semibold tracking-[-0.005em] text-ink">
        Ada is ready when you are
      </h3>
      <p className="max-w-[260px] text-[12.5px] leading-[1.55] text-ink-muted">
        Stuck on a field? Click{" "}
        <span className="rounded bg-bg-subtle px-[6px] py-[1px] font-mono text-[11px] text-ink-soft">
          Not sure
        </span>{" "}
        on any pending item and Ada will pull up the evidence and walk through
        it with you.
      </p>
    </div>
  );
}

function Header({
  fieldLabel,
  fieldSubject,
  closeHref,
  showClose,
}: {
  fieldLabel: string | null;
  fieldSubject?: string | null;
  closeHref: string;
  showClose: boolean;
}) {
  return (
    <div className="border-b border-border px-[22px] pb-[14px] pt-[18px]">
      <div className="mb-[14px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-600 text-[14px] font-bold text-white shadow-[0_2px_10px_rgba(99,102,241,0.3)]">
            A
            <span className="absolute -bottom-[1px] -right-[1px] h-[10px] w-[10px] rounded-full border-2 border-bg-elevated bg-success" />
          </div>
          <div className="flex flex-col">
            <div className="text-[14.5px] font-semibold tracking-[-0.005em]">
              Ada
            </div>
            <div className="text-[11px] text-ink-muted">
              Migration review assistant
            </div>
          </div>
        </div>
        {showClose ? (
          <Link
            href={closeHref}
            aria-label="Close Ada"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md text-ink-muted hover:bg-bg-subtle hover:text-ink"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Link>
        ) : null}
      </div>
      {fieldLabel ? (
        <div className="flex items-center gap-[10px] rounded-lg border border-accent-mid bg-accent-soft px-3 py-[9px]">
          <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-accent-ink">
            Helping with
          </span>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-semibold text-ink">
              {fieldLabel}
            </div>
            {fieldSubject ? (
              <div className="truncate font-mono text-[10.5px] text-ink-muted">
                {fieldSubject}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Transcript({
  fieldLabel,
  fieldValue,
}: {
  fieldLabel: string;
  fieldValue?: string | null;
}) {
  // Canned script — specific to the Git LFS demo path, generic for others.
  const isLfs = /lfs/i.test(fieldLabel);
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-[22px] py-[22px]">
      <Turn speaker="Ada · voice" kind="bot">
        {isLfs ? (
          <>
            Hi! I noticed you&rsquo;re not sure about this one. I can help you
            figure it out. Do you want me to explain what Git LFS is first, or
            should I just look at your repo and tell you what I find?
          </>
        ) : (
          <>
            Hi — I can help you think through <strong>{fieldLabel}</strong>.
            Want me to explain what it means first, or pull evidence from your
            repo and share what I find?
          </>
        )}
      </Turn>

      <Turn speaker="You · voice note" kind="user">
        <VoiceNote duration="0:04" />
        <div className="mt-1 px-[4px] text-[10px] italic text-cyan-100/90">
          {isLfs
            ? "“Honestly, I've heard of LFS but don't know what it means”"
            : "“Yeah, explain it and show me the evidence”"}
        </div>
      </Turn>

      <Turn speaker="Ada · voice" kind="bot">
        {isLfs ? (
          <>
            No worries. Git LFS (Large File Storage) is a way to track big
            binary files — like ML models or compiled libraries — outside your
            normal Git history. It matters for migration because LFS repos need
            a different path to GitHub.
          </>
        ) : (
          <>
            Got it. Here&rsquo;s what I found about{" "}
            <strong>{fieldLabel}</strong> in the agent&rsquo;s evidence for this
            team.
          </>
        )}
        <Evidence
          title={
            isLfs
              ? "What I found in coreai-backend-main"
              : "What the agent recorded"
          }
          items={
            isLfs
              ? [
                  ".gitattributes has LFS filters for .onnx, .dll",
                  "2.3 GB of binary files tracked via LFS",
                  "Last LFS commit 3 days ago by @jthomas",
                ]
              : [
                  `Current value: ${fieldValue ?? "—"}`,
                  "Source: ADO discovery pass (2 days ago)",
                  "Confidence: medium — inferred from repo metadata",
                ]
          }
        />
      </Turn>

      <Turn speaker="Ada · voice" kind="bot">
        Based on this, I&rsquo;m confident the answer is{" "}
        <strong>{isLfs ? "yes" : (fieldValue ?? "unchanged")}</strong>. Want me
        to fill that in?
        <Proposal value={isLfs ? "true" : (fieldValue ?? "—")} />
      </Turn>
    </div>
  );
}

function Turn({
  speaker,
  kind,
  children,
}: {
  speaker: string;
  kind: "bot" | "user";
  children: React.ReactNode;
}) {
  const isBot = kind === "bot";
  return (
    <div
      className={`flex max-w-[88%] flex-col gap-1 ${isBot ? "self-start" : "self-end items-end"}`}
    >
      <div className="px-[13px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
        {speaker}
      </div>
      <div
        className={`px-[14px] py-[11px] text-[13.5px] leading-[1.55] ${
          isBot
            ? "rounded-[14px] rounded-bl-[4px] border border-border-subtle bg-bg-subtle"
            : "rounded-[14px] rounded-br-[4px] bg-accent text-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function VoiceNote({ duration }: { duration: string }) {
  const bars = [7, 10, 14, 17, 11, 14, 18, 12, 9, 15, 10, 6];
  return (
    <div className="flex items-center gap-2 text-[12.5px]">
      <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-white/25">
        <svg
          className="h-[10px] w-[10px]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </span>
      <span className="flex flex-1 items-center gap-[2px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[2px] rounded-[1px] bg-white/80"
            style={{ height: `${h}px` }}
          />
        ))}
      </span>
      <span className="font-mono text-[10.5px] text-white/85">{duration}</span>
    </div>
  );
}

function Evidence({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-2 rounded-[7px] border border-border-strong bg-bg-elevated px-3 py-[10px]">
      <div className="mb-[6px] flex items-center gap-[5px] font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        <svg
          className="h-[10px] w-[10px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        {title}
      </div>
      <ul className="font-mono text-[11px] leading-[1.7] text-ink-soft">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-[6px]">
            <span className="flex-shrink-0 text-accent">›</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Proposal({ value }: { value: string }) {
  return (
    <div className="mt-[10px] rounded-lg border border-accent-mid bg-accent-soft p-3">
      <div className="mb-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-accent-ink">
        Proposed answer
      </div>
      <div className="mb-[10px] inline-block rounded-[5px] border border-border bg-bg-elevated px-[11px] py-[7px] font-mono text-[12.5px]">
        {value}
      </div>
      <div className="flex flex-wrap gap-[7px]">
        <button
          type="button"
          className="inline-flex items-center gap-[5px] rounded-md border border-accent bg-accent px-[13px] py-[7px] text-[12px] font-semibold text-white hover:bg-accent-ink"
        >
          <svg
            className="h-[11px] w-[11px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Accept this answer
        </button>
        <button
          type="button"
          className="rounded-md border border-border bg-bg-elevated px-[13px] py-[7px] text-[12px] font-semibold text-ink hover:bg-bg-subtle"
        >
          Tell me more
        </button>
        <button
          type="button"
          className="rounded-md border border-border bg-bg-elevated px-[13px] py-[7px] text-[12px] font-semibold text-ink hover:bg-bg-subtle"
        >
          Still not sure
        </button>
      </div>
    </div>
  );
}

function MicBar({ disabled = false }: { disabled?: boolean }) {
  return (
    <div
      className={`border-t border-border px-[22px] pb-5 pt-4 ${disabled ? "opacity-50" : ""}`}
    >
      <div className="mb-3 flex justify-center">
        <button
          type="button"
          disabled={disabled}
          aria-label="Press to speak to Ada"
          className="relative flex h-[62px] w-[62px] items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-600 text-white shadow-[0_4px_18px_rgba(99,102,241,0.4)] transition-transform enabled:hover:scale-105 enabled:active:scale-95 disabled:cursor-not-allowed"
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
      </div>
      <div className="mb-3 text-center font-mono text-[11.5px] text-ink-muted">
        Tap to speak · hold for push-to-talk
      </div>
      <div className="flex flex-wrap justify-center gap-[6px]">
        <MicOption label="Type instead" />
        <MicOption label="Mute Ada" />
        <MicOption label="Hand off" />
      </div>
    </div>
  );
}

function MicOption({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-md border border-border bg-transparent px-[11px] py-[6px] text-[11.5px] font-medium text-ink-muted hover:bg-bg-subtle hover:text-ink"
    >
      {label}
    </button>
  );
}
