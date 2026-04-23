export type OutstandingKind = "blocker" | "review" | "flag";

export type OutstandingItem = {
  kind: OutstandingKind;
  title: string;
  meta?: string;
  age?: string;
  urgent?: boolean;
};

const TAG_CLASSES: Record<OutstandingKind, string> = {
  blocker: "bg-danger-soft text-danger-ink",
  review: "bg-warn-soft text-warn-ink",
  flag: "bg-info-soft text-info-ink",
};

const TAG_LABEL: Record<OutstandingKind, string> = {
  blocker: "BLOCKER",
  review: "REVIEW",
  flag: "FLAG",
};

export function OutstandingWork({ items }: { items: OutstandingItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-[22px_24px]">
      <div className="mb-4">
        <div className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Outstanding work
        </div>
        <div className="text-[12px] text-ink-muted">
          Top items the Champion should review
        </div>
      </div>
      {items.length === 0 ? (
        <div className="py-6 text-center text-[13px] text-ink-muted">
          Nothing outstanding — all clear.
        </div>
      ) : (
        <div className="divide-y divide-border-subtle">
          {items.map((item, i) => (
            <Row key={i} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ item }: { item: OutstandingItem }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3 py-[14px] first:pt-0 last:pb-0">
      <span
        className={`mt-px inline-flex items-center rounded px-2 py-[3px] font-mono text-[10px] font-semibold tracking-[0.04em] ${TAG_CLASSES[item.kind]}`}
      >
        {TAG_LABEL[item.kind]}
      </span>
      <div className="min-w-0">
        <div className="text-[13.5px] font-medium leading-[1.35] tracking-[-0.005em] text-ink">
          {item.title}
        </div>
        {item.meta ? (
          <div className="mt-[3px] text-[11.5px] text-ink-muted">
            {item.meta}
          </div>
        ) : null}
      </div>
      {item.age ? (
        <span
          className={`whitespace-nowrap font-mono text-[11px] ${
            item.urgent ? "font-semibold text-danger-ink" : "text-ink-muted"
          }`}
        >
          {item.age}
        </span>
      ) : null}
    </div>
  );
}
