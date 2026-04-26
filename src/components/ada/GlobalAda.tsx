"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdaPanel } from "./AdaPanel";

type FieldMeta = {
  fieldId: string;
  fieldLabel: string;
  fieldSubject?: string | null;
  fieldValue?: string | null;
};

const FIELD_STORAGE_KEY = "ada:current-field";

/**
 * Floating Ada button + drawer. Always available in the app shell.
 *   - Bubble bottom-right opens / closes the drawer
 *   - On review pages, ?ada=<fieldId> auto-opens the drawer
 *   - Field meta (label, subject, value) is bridged from server-rendered
 *     review pages via localStorage so Ada can scope to that field
 */
export function GlobalAda() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const teamSlug = useMemo(() => extractTeamSlug(pathname), [pathname]);
  const adaParam = searchParams.get("ada");

  const [open, setOpen] = useState(false);
  const [field, setField] = useState<FieldMeta | null>(null);

  // Auto-open when a review page sets ?ada=<fieldId>
  useEffect(() => {
    if (!adaParam) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
  }, [adaParam]);

  // Read field context bridged from server-rendered review pages
  useEffect(() => {
    const read = () => {
      try {
        const raw = window.localStorage.getItem(FIELD_STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as FieldMeta | null) : null;
        if (parsed && (!adaParam || parsed.fieldId === adaParam)) {
          setField(parsed);
        } else if (!adaParam) {
          setField(null);
        }
      } catch {
        setField(null);
      }
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, [adaParam]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Ada" : "Open Ada"}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-600 text-white shadow-[0_4px_18px_rgba(99,102,241,0.45)] transition-transform hover:scale-105 active:scale-95"
      >
        {open ? (
          <svg
            className="h-6 w-6"
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
        ) : (
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {open ? (
        <div className="fixed inset-y-0 right-0 z-30 flex w-[420px] max-w-[92vw] flex-col border-l border-border bg-bg-elevated shadow-[-12px_0_32px_rgba(0,0,0,0.08)]">
          <AdaPanel
            fieldId={field?.fieldId ?? null}
            fieldLabel={field?.fieldLabel ?? null}
            fieldSubject={field?.fieldSubject ?? null}
            fieldValue={field?.fieldValue ?? null}
            teamSlug={teamSlug}
          />
        </div>
      ) : null}
    </>
  );
}

/**
 * Companion client component for review pages: writes the active field
 * (resolved server-side) into localStorage so GlobalAda can pick it up.
 */
export function AdaFieldBridge({ field }: { field: FieldMeta | null }) {
  useEffect(() => {
    try {
      if (field) {
        window.localStorage.setItem(FIELD_STORAGE_KEY, JSON.stringify(field));
      } else {
        window.localStorage.removeItem(FIELD_STORAGE_KEY);
      }
      // Notify same-tab listeners (storage event only fires cross-tab)
      window.dispatchEvent(new Event("storage"));
    } catch {
      /* noop */
    }
    return () => {
      try {
        window.localStorage.removeItem(FIELD_STORAGE_KEY);
        window.dispatchEvent(new Event("storage"));
      } catch {
        /* noop */
      }
    };
  }, [field]);
  return null;
}

function extractTeamSlug(pathname: string): string | null {
  const m = pathname.match(/^\/teams\/([^/]+)/);
  return m ? m[1] : null;
}
