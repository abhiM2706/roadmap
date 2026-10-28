import * as vscode from "vscode";
import { Roadmap } from "../roadmaps/types";
import { S } from "../strings";

interface RoadmapQuickPickItem extends vscode.QuickPickItem {
  roadmap: Roadmap;
}

export async function pickRoadmap(
  roadmaps: Roadmap[]
): Promise<Roadmap | undefined> {
  const items: RoadmapQuickPickItem[] = roadmaps.map((r) => ({
    label: `$(rocket) ${r.name}`,
    description: `${r.difficulty} · ~${r.estimatedMinutes}m · ${r.steps.length} steps`,
    detail: r.description,
    roadmap: r,
  }));

  const picked = await vscode.window.showQuickPick(items, {
    title: S.PICK_ROADMAP_TITLE,
    placeHolder: S.PICK_ROADMAP_PLACEHOLDER,
    matchOnDescription: true,
    matchOnDetail: true,
  });

  return picked?.roadmap;
}

export function showStepProgress(
  step: { description: string },
  index: number,
  total: number
): vscode.Disposable {
  return vscode.window.setStatusBarMessage(
    `$(sync~spin) Roadmap [${index + 1}/${total}]: ${step.description}`,
  );
}

export async function confirmAiRoadmap(roadmap: Roadmap): Promise<boolean> {
  const stepList = roadmap.steps
    .map((s, i) => `${i + 1}. ${s.description} (+${s.xp} XP)`)
    .join("\n");

  const detail = `Stack: ${roadmap.stack.join(", ")}\nDifficulty: ${roadmap.difficulty}\nEstimated: ~${roadmap.estimatedMinutes}m\n\nSteps:\n${stepList}`;

  const choice = await vscode.window.showInformationMessage(
    S.AI_REVIEW_TITLE(roadmap.name),
    { modal: true, detail },
    S.AI_CONFIRM_RUN,
    S.AI_CANCEL
  );

  return choice === S.AI_CONFIRM_RUN;
}
