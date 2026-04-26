"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AdaPanelProps = {
  fieldLabel: string | null;
  fieldSubject?: string | null;
  fieldValue?: string | null;
  teamSlug?: string | null;
};

/**
 * Ada reviewer-assistant panel. Streams from /api/ada (Claude via Vercel AI SDK).
 * Visible when the URL has `?ada=<fieldId>`. Close clears the param.
 */
export function AdaPanel({
  fieldLabel,
  fieldSubject,
  fieldValue,
  teamSlug,
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
      <ChatBody
        fieldLabel={fieldLabel}
        fieldValue={fieldValue ?? null}
        teamSlug={teamSlug ?? null}
      />
    </aside>
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

function ChatBody({
  fieldLabel,
  fieldValue,
  teamSlug,
}: {
  fieldLabel: string | null;
  fieldValue: string | null;
  teamSlug: string | null;
}) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ada",
      body: { teamSlug, fieldLabel, fieldValue },
    }),
  });

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-[22px] py-[22px]">
        {messages.length === 0 ? (
          <Turn speaker="Ada" kind="bot">
            {fieldLabel ? (
              <>
                I can help you think through <strong>{fieldLabel}</strong>. Ask
                me what it means, what the evidence says, or how teams usually
                answer it.
              </>
            ) : (
              <>Hi — what would you like to know about your migration?</>
            )}
          </Turn>
        ) : (
          messages.map((m) => <MessageTurn key={m.id} message={m} />)
        )}
        {status === "submitted" || status === "streaming" ? (
          <Turn speaker="Ada" kind="bot">
            <span className="inline-flex gap-1">
              <Dot />
              <Dot delay={0.15} />
              <Dot delay={0.3} />
            </span>
          </Turn>
        ) : null}
      </div>
      <div className="border-t border-border p-3">
        <Composer
          teamSlug={teamSlug}
          fieldLabel={fieldLabel}
          fieldValue={fieldValue}
          onSubmit={(text) => sendMessage({ text })}
          disabled={status === "submitted" || status === "streaming"}
        />
      </div>
    </>
  );
}

function MessageTurn({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  const isBot = message.role !== "user";
  return (
    <Turn
      speaker={message.role === "user" ? "You" : "Ada"}
      kind={isBot ? "bot" : "user"}
    >
      {isBot ? (
        <div className="prose-ada">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      ) : (
        <span className="whitespace-pre-wrap">{text}</span>
      )}
    </Turn>
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

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-ink-faint"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

function Composer({
  onSubmit,
  disabled,
}: {
  teamSlug: string | null;
  fieldLabel: string | null;
  fieldValue: string | null;
  onSubmit?: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const noop = !onSubmit;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const text = value.trim();
        if (!text || !onSubmit) return;
        onSubmit(text);
        setValue("");
      }}
      className="flex items-center gap-2"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          noop ? "Open a field to chat with Ada" : "Ask Ada anything…"
        }
        disabled={disabled || noop}
        className="flex-1 rounded-md border border-border bg-bg-elevated px-3 py-[8px] text-[13px] outline-none focus:border-accent-mid disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || noop || !value.trim()}
        className="rounded-md bg-accent px-3 py-[8px] text-[12.5px] font-semibold text-white disabled:opacity-40"
      >
        Send
      </button>
    </form>
  );
}
