import * as vscode from "vscode";
import { Step, RecoverySuggestion } from "../roadmaps/types";
import { S } from "../strings";
import { getBedrockClient } from "../ai/client";

const MODEL_ID = "anthropic.claude-sonnet-4-5-20241022-v2:0";

export async function suggestRecovery(
  roadmapName: string,
  step: Step,
  stderr: string,
  ctx: vscode.ExtensionContext
): Promise<RecoverySuggestion | null> {
  const client = await getBedrockClient(ctx);
  if (!client) return null;

  const prompt = `A VS Code Roadmap extension step failed. Help the user fix it.

Roadmap: "${roadmapName}"
Failed step command: "${step.command}"
Step description: "${step.description}"
Captured stderr:
"""
${stderr}
"""

Suggest a corrected command or sequence of commands to fix this.
Respond with ONLY valid JSON:
{
  "suggestion": "string — brief explanation of what went wrong and why",
  "fixCommand": "string — the corrected shell command to run instead",
  "alternativeCommand": "string | null — fallback if fixCommand might not work"
}`;

  try {
    const timeoutMs = 15000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let text = "";
    try {
      const response = await client.messages.create({
        model: MODEL_ID,
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      });
      text =
        response.content[0].type === "text" ? response.content[0].text : "";
    } finally {
      clearTimeout(timer);
    }

    const parsed = JSON.parse(extractJson(text)) as RecoverySuggestion;
    if (!parsed.suggestion || !parsed.fixCommand) return null;
    return parsed;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      vscode.window.showErrorMessage(S.AI_TIMEOUT);
    }
    return null;
  }
}

export async function showRecoveryPanel(
  suggestion: RecoverySuggestion,
  step: Step
): Promise<{ action: "accept" | "edit" | "skip"; command: string }> {
  const detail = `${suggestion.suggestion}\n\nFix: \`${suggestion.fixCommand}\``;

  const pick = await vscode.window.showWarningMessage(
    S.RECOVERY_TITLE,
    { modal: true, detail },
    S.RECOVERY_ACCEPT,
    S.RECOVERY_EDIT,
    S.RECOVERY_SKIP
  );

  if (pick === S.RECOVERY_ACCEPT) {
    return { action: "accept", command: suggestion.fixCommand };
  }
  if (pick === S.RECOVERY_EDIT) {
    const edited = await vscode.window.showInputBox({
      prompt: "Edit the fix command",
      value: suggestion.fixCommand,
    });
    return { action: "edit", command: edited ?? suggestion.fixCommand };
  }
  return { action: "skip", command: step.command };
}

function extractJson(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}
