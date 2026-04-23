import type { Confidence } from "@/generated/prisma/enums";
import { Badge, type BadgeTone } from "./Badge";

const confidenceTones: Record<Confidence, BadgeTone> = {
  HIGH: "danger",
  MEDIUM: "warn",
  LOW: "neutral",
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return <Badge tone={confidenceTones[confidence]}>{confidence}</Badge>;
}
