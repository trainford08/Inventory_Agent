export type FindingForCompletion = {
  status: string;
  lastActor: string | null;
};

export function isHumanVerified(f: FindingForCompletion): boolean {
  return f.status !== "PENDING" && f.lastActor === "HUMAN";
}

export function completionPercent(findings: FindingForCompletion[]): number {
  if (findings.length === 0) return 0;
  const verified = findings.filter(isHumanVerified).length;
  return Math.round((verified / findings.length) * 100);
}
