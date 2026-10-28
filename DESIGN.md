# Roadmap Extension — Design Document

## 1. Core Data Models

### `Step`
```ts
interface Step {
  id: string;                  // unique slug, e.g. "install-deps"
  command: string;             // shell command sent to terminal
  description: string;         // human-readable label shown in progress
  xp: number;                  // XP awarded on success (5 = simple, 20 = complex)
  verifyCommand?: string;      // optional: shell command whose exit-0 = success
  verifyFile?: string;         // optional: file/dir path that must exist after step
  timeoutMs?: number;          // override per-step timeout (default: 60_000)
}
```

### `Roadmap`
```ts
interface Roadmap {
  id: string;                  // unique slug, e.g. "nextjs-tailwind"
  name: string;                // display name
  description: string;         // one-liner shown in Quick Pick detail
  stack: string[];             // language/tech tags used for badge tracking
  difficulty: "beginner" | "intermediate" | "advanced";
  steps: Step[];
  estimatedMinutes: number;    // used to evaluate Speedrunner badge
}
```

### `RoadmapResult`
```ts
interface RoadmapResult {
  roadmapId: string;
  completedAt: number;         // Date.now()
  durationMs: number;
  stepsCompleted: number;
  stepsTotal: number;
  xpEarned: number;
  failedStepId?: string;       // set if run ended early
}
```

### `UserState`
```ts
interface UserState {
  xp: number;
  level: number;
  badges: string[];            // badge IDs unlocked
  streakDays: number;
  longestStreakDays: number;
  lastRunDate: string;         // ISO date "YYYY-MM-DD"
  roadmapsCompleted: string[]; // roadmap IDs
  stacksCompleted: string[];   // de-duped stack tags across completed roadmaps
  totalRoadmapsRun: number;
}
```

---

## 2. Step Verification Flow

```
execute step (terminal.sendText)
        │
        ▼
  wait for verifyCommand exit code   ← if verifyCommand defined
        │                                shell: `<verifyCommand>; echo $?`
        │  exit 0 ──────────────────────────────────────────────────────┐
        │  exit ≠ 0                                                      │
        ▼                                                                 │
  check verifyFile exists            ← if verifyFile defined             │
        │                                fs.existsSync / workspace.fs    │
        │  exists ───────────────────────────────────────────────────────┤
        │  missing                                                        │
        ▼                                                                 │
  STEP FAILED                                                    STEP PASSED
        │                                                                 │
        ▼                                                                 ▼
  capture stderr / exit details                          award XP, advance progress
        │
        ▼
  show error panel: [Retry] [Ask AI] [Skip] [Abort]
        │
   "Ask AI" ──► send to Bedrock recovery agent (see §5)
```

**Timing:** Steps without explicit verification are considered "passed" as soon as `terminal.sendText` completes (fire-and-forget with a configurable delay). Future improvements can hook into shell-integration exit codes.

---

## 3. XP / Level / Badge Scoring Rules

### XP per Step
| Complexity | XP |
|------------|-----|
| Simple (`xp: 5`) | Package installs, `mkdir`, `git init` |
| Complex (`xp: 20`) | DB migrations, Docker builds, multi-config steps |

### Level Thresholds (exponential curve)
```
L1:    0 XP
L2:  100 XP   (+100)
L3:  300 XP   (+200)
L4:  600 XP   (+300)
L5: 1000 XP   (+400)
Ln: L(n-1) + n*100
```
Formula: `threshold(n) = 50 * n * (n - 1)` for n ≥ 1

### Badges
| ID | Name | Unlock Condition |
|----|------|-----------------|
| `first-steps` | First Steps | Complete 1 roadmap |
| `polyglot` | Polyglot | Complete roadmaps across 3 different stack tags |
| `speedrunner` | Speedrunner | Complete any roadmap in under 2 minutes |
| `streak-week` | Streak Week | Maintain a 7-day streak |
| `ai-pioneer` | AI Pioneer | Complete first AI-generated roadmap |
| `recovery-artist` | Recovery Artist | Accept a Bedrock AI fix suggestion and resume |

Badge unlock is checked after every `RoadmapResult` is saved. Already-unlocked badges are skipped.

### Streaks
- Increment if `lastRunDate` was yesterday (UTC date comparison).
- Reset to 1 if gap > 1 day.
- Stay same if already ran today.
- `longestStreakDays` updated whenever `streakDays` exceeds it.

---

## 4. Built-in Roadmap Library (5 roadmaps)

