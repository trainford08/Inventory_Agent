// Ada chat surface for the program-overview page. Mirrors the visual style
// of /teams/<slug>/review/* (see AdaPanel) — voice-themed turns, evidence
// blocks, gradient mic bar — but renders inline on the page instead of as a
// sidebar, and asks free-form inventory questions (no field context).
//
// Visual prototype only — content is canned, not wired to a model.

export function AdaInventoryChat() {
  return (
    <aside className="sticky top-[57px] flex h-[calc(100vh-57px)] flex-col border-l border-border bg-bg-elevated">
      <Header />
      <Transcript />
      <MicBar />
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

function Header() {
  return (
    <div className="border-b border-border px-[22px] pb-[14px] pt-[18px]">
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
            Migration review assistant · ask anything about your inventory
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Transcript                                                                 */
/* -------------------------------------------------------------------------- */

function Transcript() {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-[22px] py-[22px]">
      <Turn speaker="Ada" kind="bot">
        Hi — I&rsquo;ve loaded the program-wide inventory across all 142 teams.
        Ask me about cohorts, customizations, vendors, coverage, or feature
        leverage and I&rsquo;ll pull the relevant numbers.
      </Turn>

      <Turn speaker="You" kind="user">
        Which cohorts carry the most migration friction?
      </Turn>

      <Turn speaker="Ada" kind="bot">
        Looking across the 142-team scan, <strong>Bravo</strong> and{" "}
        <strong>Echo</strong> dominate the friction footprint.
        <Evidence
          title="Concentration across the program"
          items={[
            "Bravo · 47 teams · only 38% landed as the dominant posture (loosest cohort)",
            "Bravo · 312 of 1,037 anomalies and 11 stale inventories",
            "Echo · 13 teams · 85% deep-hybrid · concentrated S05 build-glue",
            "Echo + Bravo together · 89 of 142 customizations with no GH equivalent",
          ]}
        />
        I&rsquo;d sequence both cohorts last in the wave plan.
      </Turn>

      <Turn speaker="You" kind="user">
        Where should we focus first?
      </Turn>

      <Turn speaker="Ada" kind="bot">
        Highest leverage is in the features used by ≥ 75% of teams — those are
        all <strong>Move</strong>-style migrations and benefit the entire
        program at once.
        <Evidence
          title="High-leverage features (top of program)"
          items={[
            "Branch protection rules · 100% of teams · Move",
            "Pull request workflow · 100% of teams · Move",
            "Required reviewers · 97% of teams · Move",
            "Service connections · 94% of teams · Stay (hybrid)",
          ]}
        />
        Solving these well covers the majority of the program in one swing.
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
      className={`flex max-w-[88%] flex-col gap-1 ${isBot ? "self-start" : "items-end self-end"}`}
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

/* -------------------------------------------------------------------------- */
/* Input bar (text mode)                                                      */
/* -------------------------------------------------------------------------- */

function MicBar() {
  return (
    <div className="border-t border-border bg-bg-subtle px-[18px] pb-4 pt-3">
      <div className="flex items-end gap-2 rounded-xl border border-border bg-bg-elevated px-3 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)] focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(91,95,207,0.12)]">
        <textarea
          rows={1}
          placeholder="Ask Ada about your inventory…"
          className="flex-1 resize-none bg-transparent text-[13.5px] leading-[1.5] text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <button
          type="button"
          aria-label="Send"
          className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-cyan-600 text-white shadow-[0_2px_6px_rgba(99,102,241,0.35)] transition-transform hover:scale-105 active:scale-95"
        >
          <svg
            className="h-[14px] w-[14px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[10.5px] text-ink-muted">
        <span>
          <kbd className="rounded border border-border bg-bg-elevated px-[4px] py-px text-[9.5px] text-ink-soft">
            ↵
          </kbd>{" "}
          to send ·{" "}
          <kbd className="rounded border border-border bg-bg-elevated px-[4px] py-px text-[9.5px] text-ink-soft">
            ⇧↵
          </kbd>{" "}
          for new line
        </span>
        <button
          type="button"
          aria-label="Switch to voice"
          className="inline-flex items-center gap-1 rounded-md px-[7px] py-[3px] text-[10.5px] text-ink-muted hover:bg-bg-elevated hover:text-ink"
        >
          <svg
            className="h-[11px] w-[11px]"
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
          </svg>
          Voice
        </button>
      </div>
    </div>
  );
}
