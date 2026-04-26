"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { editFinding } from "@/server/actions/finding-actions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AdaPanelProps = {
  fieldId?: string | null;
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
  fieldId,
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
        fieldId={fieldId ?? null}
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
  fieldId,
  fieldLabel,
  fieldValue,
  teamSlug,
}: {
  fieldId: string | null;
  fieldLabel: string | null;
  fieldValue: string | null;
  teamSlug: string | null;
}) {
  const storageKey = `ada:conv:${teamSlug ?? "no-team"}`;
  const initialMessages = useMemo<UIMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as UIMessage[]) : [];
    } catch {
      return [];
    }
  }, [storageKey]);

  const { messages, sendMessage, setMessages, status } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/ada",
      body: { teamSlug, fieldId, fieldLabel, fieldValue },
    }),
  });

  // Track each "field open" event so we can show a divider in the chat
  // thread at the message-index where the user clicked "Not sure".
  const [fieldEvents, setFieldEvents] = useState<
    { index: number; label: string }[]
  >([]);
  const lastFieldIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (!fieldId || !fieldLabel) return;
    if (lastFieldIdRef.current === fieldId) return;
    lastFieldIdRef.current = fieldId;
    setFieldEvents((prev) => [
      ...prev,
      { index: messages.length, label: fieldLabel },
    ]);
  }, [fieldId, fieldLabel, messages.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (status === "submitted" || status === "streaming") return;
    try {
      if (messages.length === 0) {
        window.localStorage.removeItem(storageKey);
      } else {
        window.localStorage.setItem(storageKey, JSON.stringify(messages));
      }
    } catch {
      /* quota / privacy mode — silently skip */
    }
  }, [messages, status, storageKey]);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const clear = () => {
    setMessages([]);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        /* noop */
      }
    }
  };

  return (
    <>
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-[22px] py-[22px]"
      >
        {messages.length === 0 ? (
          <>
            {fieldLabel ? <FieldOpenedBanner label={fieldLabel} /> : null}
            <Turn speaker="Ada" kind="bot">
              {fieldLabel ? (
                <>
                  I can help you think through <strong>{fieldLabel}</strong>.
                  Ask me what it means, what the evidence says, or how teams
                  usually answer it.
                </>
              ) : (
                <>Hi — what would you like to know about your migration?</>
              )}
            </Turn>
          </>
        ) : (
          messages.map((m, i) => (
            <React.Fragment key={m.id}>
              {fieldEvents
                .filter((e) => e.index === i)
                .map((e, j) => (
                  <FieldOpenedBanner key={`evt-${i}-${j}`} label={e.label} />
                ))}
              <MessageTurn
                message={m}
                teamSlug={teamSlug}
                fieldId={fieldId}
                sendMessage={sendMessage}
              />
            </React.Fragment>
          ))
        )}
        {/* trailing events that landed at the end of the list */}
        {messages.length > 0
          ? fieldEvents
              .filter((e) => e.index >= messages.length)
              .map((e, j) => (
                <FieldOpenedBanner key={`evt-end-${j}`} label={e.label} />
              ))
          : null}
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
        {messages.length > 0 ? (
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={clear}
              className="text-[11px] text-ink-muted hover:text-ink"
            >
              Clear conversation
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

function MessageTurn({
  message,
  teamSlug,
  fieldId,
  sendMessage,
}: {
  message: UIMessage;
  teamSlug: string | null;
  fieldId: string | null;
  sendMessage: (msg: { text: string }) => void;
}) {
  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("");
  const proposal = extractProposal(message);
  const toolCalls = extractToolCalls(message);
  const isBot = message.role !== "user";
  return (
    <>
      {isBot && toolCalls.length > 0 ? (
        <div className="flex flex-col gap-1 self-start">
          {toolCalls.map((tc) => (
            <ToolCallPill key={tc.id} call={tc} />
          ))}
        </div>
      ) : null}
      <Turn
        speaker={message.role === "user" ? "You" : "Ada"}
        kind={isBot ? "bot" : "user"}
      >
        {isBot ? (
          <div className="prose-ada">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p>{linkifyIds(children, teamSlug)}</p>,
                li: ({ children }) => <li>{linkifyIds(children, teamSlug)}</li>,
                strong: ({ children }) => (
                  <strong>{linkifyIds(children, teamSlug)}</strong>
                ),
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        ) : (
          <span className="whitespace-pre-wrap">{text}</span>
        )}
      </Turn>
      {proposal ? (
        <ProposalCard
          proposal={proposal}
          fieldId={fieldId}
          onTellMore={() =>
            sendMessage({
              text: "Walk me through your reasoning in more detail.",
            })
          }
          onStillUnsure={() =>
            sendMessage({
              text: "I'm still not sure. What evidence would help?",
            })
          }
        />
      ) : null}
    </>
  );
}

type Proposal = {
  value: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
};

type ToolCall = {
  id: string;
  name: string;
  state: "running" | "done" | "error";
};

const TOOL_LABELS: Record<string, string> = {
  getTeamSummary: "Looking up team profile",
  listJtbds: "Listing JTBDs",
  listFeatures: "Listing features",
  listEntities: "Listing entities",
  getItem: "Fetching item details",
  getCustomizations: "Fetching customizations",
  getProgramOverview: "Pulling program rollup",
  listTeamsByFriction: "Ranking teams by friction",
  searchFindings: "Searching agent findings",
  getReviewProgress: "Checking review progress",
  getCohortBreakdown: "Aggregating by cohort",
  proposeAnswer: "Drafting a proposed answer",
};

function extractToolCalls(message: UIMessage): ToolCall[] {
  const calls: ToolCall[] = [];
  for (const part of message.parts as Array<{
    type: string;
    toolCallId?: string;
    toolName?: string;
    state?: string;
  }>) {
    if (!part.type.startsWith("tool-")) continue;
    if (part.type === "tool-input-error") continue;
    const name =
      part.toolName ??
      (part.type.startsWith("tool-") ? part.type.slice(5) : "tool");
    if (name === "tool" || name === "input") continue;
    const id = part.toolCallId ?? `${name}-${calls.length}`;
    let state: ToolCall["state"] = "running";
    if (part.state === "output-available") state = "done";
    else if (part.state === "output-error") state = "error";
    // Dedupe by id, keeping the latest state
    const existing = calls.findIndex((c) => c.id === id);
    if (existing >= 0) calls[existing] = { id, name, state };
    else calls.push({ id, name, state });
  }
  return calls;
}

function ToolCallPill({ call }: { call: ToolCall }) {
  const label = TOOL_LABELS[call.name] ?? `Calling ${call.name}`;
  const tone =
    call.state === "done"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : call.state === "error"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-indigo-200 bg-indigo-50 text-indigo-700";
  const icon =
    call.state === "done" ? "✓" : call.state === "error" ? "✗" : "⏳";
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] font-mono text-[10.5px] ${tone}`}
    >
      <span className="text-[10px]">{icon}</span>
      <span className="font-semibold">{label}</span>
      <span className="text-[10px] opacity-60">· {call.name}</span>
    </div>
  );
}

function extractProposal(message: UIMessage): Proposal | null {
  for (const part of message.parts) {
    const p = part as { type: string; output?: unknown; result?: unknown };
    if (p.type === "tool-proposeAnswer") {
      const out = (p.output ?? p.result) as Proposal | undefined;
      if (out && typeof out.value === "string") return out;
    }
  }
  return null;
}

const ID_RE = /\b([JFE])(\d{2,3})\b/g;

function linkifyIds(
  children: React.ReactNode,
  teamSlug: string | null,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child !== "string") return child;
    const parts: React.ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    ID_RE.lastIndex = 0;
    while ((m = ID_RE.exec(child)) !== null) {
      if (m.index > last) parts.push(child.slice(last, m.index));
      const id = `${m[1]}${m[2]}`;
      parts.push(
        <IdChip key={`${id}-${m.index}`} id={id} teamSlug={teamSlug} />,
      );
      last = m.index + m[0].length;
    }
    if (last < child.length) parts.push(child.slice(last));
    return parts.length ? parts : child;
  });
}

function IdChip({ id, teamSlug }: { id: string; teamSlug: string | null }) {
  const kind = id[0] as "J" | "F" | "E";
  const tone =
    kind === "J"
      ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
      : kind === "F"
        ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
  if (!teamSlug) {
    return (
      <span
        className={`inline-flex items-center rounded px-[5px] py-[1px] font-mono text-[10.5px] font-semibold ${tone}`}
      >
        {id}
      </span>
    );
  }
  return (
    <Link
      href={`/teams/${teamSlug}/inventory?focus=${id}`}
      className={`inline-flex items-center rounded px-[5px] py-[1px] font-mono text-[10.5px] font-semibold transition-colors ${tone}`}
    >
      {id}
    </Link>
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

function FieldOpenedBanner({ label }: { label: string }) {
  return (
    <div className="my-1 flex items-center gap-2 self-stretch">
      <div className="h-px flex-1 bg-border" />
      <div className="rounded-full border border-accent-mid bg-accent-soft px-2.5 py-[3px] font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent-ink">
        Now helping with: {label}
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function ProposalCard({
  proposal,
  fieldId,
  onTellMore,
  onStillUnsure,
}: {
  proposal: Proposal;
  fieldId: string | null;
  onTellMore: () => void;
  onStillUnsure: () => void;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const accept = async () => {
    if (!fieldId || state === "saving") return;
    setState("saving");
    const res = await editFinding({
      findingId: fieldId,
      value: proposal.value,
    });
    if (res.ok) {
      setState("saved");
      router.refresh();
    } else {
      setState("error");
    }
  };
  const tone =
    proposal.confidence === "high"
      ? "border-emerald-300 bg-emerald-50/60"
      : proposal.confidence === "medium"
        ? "border-amber-300 bg-amber-50/60"
        : "border-rose-300 bg-rose-50/60";
  return (
    <div
      className={`mt-1 self-start rounded-lg border ${tone} p-3 max-w-[88%]`}
    >
      <div className="mb-1.5 flex items-center justify-between font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        <span>Proposed answer</span>
        <span>Confidence: {proposal.confidence}</span>
      </div>
      <div className="mb-2 inline-block rounded-[5px] border border-border bg-bg-elevated px-[11px] py-[7px] font-mono text-[12.5px]">
        {proposal.value}
      </div>
      <div className="mb-2.5 text-[11.5px] italic leading-snug text-ink-soft">
        {proposal.reasoning}
      </div>
      <div className="flex flex-wrap gap-[7px]">
        <button
          type="button"
          onClick={accept}
          disabled={!fieldId || state === "saving" || state === "saved"}
          className="inline-flex items-center gap-[5px] rounded-md border border-emerald-600 bg-emerald-600 px-[13px] py-[7px] text-[12px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {state === "saved"
            ? "✓ Accepted"
            : state === "saving"
              ? "Saving…"
              : state === "error"
                ? "Retry"
                : "Accept this answer"}
        </button>
        <button
          type="button"
          onClick={onTellMore}
          className="rounded-md border border-border bg-bg-elevated px-[13px] py-[7px] text-[12px] font-semibold text-ink hover:bg-bg-subtle"
        >
          Tell me more
        </button>
        <button
          type="button"
          onClick={onStillUnsure}
          className="rounded-md border border-border bg-bg-elevated px-[13px] py-[7px] text-[12px] font-semibold text-ink hover:bg-bg-subtle"
        >
          Still not sure
        </button>
      </div>
      {!fieldId ? (
        <div className="mt-2 text-[10.5px] italic text-ink-muted">
          Open a field via &quot;Not sure&quot; to enable Accept.
        </div>
      ) : null}
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
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null);
  const noop = !onSubmit;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor })
        .webkitSpeechRecognition;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (Ctor) setVoiceSupported(true);
  }, []);

  const startVoice = () => {
    if (typeof window === "undefined") return;
    const Ctor =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor })
        .webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setValue(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

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
          listening
            ? "Listening…"
            : noop
              ? "Open a field to chat with Ada"
              : "Ask Ada anything…"
        }
        disabled={disabled || noop}
        className="flex-1 rounded-md border border-border bg-bg-elevated px-3 py-[8px] text-[13px] outline-none focus:border-accent-mid disabled:opacity-50"
      />
      {voiceSupported ? (
        <button
          type="button"
          onClick={listening ? stopVoice : startVoice}
          disabled={disabled || noop}
          aria-label={listening ? "Stop dictation" : "Dictate"}
          className={`flex h-[34px] w-[34px] items-center justify-center rounded-md border transition-colors disabled:opacity-40 ${
            listening
              ? "animate-pulse border-rose-400 bg-rose-50 text-rose-600"
              : "border-border bg-bg-elevated text-ink-muted hover:bg-bg-subtle hover:text-ink"
          }`}
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
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
      ) : null}
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

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult:
    | ((event: {
        resultIndex: number;
        results: {
          [index: number]: { [index: number]: { transcript: string } };
        } & {
          length: number;
        };
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
