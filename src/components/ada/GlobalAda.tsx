"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdaPanel } from "./AdaPanel";

type FieldMeta = {
  fieldId: string;
  fieldLabel: string;
  fieldSubject?: string | null;
  fieldValue?: string | null;
};

const FIELD_STORAGE_KEY = "ada:current-field";
const WIDTH_STORAGE_KEY = "ada:drawer-width";
const MIN_WIDTH = 360;
const MAX_WIDTH = 900;
const DEFAULT_WIDTH = 420;

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
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(WIDTH_STORAGE_KEY);
      const n = raw ? parseInt(raw, 10) : NaN;
      if (!Number.isNaN(n))
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, n)));
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(WIDTH_STORAGE_KEY, String(width));
    } catch {
      /* noop */
    }
  }, [width]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const next = window.innerWidth - e.clientX;
      setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, next)));
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startDrag = () => {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

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
        className="fixed bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-600 text-white shadow-[0_4px_18px_rgba(99,102,241,0.45)] transition-all hover:scale-105 active:scale-95"
        style={{ right: open ? width + 16 : 24 }}
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
        <div
          className="fixed inset-y-0 right-0 z-30 flex max-w-[92vw] flex-col border-l border-border bg-bg-elevated shadow-[-12px_0_32px_rgba(0,0,0,0.08)]"
          style={{ width }}
        >
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize Ada drawer"
            onMouseDown={startDrag}
            onDoubleClick={() => setWidth(DEFAULT_WIDTH)}
            className="group absolute inset-y-0 left-0 z-10 w-1.5 -translate-x-1/2 cursor-col-resize select-none"
          >
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-accent-mid" />
          </div>
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
