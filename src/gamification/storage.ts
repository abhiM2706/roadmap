import * as vscode from "vscode";
import { UserState } from "../roadmaps/types";

const STATE_KEY = "roadmap.userState";

export const DEFAULT_STATE: UserState = {
  xp: 0,
  level: 1,
  badges: [],
  streakDays: 0,
  longestStreakDays: 0,
  lastRunDate: "",
  roadmapsCompleted: [],
  stacksCompleted: [],
  totalRoadmapsRun: 0,
};

export function getState(ctx: vscode.ExtensionContext): UserState {
  return ctx.globalState.get<UserState>(STATE_KEY) ?? { ...DEFAULT_STATE };
}

export async function setState(
  ctx: vscode.ExtensionContext,
  state: UserState
): Promise<void> {
  await ctx.globalState.update(STATE_KEY, state);
}

export async function resetState(ctx: vscode.ExtensionContext): Promise<void> {
  await ctx.globalState.update(STATE_KEY, { ...DEFAULT_STATE });
}
