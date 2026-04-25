"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { SidebarTeamProgress } from "@/server/complete-profile";

// Order mirrors the Complete profile page's section grid. Only Code & repos
// is wired to a real review route today; the rest render as placeholders.
// `sectionKey` keys into the per-team section progress data.
const PROFILE_SUBSECTIONS: Array<{
  label: string;
  sectionKey:
    | "scope"
    | "code"
    | "access"
    | "customizations"
    | "dependencies"
    | "readiness";
  reviewSlug: string | null;
}> = [
  { label: "Scope & stakeholders", sectionKey: "scope", reviewSlug: null },
  { label: "Code & repos", sectionKey: "code", reviewSlug: "code-and-repos" },
  { label: "Access & identity", sectionKey: "access", reviewSlug: null },
  { label: "Customizations", sectionKey: "customizations", reviewSlug: null },
  { label: "Dependencies", sectionKey: "dependencies", reviewSlug: null },
  { label: "Readiness & risks", sectionKey: "readiness", reviewSlug: null },
];

export function Sidebar({
  defaultTeamSlug = null,
  progressByTeam = [],
}: {
  defaultTeamSlug?: string | null;
  progressByTeam?: SidebarTeamProgress[];
}) {
  const pathname = usePathname();
  const teamSlugMatch = pathname.match(/^\/teams\/([^/]+)/);
  const activeTeamSlug = teamSlugMatch ? teamSlugMatch[1] : null;
  const teamSlug = activeTeamSlug ?? defaultTeamSlug;

  // Contextual expand: show Review sub-sections only when the reviewer is
  // inside the Complete profile or Review flow for a specific team.
  const showReviewSections =
    !!activeTeamSlug &&
    (pathname === `/teams/${activeTeamSlug}/complete` ||
      pathname.startsWith(`/teams/${activeTeamSlug}/review`));
  const activeSectionSlug =
    showReviewSections &&
    pathname.startsWith(`/teams/${activeTeamSlug}/review/`)
      ? pathname.slice(`/teams/${activeTeamSlug}/review/`.length).split("/")[0]
      : null;

  // Pull section progress for the team whose sub-nav is currently showing.
  const sectionProgress = showReviewSections
    ? (progressByTeam.find((t) => t.slug === activeTeamSlug)?.sections ?? [])
    : [];
  const totalReviewed = sectionProgress.reduce(
    (n, s) => n + s.reviewedCount,
    0,
  );
  const totalItems = sectionProgress.reduce((n, s) => n + s.totalCount, 0);

  return (
    <aside className="flex flex-col border-r border-border bg-sidebar-bg px-[14px] py-[20px]">
      <Brand />

      <NavGroup label="Program">
        <NavItem
          href="/inventory"
          active={pathname === "/inventory"}
          icon={
            <>
              <path d="M3 3h7v7H3z" />
              <path d="M14 3h7v7h-7z" />
              <path d="M14 14h7v7h-7z" />
              <path d="M3 14h7v7H3z" />
            </>
          }
        >
          Inventory
        </NavItem>
        <PlainSubNavItem
          href="/inventory/program-overview"
          active={pathname === "/inventory/program-overview"}
          label="Inventory overview"
        />
        <PlainSubNavItem
          href="/inventory"
          active={pathname === "/inventory"}
          label="Team inventories"
        />
      </NavGroup>

      <NavGroup label="This team">
        <NavItem
          href={teamSlug ? `/teams/${teamSlug}` : undefined}
          active={!!activeTeamSlug && pathname === `/teams/${activeTeamSlug}`}
          icon={
            <>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </>
          }
        >
          Team overview
        </NavItem>
        <NavItem
          href={teamSlug ? `/teams/${teamSlug}/findings` : undefined}
          active={
            !!activeTeamSlug && pathname === `/teams/${activeTeamSlug}/findings`
          }
          icon={
            <>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </>
          }
        >
          Agent findings
        </NavItem>
        <NavItem
          href={teamSlug ? `/teams/${teamSlug}/complete` : undefined}
          active={
            !!activeTeamSlug && pathname === `/teams/${activeTeamSlug}/complete`
          }
          icon={
            <>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 12l2 2 4-4" />
            </>
          }
          trailing={
            showReviewSections && totalItems > 0
              ? `${totalReviewed}/${totalItems}`
              : undefined
          }
        >
          Complete profile
        </NavItem>
        {showReviewSections
          ? PROFILE_SUBSECTIONS.map((s) => {
              const progress = sectionProgress.find(
                (p) => p.key === s.sectionKey,
              );
              const reviewed = progress?.reviewedCount ?? 0;
              const total = progress?.totalCount ?? 0;
              const href = s.reviewSlug
                ? `/teams/${activeTeamSlug}/review/${s.reviewSlug}`
                : undefined;
              return (
                <SubNavItem
                  key={s.label}
                  href={href}
                  active={
                    s.reviewSlug !== null && activeSectionSlug === s.reviewSlug
                  }
                  label={s.label}
                  reviewed={reviewed}
                  total={total}
                />
              );
            })
          : null}
      </NavGroup>

      <div className="mt-auto border-t border-border pt-4">
        <div className="flex items-center gap-[10px] rounded-md px-[10px] py-[8px] hover:bg-sidebar-hover">
          <div className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-[10px] font-semibold text-white">
            AK
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold tracking-[-0.005em]">
              Aisha Khan
            </div>
            <div className="truncate font-mono text-[11.5px] text-ink-muted">
              Principal PM
            </div>
          </div>
          <svg
            className="h-[14px] w-[14px] text-ink-faint"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </aside>
  );
}

