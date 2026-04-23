"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const teamSlugMatch = pathname.match(/^\/teams\/([^/]+)/);
  const teamSlug = teamSlugMatch ? teamSlugMatch[1] : null;

  return (
    <aside className="flex flex-col border-r border-border bg-sidebar-bg px-[14px] py-[20px]">
      <Brand />

      <NavGroup label="Program">
        <NavItem
          href="/teams"
          active={pathname === "/teams"}
          icon={
            <>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </>
          }
        >
          Team profiles
        </NavItem>
      </NavGroup>

      {teamSlug ? (
        <NavGroup label="This team">
          <NavItem
            href={`/teams/${teamSlug}/complete`}
            active={pathname === `/teams/${teamSlug}/complete`}
            icon={
              <>
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </>
            }
          >
            Complete profile
          </NavItem>
          <NavItem
            href={`/teams/${teamSlug}`}
            active={pathname === `/teams/${teamSlug}`}
            icon={
              <>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </>
            }
          >
            Overview
          </NavItem>
          <NavItem
            href={`/teams/${teamSlug}/findings`}
            active={pathname === `/teams/${teamSlug}/findings`}
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
            href={`/teams/${teamSlug}/review`}
            active={pathname === `/teams/${teamSlug}/review`}
            icon={
              <>
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </>
            }
          >
            Review
          </NavItem>
        </NavGroup>
      ) : null}

      <div className="mt-auto border-t border-border pt-4">
        <div className="flex items-center gap-[10px] rounded-md px-[10px] py-[8px] hover:bg-sidebar-hover">
          <div className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-[11px] font-semibold text-white">
            DU
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold tracking-[-0.005em]">
              Demo user
            </div>
            <div className="truncate font-mono text-[10.5px] text-ink-muted">
              Champion · stub auth
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Brand() {
  return (
    <Link
      href="/teams"
      className="flex items-center gap-[10px] px-[10px] pb-[22px] pt-[4px]"
    >
      <div className="flex h-[32px] w-[32px] items-center justify-center rounded-md bg-gradient-to-br from-primary to-purple text-[13px] font-bold text-white shadow-[0_1px_2px_rgba(91,95,207,0.25)]">
        M
      </div>
      <div className="text-[14px] font-semibold tracking-[-0.01em] text-ink">
        Migration Hub
      </div>
    </Link>
  );
}

function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4">
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
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`mb-px flex items-center gap-[10px] rounded-md px-[10px] py-[8px] text-[13.5px] font-medium transition-colors ${
        active
          ? "bg-sidebar-active font-semibold text-primary"
          : "text-ink-soft hover:bg-sidebar-hover hover:text-ink"
      }`}
    >
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
      {children}
    </Link>
  );
}
