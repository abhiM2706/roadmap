export interface Step {
  id: string;
  command: string;
  description: string;
  xp: number;
  verifyCommand?: string;
  verifyFile?: string;
  timeoutMs?: number;
}

export interface Roadmap {
  id: string;
  name: string;
  description: string;
  stack: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  steps: Step[];
  isAiGenerated?: boolean;
}

export interface RoadmapResult {
  roadmapId: string;
  roadmapName: string;
  completedAt: number;
  durationMs: number;
  stepsCompleted: number;
  stepsTotal: number;
  xpEarned: number;
  failedStepId?: string;
  wasAiGenerated?: boolean;
  usedAiRecovery?: boolean;
}

export interface UserState {
  xp: number;
  level: number;
  badges: string[];
  streakDays: number;
  longestStreakDays: number;
  lastRunDate: string;
  roadmapsCompleted: string[];
  stacksCompleted: string[];
  totalRoadmapsRun: number;
}

export interface BedrockCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export interface RecoverySuggestion {
  suggestion: string;
  fixCommand: string;
  alternativeCommand: string | null;
}

export interface GeneratedRoadmap {
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  stack: string[];
  estimatedMinutes: number;
  steps: Array<{
    id: string;
    command: string;
    description: string;
    xp: 5 | 20;
    verifyCommand?: string;
    verifyFile?: string;
  }>;
}
