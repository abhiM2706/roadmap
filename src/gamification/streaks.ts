import { UserState } from "../roadmaps/types";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function daysBetween(a: string, b: string): number {
  if (!a || !b) return Infinity;
  const msPerDay = 86400000;
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / msPerDay
  );
}

export function updateStreak(state: UserState): void {
  const today = todayUtc();
  if (state.lastRunDate === today) {
    // Already ran today — streak unchanged
    return;
  }

  const gap = daysBetween(state.lastRunDate, today);

  if (gap === 1) {
    state.streakDays += 1;
  } else {
    // Missed at least one day — reset
    state.streakDays = 1;
  }

  if (state.streakDays > state.longestStreakDays) {
    state.longestStreakDays = state.streakDays;
  }

  state.lastRunDate = today;
}
