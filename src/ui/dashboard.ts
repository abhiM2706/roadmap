import * as vscode from "vscode";
import { UserState } from "../roadmaps/types";
import { BADGE_DEFS } from "../gamification/badges";
import { thresholdForLevel, xpProgressInCurrentLevel } from "../gamification/xp";
import { S } from "../strings";

let panel: vscode.WebviewPanel | undefined;

export function showDashboard(
  ctx: vscode.ExtensionContext,
  state: UserState
): void {
  if (panel) {
    panel.reveal(vscode.ViewColumn.One);
    panel.webview.html = buildHtml(panel.webview, state);
    return;
  }

  panel = vscode.window.createWebviewPanel(
    "roadmapDashboard",
    S.DASHBOARD_TITLE,
    vscode.ViewColumn.One,
    {
      enableScripts: false,
      retainContextWhenHidden: true,
    }
  );

  panel.webview.html = buildHtml(panel.webview, state);

  panel.onDidDispose(() => {
    panel = undefined;
  });
}

export function refreshDashboard(state: UserState): void {
  if (panel) {
    panel.webview.html = buildHtml(panel.webview, state);
  }
}

function buildHtml(webview: vscode.Webview, state: UserState): string {
  const csp = `default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline';`;
  const progress = xpProgressInCurrentLevel(state.xp, state.level);
  const nextLevelXp = thresholdForLevel(state.level + 1);

  const badgeCards = BADGE_DEFS.map((b) => {
    const unlocked = state.badges.includes(b.id);
    return `
      <div class="badge ${unlocked ? "unlocked" : "locked"}">
        <span class="badge-icon">${b.icon}</span>
        <div class="badge-info">
          <div class="badge-name">${b.name}</div>
          <div class="badge-desc">${b.description}</div>
        </div>
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="${csp}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${S.DASHBOARD_TITLE}</title>
  <style>
    :root {
      --gap: 16px;
      --radius: 6px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 24px;
      max-width: 720px;
    }
    h1 { font-size: 1.5em; margin-bottom: 24px; }
    h2 { font-size: 1em; text-transform: uppercase; letter-spacing: 0.08em;
         color: var(--vscode-descriptionForeground); margin-bottom: 12px; }
    .section { margin-bottom: 32px; }
    .card {
      background: var(--vscode-editor-inactiveSelectionBackground);
      border: 1px solid var(--vscode-panel-border);
      border-radius: var(--radius);
      padding: 16px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--gap);
    }
    .stat {
      background: var(--vscode-editor-inactiveSelectionBackground);
      border: 1px solid var(--vscode-panel-border);
      border-radius: var(--radius);
      padding: 16px;
      text-align: center;
    }
    .stat-value { font-size: 2em; font-weight: bold; line-height: 1; }
    .stat-label { margin-top: 4px; color: var(--vscode-descriptionForeground); font-size: 0.85em; }
    .level-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px; }
    .level-num { font-size: 2.5em; font-weight: bold; }
    .level-label { color: var(--vscode-descriptionForeground); }
    .progress-bar-bg {
      height: 10px;
      background: var(--vscode-progressBar-background, #333);
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 6px;
    }
    .progress-bar-fill {
      height: 100%;
      background: var(--vscode-button-background);
      border-radius: 5px;
      transition: width 0.3s ease;
    }
    .progress-label { font-size: 0.8em; color: var(--vscode-descriptionForeground); }
    .badge {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: var(--radius);
      margin-bottom: 8px;
    }
    .badge.locked { opacity: 0.35; filter: grayscale(1); }
    .badge-icon { font-size: 1.8em; flex-shrink: 0; }
    .badge-name { font-weight: bold; }
    .badge-desc { font-size: 0.85em; color: var(--vscode-descriptionForeground); margin-top: 2px; }
  </style>
</head>
<body>
  <h1>🗺️ Roadmap Dashboard</h1>

  <div class="section">
    <h2>Level &amp; XP</h2>
    <div class="card">
      <div class="level-row">
        <span class="level-num">L${state.level}</span>
        <span class="level-label">${state.xp} total XP</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width:${progress.percent}%"></div>
      </div>
      <div class="progress-label">
        ${progress.current} / ${progress.needed} XP to Level ${state.level + 1}
        (${nextLevelXp} XP threshold)
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Stats</h2>
    <div class="stats-grid">
      <div class="stat">
        <div class="stat-value">${state.totalRoadmapsRun}</div>
        <div class="stat-label">Roadmaps Run</div>
      </div>
      <div class="stat">
        <div class="stat-value">${state.roadmapsCompleted.length}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat">
        <div class="stat-value">${state.streakDays}</div>
        <div class="stat-label">Current Streak</div>
      </div>
      <div class="stat">
        <div class="stat-value">${state.longestStreakDays}</div>
        <div class="stat-label">Longest Streak</div>
      </div>
      <div class="stat">
        <div class="stat-value">${state.badges.length} / ${BADGE_DEFS.length}</div>
        <div class="stat-label">Badges</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Badges</h2>
    ${badgeCards}
  </div>
</body>
</html>`;
}
