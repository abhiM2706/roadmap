export const S = {
  // Quick Pick
  PICK_ROADMAP_PLACEHOLDER: "Search roadmaps…",
  PICK_ROADMAP_TITLE: "Roadmap: Choose a setup roadmap to run",
  NO_ROADMAPS: "No roadmaps available.",

  // Execution
  STEP_RUNNING: (n: number, total: number, desc: string) =>
    `[${n}/${total}] ${desc}`,
  STEP_PASSED: (desc: string) => `✓ ${desc}`,
  STEP_FAILED: (desc: string) => `✗ ${desc}`,
  ROADMAP_COMPLETE: (name: string) => `🎉 Roadmap "${name}" complete!`,
  ROADMAP_ABORTED: "Roadmap aborted.",
  STEP_FAIL_TITLE: (desc: string) => `Step failed: ${desc}`,
  STEP_FAIL_BODY: (cmd: string, err: string) =>
    `Command: \`${cmd}\`\n\nError:\n${err || "(no output captured)"}`,

  // Step failure options
  OPTION_RETRY: "$(refresh) Retry",
  OPTION_ASK_AI: "$(sparkle) Ask AI (Bedrock)",
  OPTION_SKIP: "$(arrow-right) Skip step",
  OPTION_ABORT: "$(x) Abort roadmap",

  // Gamification
  LEVEL_UP: (level: number) => `⬆️  Level up! You're now Level ${level}`,
  BADGE_UNLOCKED: (name: string) => `🏅 Badge unlocked: ${name}`,
  XP_EARNED: (xp: number) => `+${xp} XP`,

  // Dashboard
  DASHBOARD_TITLE: "Roadmap Stats",

  // AI Generation
  AI_INPUT_PROMPT:
    "Describe your goal (e.g. 'Build a Discord bot in Python with slash commands and SQLite')",
  AI_INPUT_PLACEHOLDER: "Your dev environment goal…",
  AI_GENERATING: "Generating roadmap with Bedrock…",
  AI_TIMEOUT: "Bedrock request timed out (15s). Check your AWS credentials and region.",
  AI_PARSE_ERROR: "Bedrock returned an invalid roadmap. Try rephrasing your goal.",
  AI_AUTH_ERROR: "AWS auth failed. Run 'Roadmap: Configure Bedrock Credentials'.",
  AI_GENERIC_ERROR: (msg: string) => `Bedrock error: ${msg}`,
  AI_REVIEW_TITLE: (name: string) => `Review AI Roadmap: "${name}"`,
  AI_CONFIRM_RUN: "Run this roadmap",
  AI_CANCEL: "Cancel",

  // Bedrock config
  BEDROCK_KEY_PROMPT: "AWS Access Key ID",
  BEDROCK_SECRET_PROMPT: "AWS Secret Access Key",
  BEDROCK_REGION_PROMPT: "AWS Region (e.g. us-east-1)",
  BEDROCK_SAVED: "Bedrock credentials saved.",
  BEDROCK_MISSING: "Bedrock credentials not configured. Run 'Roadmap: Configure Bedrock Credentials'.",

  // Recovery
  RECOVERY_TITLE: "AI Fix Suggestion",
  RECOVERY_ACCEPT: "$(check) Accept & Run Fix",
  RECOVERY_EDIT: "$(edit) Edit Command",
  RECOVERY_SKIP: "$(arrow-right) Skip Step",
  RECOVERY_FETCHING: "Asking Bedrock for a fix…",
  RECOVERY_FAILED: "Bedrock could not suggest a fix.",
};