function Brand() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-[10px] px-[10px] pb-[22px] pt-[4px]"
    >
      <div className="flex h-[32px] w-[32px] items-center justify-center rounded-md bg-gradient-to-br from-primary to-purple text-[13px] font-bold text-white shadow-[0_1px_2px_rgba(91,95,207,0.25)]">
        M
      </div>
      <div className="flex flex-col gap-[1px]">
        <div className="text-[14px] font-semibold leading-none tracking-[-0.01em] text-ink">
          Migration Hub
        </div>
        <div className="font-mono text-[11px] text-ink-muted">v2.1</div>
      </div>
    </Link>
  );
}

function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-[18px]">
      <div className="mb-[6px] px-[10px] font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
        {label}
      </div>
      {children}
    </div>
  );
}

function NavItem({
  href,
  active,
  icon,
  children,
  trailing,
}: {
  href?: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
  trailing?: string;
}) {
  const className = `mb-px flex items-center gap-[10px] rounded-md px-[10px] py-[8px] text-[13.5px] font-medium transition-colors ${
    active
      ? "bg-sidebar-active font-semibold text-primary"
      : "cursor-pointer text-ink-soft hover:bg-sidebar-hover hover:text-ink"
  }`;

  const content = (
    <>
      <svg
        className={`h-4 w-4 flex-shrink-0 ${active ? "" : "opacity-75"}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </svg>
      <span className="flex-1">{children}</span>
      {trailing ? (
        <span
          className={`font-mono text-[11px] font-medium ${active ? "text-primary" : "text-ink-muted"}`}
        >
          {trailing}
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <div className={className} aria-disabled="true">
      {content}
    </div>
  );
}

function PlainSubNavItem({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  const className = `mb-px flex items-center gap-[10px] rounded-md py-[6px] pl-[34px] pr-[10px] text-[12.5px] transition-colors ${
    active
      ? "bg-sidebar-active font-semibold text-primary"
      : "cursor-pointer text-ink-soft hover:bg-sidebar-hover hover:text-ink"
  }`;
  return (
    <Link href={href} className={className}>
      <span
        className={`h-[7px] w-[7px] flex-shrink-0 rounded-full ${
          active
            ? "bg-primary shadow-[0_0_0_3px_rgba(91,95,207,0.18)]"
            : "bg-bg-muted"
        }`}
      />
      <span className="flex-1 truncate">{label}</span>
    </Link>
  );
}

function SubNavItem({
  href,
  active,
  label,
  reviewed,
  total,
}: {
  href?: string;
  active: boolean;
  label: string;
  reviewed: number;
  total: number;
}) {
  const isDone = total > 0 && reviewed >= total;
  const isEmpty = total === 0 || reviewed === 0;
  const fillPct = total > 0 ? Math.round((reviewed / total) * 100) : 0;
  const dotClass = active
    ? "bg-primary shadow-[0_0_0_3px_rgba(91,95,207,0.18)]"
    : isDone
      ? "bg-success"
      : isEmpty
        ? "bg-bg-muted"
        : "";
  const dotStyle =
    !active && !isDone && !isEmpty
      ? {
          background: `conic-gradient(var(--color-primary) ${fillPct}%, var(--color-bg-muted) ${fillPct}%)`,
        }
      : undefined;
  const trailing =
    total === 0 ? null : isDone ? "done" : `${reviewed}/${total}`;
  const trailingClass = active
    ? "text-primary"
    : isDone
      ? "text-success-ink"
      : "text-ink-muted";
  const className = `mb-px flex items-center gap-[10px] rounded-md py-[6px] pl-[34px] pr-[10px] text-[12.5px] transition-colors ${
    active
      ? "bg-sidebar-active font-semibold text-primary"
      : href
        ? "cursor-pointer text-ink-soft hover:bg-sidebar-hover hover:text-ink"
        : isEmpty
          ? "text-ink-faint"
          : "text-ink-soft"
  }`;
  const content = (
    <>
      <span
        className={`h-[7px] w-[7px] flex-shrink-0 rounded-full ${dotClass}`}
        style={dotStyle}
      />
      <span className="flex-1 truncate">{label}</span>
      {trailing !== null ? (
        <span
          className={`font-mono text-[10.5px] font-medium ${trailingClass}`}
        >
          {trailing}
        </span>
      ) : null}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <div className={className} aria-disabled="true">
      {content}
    </div>
  );
}
