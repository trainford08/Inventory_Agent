"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function TabLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`-mb-px border-b-2 px-4 py-[10px] text-[13.5px] font-medium tracking-[-0.005em] transition-colors ${
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
