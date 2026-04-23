import Link from "next/link";
import { Fragment } from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-ink-muted">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="text-[11px] text-ink-faint">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="rounded-sm px-2 py-1 text-ink-muted hover:bg-bg-subtle hover:text-ink"
            >
              {item.label}
            </Link>
          ) : (
            <span className="px-2 py-1 font-medium text-ink">{item.label}</span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
