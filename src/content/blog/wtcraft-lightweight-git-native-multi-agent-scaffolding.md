---
title: 'TokenChef (Part 3): wtcraft — A Lightweight, Git-Native Scaffolding for Bounded Multi-Agent Coding'
description: 'How do you actually enforce boundaries on autonomous agents? Explore Harness Engineering, the competitive landscape of task contracts, and how the wtcraft CLI implements bounded sandboxes locally.'
pubDate: 'May 29 2026'
heroImage: '../../assets/wtcraft-scaffolding-hero.png'
tags: ['AI Tools', 'Harness Engineering', 'Git', 'Worktrees', 'wtcraft', 'Codex', 'Claude Code']
---

<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
  <a href="https://www.npmjs.com/package/wtcraft"><img src="https://img.shields.io/npm/v/wtcraft.svg?style=flat-square&color=cb3837" alt="npm package" /></a>
  <a href="https://pypi.org/project/wtcraft/"><img src="https://img.shields.io/pypi/v/wtcraft.svg?style=flat-square&color=3775a9" alt="PyPI version" /></a>
  <a href="https://github.com/zywkloo/wtcraft"><img src="https://img.shields.io/badge/GitHub-wtcraft-24292e?style=flat-square&logo=github" alt="GitHub Repository" /></a>
</div>

<blockquote style="background-color: rgba(36, 41, 46, 0.05); border-left: 4px solid #24292e; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
  <strong>👨‍🍳 Series: TokenChef (Git-Native Multi-Agent Coding)</strong>
  <ul style="margin-top: 8px; margin-bottom: 0; padding-left: 20px;">
    <li><strong>Part 1</strong>: <a href="/blog/worktree-refactor-playbook/">Vibe Coding with Git Worktrees: A Playbook Most Devs Are Missing</a></li>
    <li><strong>Part 2</strong>: <a href="/blog/chief-token-orchestrator-manage-layered-agent-team/">Chief Token Orchestrator: Manage Claude, Codex, and Gemini as a Structured Software Team</a></li>
    <li>👉 <strong>Part 3: wtcraft: A Lightweight, Git-Native Scaffolding for Bounded Multi-Agent Coding (Current)</strong></li>
  </ul>
</blockquote>

## Contents

