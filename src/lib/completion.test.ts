import { describe, expect, it } from "vitest";
import { completionPercent, isHumanVerified } from "./completion";

describe("isHumanVerified", () => {
  it("is true when a finding has been moved out of PENDING by a human", () => {
    expect(isHumanVerified({ status: "ACCEPTED", lastActor: "HUMAN" })).toBe(
      true,
    );
    expect(isHumanVerified({ status: "CORRECTED", lastActor: "HUMAN" })).toBe(
      true,
    );
    expect(isHumanVerified({ status: "OVERRIDDEN", lastActor: "HUMAN" })).toBe(
      true,
    );
  });

  it("is false when status is still PENDING, regardless of actor", () => {
    expect(isHumanVerified({ status: "PENDING", lastActor: null })).toBe(false);
    expect(isHumanVerified({ status: "PENDING", lastActor: "HUMAN" })).toBe(
      false,
    );
  });

  it("is false when the agent moved the finding out of PENDING (no human review)", () => {
    expect(isHumanVerified({ status: "ACCEPTED", lastActor: "AGENT" })).toBe(
      false,
    );
  });

  it("is false when lastActor is null (untouched since creation)", () => {
    expect(isHumanVerified({ status: "ACCEPTED", lastActor: null })).toBe(
      false,
    );
  });
});

describe("completionPercent", () => {
  it("returns 0 for an empty finding set", () => {
    expect(completionPercent([])).toBe(0);
  });

  it("returns 0 when every finding is still PENDING", () => {
    expect(
      completionPercent([
        { status: "PENDING", lastActor: null },
        { status: "PENDING", lastActor: null },
        { status: "PENDING", lastActor: null },
      ]),
    ).toBe(0);
  });

  it("returns 100 when every finding has been human-verified", () => {
    expect(
      completionPercent([
        { status: "ACCEPTED", lastActor: "HUMAN" },
        { status: "CORRECTED", lastActor: "HUMAN" },
        { status: "OVERRIDDEN", lastActor: "HUMAN" },
      ]),
    ).toBe(100);
  });

  it("returns 50 when half of findings are human-verified", () => {
    expect(
      completionPercent([
        { status: "ACCEPTED", lastActor: "HUMAN" },
        { status: "PENDING", lastActor: null },
      ]),
    ).toBe(50);
  });

  it("ignores findings the agent moved without human review", () => {
    expect(
      completionPercent([
        { status: "ACCEPTED", lastActor: "AGENT" },
        { status: "PENDING", lastActor: null },
      ]),
    ).toBe(0);
  });

  it("rounds to the nearest whole percent", () => {
    const findings = [
      { status: "ACCEPTED", lastActor: "HUMAN" },
      { status: "PENDING", lastActor: null },
      { status: "PENDING", lastActor: null },
    ];
    expect(completionPercent(findings)).toBe(33);
  });
});
