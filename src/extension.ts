import * as vscode from "vscode";
import { BUILT_IN_ROADMAPS } from "./roadmaps/library";
import { Roadmap, RoadmapResult } from "./roadmaps/types";
import { executeRoadmap } from "./runner/executor";
import { suggestRecovery, showRecoveryPanel } from "./runner/recovery";
import { generateRoadmap } from "./ai/generator";
import { configureBedrock } from "./ai/client";
import { getState, setState } from "./gamification/storage";
import { levelForXp } from "./gamification/xp";
import { checkAndUnlockBadges } from "./gamification/badges";
import { updateStreak } from "./gamification/streaks";
import { pickRoadmap, showStepProgress, confirmAiRoadmap } from "./ui/quickpick";
import { showDashboard, refreshDashboard } from "./ui/dashboard";
import {
  notifyLevelUp,
  notifyBadgeUnlocked,
  notifyXpEarned,
  notifyRoadmapComplete,
} from "./ui/notifications";
import { S } from "./strings";

export function activate(ctx: vscode.ExtensionContext): void {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("roadmap.run", () => runRoadmap(ctx)),
    vscode.commands.registerCommand("roadmap.generate", () =>
      generateAndRun(ctx)
    ),
    vscode.commands.registerCommand("roadmap.dashboard", () => {
      const state = getState(ctx);
      showDashboard(ctx, state);
    }),
    vscode.commands.registerCommand("roadmap.configureBedrock", () =>
      configureBedrock(ctx)
    )
  );
}

export function deactivate(): void {}

// ─── Run a built-in roadmap ─────────────────────────────────────────────────

async function runRoadmap(ctx: vscode.ExtensionContext): Promise<void> {
  const roadmap = await pickRoadmap(BUILT_IN_ROADMAPS);
  if (!roadmap) return;
  await runSelectedRoadmap(roadmap, ctx);
}

// ─── Generate + run an AI roadmap ───────────────────────────────────────────

async function generateAndRun(ctx: vscode.ExtensionContext): Promise<void> {
  const goal = await vscode.window.showInputBox({
    prompt: S.AI_INPUT_PROMPT,
    placeHolder: S.AI_INPUT_PLACEHOLDER,
    ignoreFocusOut: true,
  });
  if (!goal?.trim()) return;

  const roadmap = await generateRoadmap(goal.trim(), ctx);
  if (!roadmap) return;

  const confirmed = await confirmAiRoadmap(roadmap);
  if (!confirmed) return;

  await runSelectedRoadmap(roadmap, ctx, true);
}

// ─── Core execution + gamification ──────────────────────────────────────────

async function runSelectedRoadmap(
  roadmap: Roadmap,
  ctx: vscode.ExtensionContext,
  isAiGenerated = false
): Promise<void> {
  const workspaceRoot =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();

  let progressDisposable: vscode.Disposable | undefined;

  const result = await executeRoadmap(
    roadmap,
    { workspaceRoot, isAiGenerated },
    {
      onStepStart(step, index, total) {
        progressDisposable?.dispose();
        progressDisposable = showStepProgress(step, index, total);
      },
      onStepPass(_step, _index, _total) {
        // step indicator stays until next step starts
      },
      async onStepFail(step, _index, error) {
        progressDisposable?.dispose();

        const choice = await vscode.window.showErrorMessage(
          S.STEP_FAIL_TITLE(step.description),
          { modal: false, detail: error },
          S.OPTION_RETRY,
          S.OPTION_ASK_AI,
          S.OPTION_SKIP,
          S.OPTION_ABORT
        );

        if (choice === S.OPTION_RETRY) return "retry";
        if (choice === S.OPTION_ABORT) return "abort";
        if (choice === S.OPTION_SKIP) return "skip";

        if (choice === S.OPTION_ASK_AI) {
          const suggestion = await suggestRecovery(
            roadmap.name,
            step,
            error,
            ctx
          );
          if (!suggestion) return "skip";

          const { action, command } = await showRecoveryPanel(suggestion, step);
          if (action === "skip") return "skip";

          // Patch the command in place so executor reruns with the fix
          step.command = command;
          return "retry";
        }

        return "abort";
      },
    }
  );

  progressDisposable?.dispose();

  await applyGameResult(result, roadmap, ctx);
}

async function applyGameResult(
  result: RoadmapResult,
  roadmap: Roadmap,
  ctx: vscode.ExtensionContext
): Promise<void> {
  const state = getState(ctx);
  const prevLevel = state.level;

  // XP
  state.xp += result.xpEarned;
  state.level = levelForXp(state.xp);
  state.totalRoadmapsRun++;

  // Streak
  updateStreak(state);

  // Track completions
  if (result.stepsCompleted === result.stepsTotal) {
    if (!state.roadmapsCompleted.includes(roadmap.id)) {
      state.roadmapsCompleted.push(roadmap.id);
    }
    // De-dup stacks
    for (const tag of roadmap.stack) {
      if (!state.stacksCompleted.includes(tag)) {
        state.stacksCompleted.push(tag);
      }
    }
    notifyRoadmapComplete(roadmap.name);
  }

  // Badges
  const newBadges = checkAndUnlockBadges(state, result);
  await setState(ctx, state);

  // Notifications
  if (result.xpEarned > 0) notifyXpEarned(result.xpEarned);
  if (state.level > prevLevel) notifyLevelUp(state.level);
  for (const badgeId of newBadges) notifyBadgeUnlocked(badgeId);

  // Refresh dashboard if open
  refreshDashboard(state);
}
