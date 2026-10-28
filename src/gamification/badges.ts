import { RoadmapResult, UserState } from "../roadmaps/types";

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BADGE_DEFS: BadgeDef[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first roadmap",
    icon: "🚀",
  },
  {
    id: "polyglot",
    name: "Polyglot",
    description: "Complete roadmaps across 3 different tech stacks",
    icon: "🌐",
  },
  {
    id: "speedrunner",
    name: "Speedrunner",
    description: "Complete a roadmap in under 2 minutes",
    icon: "⚡",
  },
  {
    id: "streak-week",
    name: "Streak Week",
    description: "Maintain a 7-day streak",
    icon: "🔥",
  },
  {
    id: "ai-pioneer",
    name: "AI Pioneer",
    description: "Complete your first AI-generated roadmap",
    icon: "🤖",
  },
  {
    id: "recovery-artist",
    name: "Recovery Artist",
    description: "Accept a Bedrock AI fix suggestion and resume",
    icon: "🛠️",
  },
];

export function checkAndUnlockBadges(
  state: UserState,
  result: RoadmapResult
): string[] {
  const newBadges: string[] = [];

  function unlock(id: string) {
    if (!state.badges.includes(id)) {
      state.badges.push(id);
      newBadges.push(id);
    }
  }

  const completed = result.stepsCompleted === result.stepsTotal;

  if (completed) {
    // First Steps
    if (state.roadmapsCompleted.length >= 1) {
      unlock("first-steps");
    }

    // Polyglot — 3+ unique top-level stack tags across all completions
    const uniqueStacks = new Set(state.stacksCompleted);
    if (uniqueStacks.size >= 3) {
      unlock("polyglot");
    }

    // Speedrunner — under 2 minutes
    if (result.durationMs < 2 * 60 * 1000) {
      unlock("speedrunner");
    }

    // AI Pioneer
    if (result.wasAiGenerated) {
      unlock("ai-pioneer");
    }
  }

  // Streak Week
  if (state.streakDays >= 7) {
    unlock("streak-week");
  }

  // Recovery Artist — can unlock even on partial completion
  if (result.usedAiRecovery) {
    unlock("recovery-artist");
  }

  return newBadges;
}

export function badgeById(id: string): BadgeDef | undefined {
  return BADGE_DEFS.find((b) => b.id === id);
}