1. **nextjs-tailwind** — Next.js 14 + Tailwind CSS (intermediate, ~8 steps)
2. **python-venv** — Python venv + pytest + black (beginner, ~6 steps)
3. **express-typescript** — Express + TypeScript + ts-node-dev (intermediate, ~7 steps)
4. **fastapi-postgres** — FastAPI + SQLAlchemy + Postgres via Docker (advanced, ~9 steps)
5. **react-native-expo** — React Native + Expo SDK (intermediate, ~7 steps)

---

## 5. AI Prompt Template (Bedrock)

### Roadmap Generation Prompt
```
You are a senior developer who creates step-by-step dev environment setup guides.

Generate a JSON roadmap for this goal: "{userGoal}"

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
      "xp": 5 | 20,
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
```

### Error Recovery Prompt
```
A VS Code Roadmap extension step failed. Help the user fix it.

Roadmap: "{roadmapName}"
Failed step command: "{command}"
Step description: "{description}"
Captured stderr:
"""
{stderr}
"""

Suggest a corrected command or sequence of commands to fix this.
Respond with ONLY valid JSON:
{
  "suggestion": "string — brief explanation of what went wrong and why",
  "fixCommand": "string — the corrected shell command to run instead",
  "alternativeCommand": "string | null — fallback if fixCommand might not work"
}
```

---

## 6. Amazon Bedrock Configuration

Instead of direct Anthropic API keys, the extension uses **Amazon Bedrock** via the `@anthropic-ai/sdk` `AnthropicBedrock` client.

### Credentials stored in `SecretStorage`
| Key | Value |
|-----|-------|
| `roadmap.bedrock.accessKeyId` | AWS Access Key ID |
| `roadmap.bedrock.secretAccessKey` | AWS Secret Access Key |
| `roadmap.bedrock.region` | AWS region (default: `us-east-1`) |

### Model ID
`anthropic.claude-sonnet-4-5-20241022-v2:0` (or the latest available Claude model on Bedrock)

### Client instantiation
```ts
import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";

const client = new AnthropicBedrock({
  awsAccessKey: accessKeyId,
  awsSecretKey: secretAccessKey,
  awsRegion: region,
});
```

### Timeout & error handling
- 15-second timeout enforced via `Promise.race` with `AbortController`
- On timeout: show `Roadmap: AI request timed out (15s). Check your AWS credentials and region.`
- On auth error: prompt user to re-enter credentials via `Roadmap: Configure Bedrock Credentials`
- API responses validated with a JSON schema check before use; malformed responses show a parse error

---

## 7. WebView Dashboard

The dashboard HTML is injected into a `vscode.WebviewPanel` using a Content Security Policy that allows:
- `default-src 'none'`
- `style-src ${webview.cspSource} 'unsafe-inline'`
- `script-src ${webview.cspSource}`

CSS custom properties mirror VS Code theme tokens (`--vscode-editor-background`, `--vscode-foreground`, etc.) so the panel auto-adapts to dark/light themes. No external CSS frameworks — plain CSS only.

---

## 8. Activation & Command Palette Entries

Extension activates lazily on `onCommand`. Commands:
| Command | Title |
|---------|-------|
| `roadmap.run` | Roadmap: Run a Roadmap |
| `roadmap.generate` | Roadmap: Generate from Goal |
| `roadmap.dashboard` | Roadmap: Show Dashboard |
| `roadmap.configureBedrock` | Roadmap: Configure Bedrock Credentials |

---

## 9. Module Responsibility Summary

| Module | Responsibility |
|--------|---------------|
| `extension.ts` | Register commands, provide `ExtensionContext` to all modules |
| `roadmaps/library.ts` | Static roadmap definitions |
| `roadmaps/types.ts` | All shared TypeScript interfaces |
| `runner/executor.ts` | Create/reuse terminal, send commands, poll verification |
| `runner/verifier.ts` | Exit-code and file-existence checks |
| `runner/recovery.ts` | Bedrock call for error recovery, result display |
| `ai/generator.ts` | Bedrock call for roadmap generation, JSON parse/validate |
| `gamification/xp.ts` | `levelForXp`, `xpForNextLevel`, `awardXp` |
| `gamification/badges.ts` | Badge definitions, `checkAndUnlock` |
| `gamification/streaks.ts` | `updateStreak` |
| `gamification/storage.ts` | `getState`, `setState` wrappers over `globalState` |
| `ui/quickpick.ts` | Roadmap picker, step progress indicator |
| `ui/dashboard.ts` | WebView HTML generation, message passing |
| `ui/notifications.ts` | Level-up toasts, badge celebration messages |
| `strings.ts` | All user-facing strings |
