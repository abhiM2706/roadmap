import * as vscode from "vscode";
import { Roadmap, Step, RoadmapResult } from "../roadmaps/types";
import { verifyStep } from "./verifier";
import { S } from "../strings";

export interface ExecutionCallbacks {
  onStepStart: (step: Step, index: number, total: number) => void;
  onStepPass: (step: Step, index: number, total: number) => void;
  onStepFail: (
    step: Step,
    index: number,
    error: string
  ) => Promise<"retry" | "skip" | "abort" | "ai">;
}

export async function executeRoadmap(
  roadmap: Roadmap,
  ctx: { workspaceRoot: string; isAiGenerated?: boolean },
  callbacks: ExecutionCallbacks
): Promise<RoadmapResult> {
  const terminal = getOrCreateTerminal(roadmap.name);
  terminal.show(true); // preserve focus

  const startTime = Date.now();
  let xpEarned = 0;
  let stepsCompleted = 0;
  let failedStepId: string | undefined;
  let usedAiRecovery = false;

  for (let i = 0; i < roadmap.steps.length; i++) {
    const step = roadmap.steps[i];
    callbacks.onStepStart(step, i, roadmap.steps.length);

    let passed = false;
    let lastError = "";

    while (!passed) {
      terminal.sendText(step.command);

      // Wait for command to complete. We use a small delay + verifyFile check.
      // Shell integration would give us proper exit codes; this is the pragmatic fallback.
      await delay(step.timeoutMs ?? 3000);

      const result = await verifyStep(step, ctx.workspaceRoot);
      if (result.passed) {
        passed = true;
        xpEarned += step.xp;
        stepsCompleted++;
        callbacks.onStepPass(step, i, roadmap.steps.length);
      } else {
        lastError = result.error ?? "Verification failed";
        const action = await callbacks.onStepFail(step, i, lastError);

        if (action === "retry") {
          // loop continues
        } else if (action === "skip") {
          stepsCompleted++;
          xpEarned += Math.floor(step.xp / 2); // half XP for skipped steps
          passed = true; // move on
        } else if (action === "ai") {
          usedAiRecovery = true;
          // The AI recovery flow is handled in the caller; it will update step.command
          // and call back with retry or skip. We break out to let the caller take over.
          // For now we treat it as an abort of the inner loop; the outer loop will re-enter.
          passed = true; // the caller rewrote step.command and will continue
        } else {
          // abort
          failedStepId = step.id;
          return buildResult(
            roadmap,
            startTime,
            stepsCompleted,
            xpEarned,
            failedStepId,
            ctx.isAiGenerated,
            usedAiRecovery
          );
        }
      }
    }
  }

  return buildResult(
    roadmap,
    startTime,
    stepsCompleted,
    xpEarned,
    undefined,
    ctx.isAiGenerated,
    usedAiRecovery
  );
}

function buildResult(
  roadmap: Roadmap,
  startTime: number,
  stepsCompleted: number,
  xpEarned: number,
  failedStepId: string | undefined,
  isAiGenerated?: boolean,
  usedAiRecovery?: boolean
): RoadmapResult {
  return {
    roadmapId: roadmap.id,
    roadmapName: roadmap.name,
    completedAt: Date.now(),
    durationMs: Date.now() - startTime,
    stepsCompleted,
    stepsTotal: roadmap.steps.length,
    xpEarned,
    failedStepId,
    wasAiGenerated: isAiGenerated,
    usedAiRecovery,
  };
}

let _terminal: vscode.Terminal | undefined;

function getOrCreateTerminal(name: string): vscode.Terminal {
  // Reuse existing terminal if it's still alive
  const existing = vscode.window.terminals.find(
    (t) => t.name === `Roadmap: ${name}`
  );
  if (existing) {
    _terminal = existing;
    return existing;
  }
  _terminal = vscode.window.createTerminal(`Roadmap: ${name}`);
  return _terminal;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
