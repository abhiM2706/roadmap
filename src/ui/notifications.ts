import * as vscode from "vscode";
import { S } from "../strings";
import { badgeById } from "../gamification/badges";

export function notifyLevelUp(newLevel: number): void {
  vscode.window.showInformationMessage(S.LEVEL_UP(newLevel));
}

export function notifyBadgeUnlocked(badgeId: string): void {
  const badge = badgeById(badgeId);
  if (badge) {
    vscode.window.showInformationMessage(
      S.BADGE_UNLOCKED(`${badge.icon} ${badge.name} — ${badge.description}`)
    );
  }
}

export function notifyXpEarned(xp: number): void {
  vscode.window.setStatusBarMessage(S.XP_EARNED(xp), 4000);
}

export function notifyRoadmapComplete(name: string): void {
  vscode.window.showInformationMessage(S.ROADMAP_COMPLETE(name));
}
