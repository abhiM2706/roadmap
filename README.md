# Roadmap — Gamified Dev Environment Setup

A VS Code / Cursor extension that automates multi-step dev environment setup with a gamified UX. Pick a curated roadmap (or generate one with AI) and watch it run step-by-step in your integrated terminal — earning XP, badges, and streaks along the way.

## Features

- **5 built-in roadmaps**: Next.js + Tailwind, Python venv + pytest, Express + TypeScript, FastAPI + Postgres, React Native + Expo
- **AI-generated roadmaps** powered by Claude via Amazon Bedrock
- **Gamification**: XP, levels, 6 unique badges, daily streaks
- **Stats dashboard**: live WebView panel showing level, progress bar, badges, and streaks
- **Agentic error recovery**: if a step fails, ask Claude to diagnose and fix it

## Installation

### From `.vsix`
```bash
code --install-extension roadmap-0.1.0.vsix
```

### From source
```bash
cd roadmap
npm install
npm run build
npm run package      # produces roadmap-0.1.0.vsix
code --install-extension roadmap-0.1.0.vsix
```

## Setup: Amazon Bedrock Credentials

This extension uses **Amazon Bedrock** (not the direct Anthropic API).

1. Open the Command Palette (`⌘⇧P` / `Ctrl⇧P`)
2. Run **Roadmap: Configure Bedrock Credentials**
3. Enter your:
   - AWS Access Key ID
   - AWS Secret Access Key
   - AWS Region (e.g. `us-east-1`)

Credentials are stored in VS Code's encrypted `SecretStorage` — never in settings or on disk.

> **Bedrock model access**: ensure `anthropic.claude-sonnet-4-5-20241022-v2:0` is enabled in your AWS Bedrock console for your chosen region.

## Usage

| Command | Description |
|---------|-------------|
| `Roadmap: Run a Roadmap` | Pick from the built-in library and run |
| `Roadmap: Generate from Goal` | Describe a goal; Claude generates a roadmap |
| `Roadmap: Show Dashboard` | Open the XP / badge / streak panel |
| `Roadmap: Configure Bedrock Credentials` | Set AWS credentials |

## Gamification

### XP & Levels
| Level | XP Required |
|-------|-------------|
| L1 | 0 |
| L2 | 100 |
| L3 | 300 |
| L4 | 600 |
| L5 | 1000 |
| Ln | 50 × n × (n-1) |

### Badges
| Badge | Condition |
|-------|-----------|
| 🚀 First Steps | Complete 1 roadmap |
| 🌐 Polyglot | Complete roadmaps in 3 different stacks |
| ⚡ Speedrunner | Complete a roadmap in under 2 minutes |
| 🔥 Streak Week | 7-day streak |
| 🤖 AI Pioneer | Complete an AI-generated roadmap |
| 🛠️ Recovery Artist | Accept a Bedrock AI fix and resume |

## Development

```bash
npm install
npm run watch     # esbuild watch mode
# Press F5 in VS Code to launch Extension Development Host
npm test          # vitest unit tests
```

## Contributing

1. Fork this repo
2. Create a feature branch
3. Add tests for new logic
4. Open a PR — describe what milestone it targets

## Screenshots

_Coming soon_
