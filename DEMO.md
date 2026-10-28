# Roadmap — Demo Guide

Step-by-step eval of each milestone. Run these after installing the `.vsix`.

## Setup

```bash
cd roadmap
npm install && npm run build && npm run package
code --install-extension roadmap-0.1.0.vsix
```

Open VS Code with an empty folder as your workspace (`File → Open Folder`).

---

## Milestone 1 — Functional v1

1. Open Command Palette (`⌘⇧P`) → **Roadmap: Run a Roadmap**
2. You should see a Quick Pick list of 5 roadmaps with descriptions and difficulty
3. Pick **"Python venv + pytest + black"** (fastest to run, no Docker needed)
4. Watch your terminal open as `Roadmap: Python venv + pytest + black`
5. Each step fires automatically; the status bar shows `[1/6] Creating Python virtual environment`
6. On completion you should see a toast: `🎉 Roadmap "Python venv + pytest + black" complete!`

**To test failure handling**: pick **Express + TypeScript** and run it in a directory where `my-api/` already exists — the `mkdir` step will fail, triggering the Retry / Ask AI / Skip / Abort panel.

---

## Milestone 2 — Gamification

After completing any roadmap:
- Status bar briefly shows `+XP` count
- If you leveled up: `⬆️ Level up! You're now Level 2`
- If a badge unlocked: `🏅 Badge unlocked: 🚀 First Steps — Complete your first roadmap`

Run two more roadmaps from different stacks (e.g., Next.js and FastAPI) to trigger **Polyglot**.

---

## Milestone 3 — Stats Dashboard

1. `⌘⇧P` → **Roadmap: Show Dashboard**
2. You should see a WebView panel with:
   - Your current level and a progress bar to the next level
   - Total XP, roadmaps completed, current/longest streak
   - All 6 badges (locked ones appear greyed out)
3. Run another roadmap — the dashboard auto-refreshes without you reopening it

---

## Milestone 4 — AI-Generated Roadmaps

1. `⌘⇧P` → **Roadmap: Configure Bedrock Credentials** (first time only)
2. Enter your AWS Access Key ID, Secret Access Key, and region
3. `⌘⇧P` → **Roadmap: Generate from Goal**
4. Type: `Build a Discord bot in Python with slash commands and SQLite`
5. A progress notification appears: `Generating roadmap with Bedrock…`
6. A review modal shows the generated steps — inspect them, then click **Run this roadmap**
7. After completion: **AI Pioneer** badge unlocks

---

## Milestone 5 — Agentic Error Recovery

1. Run the **Express + TypeScript** roadmap in a directory that already has a `my-api/` folder
2. The `mkdir` step will fail
3. Click **Ask AI (Bedrock)** in the error panel
4. Bedrock returns a fix suggestion (e.g., use a different directory name)
5. Click **Accept & Run Fix** — the roadmap resumes from the patched command
6. On resumption: **Recovery Artist** badge unlocks

---

## Unit Tests

```bash
npm test
```

Expected output: all tests pass across `xp`, `streaks`, `badges`, and `library` modules.
