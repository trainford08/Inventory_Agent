import type { CustomizationStatus, RiskStatus } from "@/generated/prisma/enums";
import { Badge, type BadgeTone } from "./Badge";

const customizationTones: Record<CustomizationStatus, BadgeTone> = {
  UNKNOWN: "neutral",
  AGENT_HANDLED: "success",
  NEEDS_HUMAN: "warn",
  RESOLVED: "success",
};

const customizationLabels: Record<CustomizationStatus, string> = {
  UNKNOWN: "Unknown",
  AGENT_HANDLED: "Agent handled",
  NEEDS_HUMAN: "Needs human",
  RESOLVED: "Resolved",
};

export function CustomizationStatusBadge({
  status,
}: {
  status: CustomizationStatus;
}) {
  return (
    <Badge tone={customizationTones[status]}>
      {customizationLabels[status]}
    </Badge>
  );
}

const riskTones: Record<RiskStatus, BadgeTone> = {
  OPEN: "neutral",
  MITIGATED: "info",
  ACCEPTED: "neutral",
  CLOSED: "success",
};

const riskLabels: Record<RiskStatus, string> = {
  OPEN: "Open",
  MITIGATED: "Mitigated",
  ACCEPTED: "Accepted",
  CLOSED: "Closed",
};

export function RiskStatusBadge({ status }: { status: RiskStatus }) {
  return <Badge tone={riskTones[status]}>{riskLabels[status]}</Badge>;
}
