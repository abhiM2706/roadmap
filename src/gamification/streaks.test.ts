import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { updateStreak } from "./streaks";
import { UserState } from "../roadmaps/types";

function makeState(overrides: Partial<UserState> = {}): UserState {
  return {
    xp: 0,
    level: 1,
    badges: [],
    streakDays: 0,
    longestStreakDays: 0,
    lastRunDate: "",
    roadmapsCompleted: [],
    stacksCompleted: [],
    totalRoadmapsRun: 0,
    ...overrides,
  };
}

describe("updateStreak", () => {
  afterEach(() => vi.useRealTimers());

  it("initializes streak to 1 on first run", () => {
    const state = makeState();
    updateStreak(state);
    expect(state.streakDays).toBe(1);
  });

  it("does not increment if already ran today", () => {
    const today = new Date().toISOString().slice(0, 10);
    const state = makeState({ lastRunDate: today, streakDays: 3 });
    updateStreak(state);
    expect(state.streakDays).toBe(3);
  });

  it("increments streak on consecutive day", () => {
    vi.useFakeTimers();
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const state = makeState({ lastRunDate: yesterday, streakDays: 2 });
    updateStreak(state);
    expect(state.streakDays).toBe(3);
  });

  it("resets streak after missed day", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000)
      .toISOString()
      .slice(0, 10);
    const state = makeState({ lastRunDate: twoDaysAgo, streakDays: 5 });
    updateStreak(state);
    expect(state.streakDays).toBe(1);
  });

  it("updates longestStreakDays", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const state = makeState({
      lastRunDate: yesterday,
      streakDays: 9,
      longestStreakDays: 9,
    });
    updateStreak(state);
    expect(state.longestStreakDays).toBe(10);
  });
});