- [Introduction](#introduction)
- [What is Harness Engineering?](#what-is-harness-engineering)
- [The Competitive Landscape](#the-competitive-landscape)
- [The Contract: .worktree-task.md](#the-contract-worktree-task-md)
- [Deterministic (D) vs. Agentic (A) Tagging](#deterministic-d-vs-agentic-a-tagging)
- [wtcraft: The Local Scaffolding CLI](#wtcraft-the-local-scaffolding-cli)
- [Getting Started in 10 Seconds](#getting-started-in-10-seconds)

---

## Introduction

In [Part 1: Chief Token Orchestrator](/blog/chief-token-orchestrator-manage-layered-agent-team/), we explored the strategic shift from naive, parallel agents to a structured, **layered agent team** designed to protect your Token, Context, and Review budgets.

But design philosophies are useless without a mechanism to enforce them.

If you tell a coding agent to *"fix this issue,"* but don't give it a strict sandbox and a verifiable boundary, it will wander off, touch files it shouldn't, write unnecessary code, and blow through your API quota.

To prevent this, we need **Harness Engineering**. This article explores the tactical tools, the competitive task landscape, and how the lightweight, git-native CLI [**wtcraft**](https://github.com/zywkloo/wtcraft) implements bounded contracts on your local machine.

---

## What is Harness Engineering?

In modern software engineering, a model (like Claude, Codex, or Gemini) is just the engine. **The harness is the vehicle.**

[Martin Fowler defined Harness Engineering](https://martinfowler.com/articles/harness-engineering.html) as the infrastructure, state management, error recovery, and boundary enforcement that wraps an AI model. An autonomous agent needs rails to keep it from derailing. 

Major tech companies have already proven this concept in production:
*   **Stripe's Minions Project**: Stripe runs autonomous "minions" to write, test, and submit pull requests across hundreds of millions of lines of payments code. They handle **1,300+ AI PRs per week** by enforcing strict, one-shot task boundaries.
*   **OpenAI's Codex Engineering**: OpenAI's team successfully integrated parallel Codex executors by wrapping them in rigid sandbox environments, ensuring that agent activity was monitored and strictly verification-gated.

**wtcraft is a lightweight, local-first implementation of these enterprise principles**—built for solo developers who want production-grade discipline without heavy platform overhead or expensive cloud costs.

---

## The Competitive Landscape

How do current platforms and agent formats guide execution? Let’s map the landscape.

### 1. Agent Platforms and Orchestrators
Platforms dictate *where* agents execute and how tasks are displayed.

| Tool | What it does | Strength | Gap | How wtcraft fits |
|------|-------------|----------|-----|------------------|
| **[Codex App](https://openai.com/index/introducing-the-codex-app/)** | OpenAI's desktop command center for managing parallel agents | Outstanding task UI and cross-stream visibility | Cloud-centric; struggles with local device state or private toolchains | Adds **file-boundary contracts** and **budget gates** for local execution |
| **[Codex Cloud](https://platform.openai.com/docs/codex/overview)** | Sandboxed cloud containers provisioned by OpenAI | Zero-setup workspace isolation | No access to local databases, simulators, or private credentials | Wraps local tasks in a **durable contract** that bridges cloud and local builds |
| **[Claude Code Worktrees](https://code.claude.com/docs/en/worktrees)** | Git-native worktree isolation (`--worktree`) | Native Git speed; great repo exploration | Token budget, handoff formats, and file scope are left to the user | Supplies the **missing contract layer**: `Scope` and `Off-limits` blocks |
| **[workmux](https://github.com/raine/workmux)** | Tmux layout wrapper for parallel git worktrees | Low-friction terminal workspace management | Manages terminal layout, not task execution or file boundaries | `.worktree-task.md` adds **intent contracts** inside workmux sessions |

---

### 2. Task Formats and Skill Specs
Task formats dictate *how* an agent is instructed. 

| Tool | Format | What it defines | Gap vs `.worktree-task.md` |
|------|--------|----------------|---------------------------|
| **[Devin AI](https://medium.com/@nitinmatani22/devin-ai-skills-the-skill-md-files-that-teach-an-ai-agent-your-entire-app-1c619dad0501)** | `SKILL.md` | Recurring workflow patterns for an agent | Describes a *pattern*, not a task execution unit. No Scope or Verification lifecycle. |
| **[Sweep AI](https://docs.sweep.dev/custom-prompts)** | Custom YAML | Prompts and triggers for Sweep PR generation | Focused on automated PR behavior, not individual bounded worktree tasks. |
| **[GitHub Copilot Workspace](https://github.com/githubnext/copilot-workspace-user-manual/blob/main/overview.md)** | Ephemeral Plan | Interactive UI-scoped step list | Session-only. Not readable by other agents when the session ends; no persistent `Off-limits` rules. |
| **[SWE-agent](https://swe-agent.com/latest/config/config/)** | Global YAML | Configures model tools and maximum step counts | Configures the *agent itself*, not individual, disjoint code tasks. |
| **[Claude SubAgents](https://code.claude.com/docs/en/sub-agents)** | `.claude/agents/*.md` | Reusable sub-agent tool configurations | Defs for *sub-agents*, not individual, verifiable branch contracts. |

If we evaluate these formats against the **six properties of a perfect task contract**, we find a stark gap:

| Tool | Repo-native | Scope | Off-limits | Verification | Status lifecycle | Worktree-native |
|------|:-----------:|:-----:|:----------:|:------------:|:----------------:|:---------------:|
| Devin SKILL.md | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Sweep Custom YAML | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Copilot Workspace | ✗ | partial | ✗ | ✗ | ✗ | ✗ |
| SWE-agent config | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Claude SubAgents | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **`.worktree-task.md`** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** |

Every existing format either defines *how an agent behaves* globally or *what to build* in a free-text prompt. **None defines exactly which files an agent is allowed to touch, which files are strictly off-limits, and what deterministic tests prove it stayed inside the lines.**

That is the gap wtcraft closes.

---

## The Contract: `.worktree-task.md`

In a `wtcraft`-enabled repository, every active branch worktree contains a task contract: `.worktree-task.md` at its root. 

Here is what a real contract looks like:

```markdown
---
branch: feat/billing-sync
agent: codex
status: ready
created: 2026-05-26
priority: high
base: main
---

## Scope

- src/billing/sync.py
- src/billing/sync_test.py

## Steps

- [ ] [D] Read files in Scope and Context in full.
- [ ] [A] Implement only the BLE offline sync client.
- [ ] [D] Run verification checks and capture outcomes.

## Off-limits

- src/db/schema.py
- package.json
- CLAUDE.md
- AGENTS.md
- GEMINI.md

## Context

Follow the existing sync pattern defined in `src/billing/legacy_sync.py`.

## Verification

- [ ] python -m unittest src/billing/sync_test.py
- [ ] flake8 src/billing/sync.py
```

This file is the single source of truth. The Orchestrator scaffolds it, the Planner (Claude Opus) designs it, the Executor (Codex) reads it, the Verifier (Claude) checks it, and the Finisher (Gemini) verifies and cleans it.

---

## Deterministic `[D]` vs. Agentic `[A]` Tagging

Notice the tags in the checklist:
*   **`[D]` (Deterministic)**: Indicates actions grounded in absolute git or shell reality. Reading files, executing compiler checks, running linter rules, and verifying exit codes.
*   **`[A]` (Agentic)**: Indicates actions requiring semantic reasoning. Generating implementations, interpreting test errors, making coding choices.

This separation is vital. **Deterministic steps are the ground truth.** 

If a `[D]` verification step fails (e.g. `flake8` returns exit code 1), the Executor agent is not allowed to ignore it or mark the task complete. The harness (wtcraft) detects the exit code, halts the execution loop, and demands a deterministic fix or a re-plan. This completely eliminates LLM "vibe coding" and keeps code quality mathematically sound.

---

## wtcraft: The Local Scaffolding CLI

[**wtcraft**](https://github.com/zywkloo/wtcraft) is a lightweight, non-invasive CLI that implements this contract layer. It doesn't replace your editors, agent apps, or custom configurations. It sits one layer below, acting as the guardrails.

### Core CLI Commands

1.  **`wtcraft init`**: Scaffolds the harness directories and templates. If you want integration with Claude, Codex, or Gemini CLI, opt-in with:
    ```bash
    wtcraft init --patch-agent-files
    ```
    This appends a tiny, non-invasive routing block to `CLAUDE.md`, `AGENTS.md`, and `GEMINI.md`. Your custom project instructions remain completely untouched.
2.  **`wtcraft new <branch-name>`**: Automatically provisions a new git worktree sandbox, checks out a clean branch, and scaffolds a custom `.worktree-task.md` contract.
3.  **`wtcraft status`**: Scans your worktree directories and displays a clean console matrix of all active tasks, assigned agents, priorities, and lifecycles.
4.  **`wtcraft check <task>`**: Automatically audits modified files against the contract's `Scope` and `Off-limits` lists. If an agent modified a file listed in `Off-limits`, `wtcraft check` fails, alerting you before any code is committed.
5.  **`wtcraft verify <task>`**: Executes the verification test commands defined in the contract and reports a clean, structured pass/fail telemetry matrix.

---

## Getting Started in 10 Seconds

You can install `wtcraft` locally using Homebrew, npm, or pipx:

```bash
# Node / npm
npm install -g wtcraft

# Python / pipx (recommended)
pipx install wtcraft

# Homebrew (macOS)
brew tap zywkloo/wtcraft https://github.com/zywkloo/wtcraft && brew install wtcraft
```

Once installed, simply run `wtcraft init` in your repository root, and start orchestrating your own layered agent team with strict, verifiable boundaries. 

Harness engineering is how solo developers go from wrangling loose models to managing a high-performance, cost-effective digital software team. 

---

*   **Repository**: [github.com/zywkloo/wtcraft](https://github.com/zywkloo/wtcraft)
*   **Part 1**: [Chief Token Orchestrator: Manage Claude, Codex, and Gemini as a Structured Software Team](/blog/chief-token-orchestrator-manage-layered-agent-team/)
