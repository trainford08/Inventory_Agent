import type { MigrationState } from "@/generated/prisma/enums";
import { Badge, type BadgeTone } from "./Badge";

const stateTones: Record<MigrationState, BadgeTone> = {
  NOT_STARTED: "neutral",
  DISCOVERING: "info",
  REVIEWING: "warn",
  READY: "success",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  ROLLED_BACK: "danger",
};

const stateLabels: Record<MigrationState, string> = {
  NOT_STARTED: "Not started",
  DISCOVERING: "Discovering",
  REVIEWING: "Reviewing",
  READY: "Ready",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  ROLLED_BACK: "Rolled back",
};

export function StateBadge({ state }: { state: MigrationState }) {
  return <Badge tone={stateTones[state]}>{stateLabels[state]}</Badge>;
}
