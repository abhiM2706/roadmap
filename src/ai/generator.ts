import * as vscode from "vscode";
import { Roadmap, GeneratedRoadmap } from "../roadmaps/types";
import { S } from "../strings";
import { getBedrockClient } from "./client";

const MODEL_ID = "anthropic.claude-sonnet-4-5-20241022-v2:0";

export async function generateRoadmap(
  goal: string,
  ctx: vscode.ExtensionContext
): Promise<Roadmap | null> {
  const client = await getBedrockClient(ctx);
  if (!client) return null;

  const prompt = `You are a senior developer who creates step-by-step dev environment setup guides.

Generate a JSON roadmap for this goal: "${goal}"

Respond with ONLY valid JSON matching this exact schema:
{
  "name": "string — short display name",
  "description": "string — one-sentence summary",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "stack": ["string", ...],
  "estimatedMinutes": number,
  "steps": [
    {
      "id": "string — kebab-case slug",
      "command": "string — exact shell command",
      "description": "string — what this step does",
      "xp": 5,
      "verifyCommand": "string — optional shell command to verify success",
      "verifyFile": "string — optional file/dir path to check"
    }
  ]
}

Rules:
- steps must be safe, deterministic shell commands
- prefer well-known package manager commands (npm, pip, brew)
- include verifyCommand or verifyFile for every non-trivial step
- xp is 5 for simple installs, 20 for complex configuration steps
- no sudo unless absolutely necessary; prefer local/project installs
- omit verifyCommand and verifyFile fields entirely if not needed`;

  return await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: S.AI_GENERATING,
      cancellable: false,
    },
    async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await client.messages.create({
          model: MODEL_ID,
          max_tokens: 2048,
          messages: [{ role: "user", content: prompt }],
        });

        clearTimeout(timer);

        const text =
          response.content[0].type === "text" ? response.content[0].text : "";
        const json = extractJson(text);
        const parsed = JSON.parse(json) as GeneratedRoadmap;

        if (!parsed.name || !Array.isArray(parsed.steps)) {
          throw new Error("Invalid schema");
        }

        return toRoadmap(parsed, goal);
      } catch (err: unknown) {
        clearTimeout(timer);
        if (err instanceof Error && err.name === "AbortError") {
          vscode.window.showErrorMessage(S.AI_TIMEOUT);
        } else if (isAuthError(err)) {
          vscode.window.showErrorMessage(S.AI_AUTH_ERROR);
        } else if (err instanceof SyntaxError) {
          vscode.window.showErrorMessage(S.AI_PARSE_ERROR);
        } else {
          const msg = err instanceof Error ? err.message : String(err);
          vscode.window.showErrorMessage(S.AI_GENERIC_ERROR(msg));
        }
        return null;
      }
    }
  );
}

function toRoadmap(gen: GeneratedRoadmap, goal: string): Roadmap {
  return {
    id: `ai-${slugify(goal)}-${Date.now()}`,
    name: gen.name,
    description: gen.description,
    stack: gen.stack ?? [],
    difficulty: gen.difficulty ?? "intermediate",
    estimatedMinutes: gen.estimatedMinutes ?? 10,
    steps: gen.steps.map((s) => ({
      id: s.id,
      command: s.command,
      description: s.description,
      xp: s.xp === 20 ? 20 : 5,
      ...(s.verifyCommand ? { verifyCommand: s.verifyCommand } : {}),
      ...(s.verifyFile ? { verifyFile: s.verifyFile } : {}),
    })),
    isAiGenerated: true,
  };
}

function extractJson(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
}

function isAuthError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.message.includes("auth") ||
    err.message.includes("credential") ||
    err.message.includes("403") ||
    err.message.includes("Access")
  );
}
