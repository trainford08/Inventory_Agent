import type { MigrationState } from "@/generated/prisma/enums";

export const PHASE_STEPS = [
  "Discovery",
  "Verification",
  "Planning",
  "Execution",
  "Cutover",
] as const;

export type PhaseStep = (typeof PHASE_STEPS)[number];

type PhaseSnapshot = {
  currentStep: PhaseStep;
  currentStepPercent: number;
  overallPercent: number;
  stepStates: Array<"complete" | "active" | "pending">;
};

const stateMap: Record<
  MigrationState,
  { stepIndex: number; stepPercent: number }
> = {
  NOT_STARTED: { stepIndex: 0, stepPercent: 10 },
  DISCOVERING: { stepIndex: 0, stepPercent: 60 },
  REVIEWING: { stepIndex: 1, stepPercent: 50 },
  READY: { stepIndex: 2, stepPercent: 80 },
  IN_PROGRESS: { stepIndex: 3, stepPercent: 55 },
  COMPLETED: { stepIndex: 4, stepPercent: 100 },
  ROLLED_BACK: { stepIndex: 4, stepPercent: 100 },
};

export function phaseSnapshot(state: MigrationState): PhaseSnapshot {
  const { stepIndex, stepPercent } = stateMap[state];
  const stepStates = PHASE_STEPS.map((_, i) =>
    i < stepIndex ? "complete" : i === stepIndex ? "active" : "pending",
  ) as PhaseSnapshot["stepStates"];

  const overallPercent = Math.round(
    (stepIndex * 100 + stepPercent) / PHASE_STEPS.length,
  );

  return {
    currentStep: PHASE_STEPS[stepIndex],
    currentStepPercent: stepPercent,
    overallPercent,
    stepStates,
  };
}
