import Link from "next/link";

export function CompleteProfileHero({
  teamName,
  teamSlug,
  lastSavedLabel,
  hasStarted,
}: {
  teamName: string;
  teamSlug: string;
  lastSavedLabel: string;
  hasStarted: boolean;
}) {
  return (
    <header className="mb-8">
      <div className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
        Team profile · <span className="text-primary">{teamName}</span>
      </div>
      <h1 className="mb-3 text-[30px] font-bold leading-[1.15] tracking-[-0.025em] text-ink">
        Complete your team&rsquo;s migration profile
      </h1>
      <p className="mb-5 max-w-[720px] text-[14.5px] leading-[1.55] text-ink-soft">
        The agents have done the first pass across your team&apos;s ADO
        footprint.{" "}
        <span className="font-semibold text-ink">
          Review and confirm the findings
        </span>{" "}
        so your team can move forward in the migration. Progress saves
        automatically — you can stop and resume any time.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={`/teams/${teamSlug}/review`}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-[16px] py-[10px] text-[13px] font-semibold text-white transition-colors hover:bg-[#18181b]"
        >
          {hasStarted ? "Continue profile" : "Start review"}
          <ArrowRight />
        </Link>
        <div className="flex items-center gap-4 font-mono text-[11.5px] text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon />
            ~20 min first pass
          </span>
          <span className="inline-flex items-center gap-1.5">
            <SparkleIcon />
            Last saved {lastSavedLabel}
          </span>
        </div>
      </div>
    </header>
  );
}

function ArrowRight() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 14l.7 2.1L22 17l-2.3.9L19 20l-.7-2.1L16 17l2.3-.9L19 14z" />
    </svg>
  );
}
