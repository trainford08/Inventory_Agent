export function ProgressRing({
  percent,
  size = 44,
  state = "progress",
}: {
  percent: number;
  size?: number;
  state?: "progress" | "complete";
}) {
  const stroke = 4;
  const r = size / 2 - stroke;
  const circumference = 2 * Math.PI * r;
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const dashoffset =
    state === "complete" ? 0 : circumference * (1 - clampedPercent / 100);

  const fillClass =
    state === "complete" ? "stroke-[#16a34a]" : "stroke-[#5b5fcf]";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-bg-muted"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className={fillClass}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-mono text-[10.5px] font-bold tracking-[-0.02em] text-ink">
        {state === "complete" ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          `${Math.round(clampedPercent)}%`
        )}
      </div>
    </div>
  );
}
