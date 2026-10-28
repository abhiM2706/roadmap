import { describe, it, expect } from "vitest";
import { checkAndUnlockBadges } from "./badges";
import { RoadmapResult, UserState } from "../roadmaps/types";

function makeState(overrides: Partial<UserState> = {}): UserState {
  return {
    xp: 0,
    level: 1,
    badges: [],
    streakDays: 0,
    longestStreakDays: 0,
    lastRunDate: "",
    roadmapsCompleted: ["some-roadmap"],
    stacksCompleted: [],
    totalRoadmapsRun: 1,
    ...overrides,
  };
}

function makeResult(overrides: Partial<RoadmapResult> = {}): RoadmapResult {
  return {
    roadmapId: "test",
    roadmapName: "Test",
    completedAt: Date.now(),
    durationMs: 60000,
    stepsCompleted: 5,
    stepsTotal: 5,
    xpEarned: 50,
    ...overrides,
  };
}

describe("checkAndUnlockBadges", () => {
  it("unlocks first-steps on first completion", () => {
    const state = makeState({ roadmapsCompleted: ["r1"] });
    const result = makeResult();
    const newBadges = checkAndUnlockBadges(state, result);
    expect(newBadges).toContain("first-steps");
  });

  it("unlocks speedrunner under 2 minutes", () => {
    const state = makeState({ roadmapsCompleted: ["r1"] });
    const result = makeResult({ durationMs: 90000 }); // 1.5 min
    const newBadges = checkAndUnlockBadges(state, result);
    expect(newBadges).toContain("speedrunner");
  });

  it("does NOT unlock speedrunner over 2 minutes", () => {
    const state = makeState({ roadmapsCompleted: ["r1"] });
    const result = makeResult({ durationMs: 150000 }); // 2.5 min
    const newBadges = checkAndUnlockBadges(state, result);
    expect(newBadges).not.toContain("speedrunner");
  });

  it("unlocks polyglot with 3 stacks", () => {
    const state = makeState({
      roadmapsCompleted: ["r1"],
      stacksCompleted: ["python", "javascript", "rust"],
    });
    const newBadges = checkAndUnlockBadges(state, makeResult());
    expect(newBadges).toContain("polyglot");
  });

  it("unlocks ai-pioneer for AI-generated roadmap", () => {
    const state = makeState({ roadmapsCompleted: ["r1"] });
    const result = makeResult({ wasAiGenerated: true });
    const newBadges = checkAndUnlockBadges(state, result);
    expect(newBadges).toContain("ai-pioneer");
  });

  it("unlocks streak-week at 7 days", () => {
    const state = makeState({ streakDays: 7 });
    const result = makeResult();
    const newBadges = checkAndUnlockBadges(state, result);
    expect(newBadges).toContain("streak-week");
  });

  it("does not duplicate badges", () => {
    const state = makeState({
      badges: ["first-steps"],
      roadmapsCompleted: ["r1"],
    });
    const result = makeResult();
    const newBadges = checkAndUnlockBadges(state, result);
    expect(newBadges).not.toContain("first-steps");
    expect(state.badges.filter((b) => b === "first-steps")).toHaveLength(1);
  });

  it("unlocks recovery-artist when usedAiRecovery is true", () => {
    const state = makeState();
    const result = makeResult({ usedAiRecovery: true, stepsCompleted: 3, stepsTotal: 5 });
    const newBadges = checkAndUnlockBadges(state, result);
    expect(newBadges).toContain("recovery-artist");
  });
});
