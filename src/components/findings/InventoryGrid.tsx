import type { ReactNode } from "react";

export type InventoryTile = {
  key: string;
  icon: ReactNode;
  count: number | string;
  label: string;
  sublabel: string;
};

export function InventoryGrid({ tiles }: { tiles: InventoryTile[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-elevated">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {tiles.map((tile, i) => (
          <Tile
            key={tile.key}
            tile={tile}
            isLastInRow={(i + 1) % 3 === 0}
            isLastRow={i >= tiles.length - 3}
          />
        ))}
      </div>
    </div>
  );
}

function Tile({
  tile,
  isLastInRow,
  isLastRow,
}: {
  tile: InventoryTile;
  isLastInRow: boolean;
  isLastRow: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-[20px] py-[16px] ${
        isLastInRow ? "" : "md:border-r md:border-border"
      } ${isLastRow ? "" : "border-b border-border"}`}
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[7px] bg-primary-soft text-primary">
        {tile.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[19px] font-bold leading-none tracking-[-0.02em] text-ink">
            {tile.count}
          </span>
        </div>
        <div className="text-[12px] font-medium text-ink-soft">
          {tile.label}
        </div>
        <div className="mt-px font-mono text-[10px] text-ink-muted">
          {tile.sublabel}
        </div>
      </div>
    </div>
  );
}

const ICON_CLASS = "h-4 w-4";

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      className={ICON_CLASS}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const InventoryIcons = {
  org: (
    <Svg>
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
    </Svg>
  ),
  cohort: (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 010 18" />
      <path d="M12 3a15 15 0 000 18" />
    </Svg>
  ),
  repo: (
    <Svg>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </Svg>
  ),
  pipeline: (
    <Svg>
      <rect x="2" y="4" width="20" height="6" rx="1" />
      <rect x="2" y="14" width="20" height="6" rx="1" />
      <path d="M6 10v4" />
      <path d="M12 10v4" />
      <path d="M18 10v4" />
    </Svg>
  ),
  jtbd: (
    <Svg>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </Svg>
  ),
  custom: (
    <Svg>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </Svg>
  ),
  risk: (
    <Svg>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Svg>
  ),
  member: (
    <Svg>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </Svg>
  ),
  ownership: (
    <Svg>
      <path d="M20 21v-2a4 4 0 00-3-3.87" />
      <path d="M4 21v-2a4 4 0 013-3.87" />
      <circle cx="12" cy="7" r="4" />
    </Svg>
  ),
};
