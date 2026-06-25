---
title: 'Chief Token Orchestrator — Manage Claude, Codex, and Gemini as a Structured Software Team'
series: 'TokenChef 02'
description: 'Spawning parallel agents is easy. Spawning them without hitting token limits, context pollution, or review bottlenecks is hard. Discover why you need a structured, layered team architecture.'
pubDate: 'May 28 2026'
heroImage: '../../assets/chief-orchestrator-hero.png'
tags: ['AI Tools', 'Agent Architecture', 'Claude Code', 'Codex', 'Gemini', 'Solo Dev', 'Engineering', 'wtcraft']
tldr: 'Scaling AI agents requires structured orchestration to avoid token limits and context pollution. Learn how to manage Claude, Codex, and Gemini as a layered software team.'
---

<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
  <a href="https://www.npmjs.com/package/wtcraft"><img src="https://img.shields.io/npm/v/wtcraft.svg?style=flat-square&color=cb3837" alt="npm package" /></a>
  <a href="https://pypi.org/project/wtcraft/"><img src="https://img.shields.io/pypi/v/wtcraft.svg?style=flat-square&color=3775a9" alt="PyPI version" /></a>
  <a href="https://github.com/zywkloo/wtcraft"><img src="https://img.shields.io/badge/GitHub-wtcraft-24292e?style=flat-square&logo=github" alt="GitHub Repository" /></a>
</div>


## Contents

- [Why this exists](#why-this-exists)
- [The Room Full of Very Fast Interns](#the-room-full-of-very-fast-interns)
- [The Three Crucial AI Budgets](#the-three-crucial-ai-budgets)
- [The Golden Pipeline: The Layered Agent Team](#the-golden-pipeline-the-layered-agent-team)
- [DAG, Not Task Queue](#dag-not-task-queue)
- [Prerequisite: Do You Actually Need Parallelism?](#prerequisite-do-you-actually-need-parallelism)
- [What Next?](#what-next)

---

## Why this exists

**Keywords:** `Solo Dev` · `Budget-Aware` · `Agent Handoff` · `Boundaries` · `Layered Team`

Git worktrees are no longer a secret trick.

Most serious AI coding workflows eventually discover the same pattern: one agent per branch, one branch per worktree, one terminal or editor window per task. It works because `git worktree` gives each agent its own working directory and index. They can read the same repository history without stepping on the same checkout.

But solo developers hit a different ceiling than large enterprise teams. 

We do not have unlimited token budgets, dedicated agent cluster infrastructure, or a team of QA engineers waiting to review ten AI-generated branches. We are usually orchestrating a few paid command-line tools, a local machine, one editor, one terminal, and our own finite attention span.

So the real bottleneck in multi-agent workflows is not parallelism. It is **handoff** and **budgeting**. 

When one agent finishes its task, how does another agent know what was changed, what was off-limits, and how to verify the result? When you return to your computer two hours later, how do you know whether a branch is ready to merge or still half-baked?

That is why we need to transition from "running multiple agents" to acting as the **Chief Token Orchestrator**: managing Claude, Codex, and Gemini as a structured, disciplined software engineering team.

---

## The Room Full of Very Fast Interns

A worktree isolates a **filesystem checkout**. It does not isolate **intent**.

If you spawn three parallel agents and tell them to "clean up the codebase," "improve the store component," or "refactor the database schema," you will quickly discover a fundamental law of software engineering: **entropy scales faster than code.**

Without a clear boundary, two parallel agents will decide to refactor the same helper function in two slightly different ways. One will update a dependency that breaks another’s build. The worktree successfully prevents raw filesystem collisions during editing, but it does not prevent:
*   **Design drift**: Diverging architectural choices across branches.
*   **Overlapping ownership**: Multiple agents trying to touch the same core files.
*   **Review overload**: A massive wall of AI-generated PRs that you, the human developer, must mentally digest.

Without a structured team setup, multi-agent coding turns into a room full of very fast interns all touching the same whiteboard at once.

---

## The Three Crucial AI Budgets

To keep the interns from creating chaos, a solo developer must govern the workflow using **three budgets**:

### 1. The Token Budget (The Cost Limit)
High-reasoning flagship models (like Claude 3.5 Opus / Sonnet or GPT-5.5) are brilliant at architectural design and complex problem solving, but they are expensive. Spending premium-tier tokens on repetitive mechanical tasks—like writing boilerplate, correcting minor syntax typos, or applying simple refactoring scripts—is highly uneconomical. We must tier our model use.

### 2. The Context Budget (The Attention Span)
A long-running agent session accumulates assumptions, compiler logs, and warning prints. If every small task receives the entire repository history, all documentation files, and a huge prompt instruction block, you pay heavily for context that does not help the task. This leads to model confusion, slower response times, and eventually, subtle code hallucinations. 

### 3. The Review Budget (The Silent Killer)
This is the ultimate bottleneck. Agents can generate code much faster than you can review it. If you have eight agents working in parallel, you are still the single human developer who has to read the diffs, run the app, test the edge cases, and click merge. **Two high-quality parallel branches are infinitely better than eight half-reviewed, buggy ones.**

Orchestration is not about maximizing concurrency. It is about **budget-aware boundaries**.

---

## The Golden Pipeline: The Layered Agent Team

Instead of letting one model handle everything, we orchestrate a highly efficient, budget-friendly multi-agent team by assigning models to specialized roles based on their speed, reasoning power, and cost:

```text
             [ Human Developer ]
                      │
                      ▼ (Strategic Intent)
┌────────────────────────────────────────────┐
│   Orchestrator (Gemini 3.5 Flash)          │ ◄── Cross-Repo Integration (Coming Soon)
└─────────────────────┬──────────────────────┘
                      │ (Subtask & Context)
                      ▼
┌────────────────────────────────────────────┐
│   Planner (Claude 3.5 Opus / GPT-5.5)      │ ◄── Strategic Architect
└─────────────────────┬──────────────────────┘      ▲
                      │ (Writes Task Contract)      │
                      ▼                             │
┌────────────────────────────────────────────┐      │ (Re-plan / Loopback)
│   Executor (GPT-5.3 / Claude Sonnet)       │ ◄── Precision Coder
└─────────────────────┬──────────────────────┘      │
                      │ (Writes Code in Sandbox)    │
                      ▼                             │
             [ Human Developer ] (Pushes, Creates PR)
                      │                             │
                      ▼                             │
┌────────────────────────────────────────────┐      │
│   Verifier (Claude Opus / Gemini Pro)      │ ◄── Agentic Review (Upcoming)
└─────────────────────┬──────────────────────┘      │
                      │                             │
                      ▼                             │
             [ Human Developer ] ───────────────────┘
             (Approve OR Retry / Re-plan)
                      │
                      │ (If Approved -> Merge)
                      ▼
┌────────────────────────────────────────────┐
│   Finisher (Gemini Flash / Claude Haiku)   │ ◄── Local Cleanup & Token Telemetry (Coming Soon)
└────────────────────────────────────────────┘
```

### 1. The Orchestrator (e.g., Gemini 3.5 Flash)
*   **Role**: Sits at the top of the workflow. Highly tool-agentic, low-latency, and coordinates the overall project state.
*   **Specialty**: Manages environment orchestration, git logistics, verification suites, and telemetry. Core features like cross-repository worktree monitoring, automated session summarization, and active agent handoff routing are upcoming integrations (**Coming Soon**).

### 2. The Planner (e.g., Claude 3.5 Opus / GPT-5.5)
*   **Role**: The slow, high-reasoning "architect". 
*   **Specialty**: Reads your strategic requirements, explores the codebase structure, and designs the bounded execution contract specifying exactly what needs to be changed, what is off-limits, and how it must be verified.

### 3. The Executor (e.g., Codex / GPT-4o-mini / Claude Sonnet)
*   **Role**: The precision coder.
*   **Specialty**: Highly focused and cost-effective. It operates strictly inside the isolated sandbox, adhering strictly to the contract boundaries generated by the Planner. It does not waste tokens exploring the whole repository.

### 4. The Verifier (e.g., Claude Opus / Gemini Pro)
*   **Role**: The quality gatekeeper.
*   **Specialty**: Conducts automated reviews, runs style and security checks, and runs integration test suites. If verification fails, it compiles clean failure telemetry and feeds it back to the Executor/Planner.

### 5. The Finisher (e.g., Gemini 2.5 Flash / Claude Haiku)
*   **Role**: The cleanup crew.
*   **Specialty**: Performs deterministic boundary validation, sweeps away local worktree assets after a successful merge to keep your disk clean, and compiles the final token telemetry bill (**Coming Soon**).

---

## DAG, Not Task Queue

To manage these agents efficiently, **do not treat tasks as a simple chronological list**.

Take a feature like "offline file sync." A naive setup might try to run these parallel tasks:
*   `T1`: Shared database types and constants.
*   `T2`: BLE transfer client logic.
*   `T3`: UI sync status indicator component.
*   `T4`: Tests and documentation.

Since `T2`, `T3`, and `T4` all import and depend on the types defined in `T1`, running them simultaneously in three worktrees will lead to massive merge conflicts. 

The rule for the **Chief Token Orchestrator** is:
> **Merge the shared foundation first.** Parallelize file-disjoint downstream tasks after that. Serialize anything that touches the same files.

This is a Directed Acyclic Graph (DAG) approach. By structuring task dependencies, you prevent merge debt and ensure that every agent works in a stable, isolated context.

---

## Prerequisite: Do You Actually Need Parallelism?

Before building a multi-agent team, ask yourself: **Do I actually have multiple independent tasks that need to run at the same time?**

If you are working on a single sequential flow—fixing a single bug, polishing one UI component—**you do not need worktrees or layered pipelines.** A single focused agent session in your main editor is faster, lower overhead, and more efficient.

Worktrees and orchestrators pay for themselves when you have **independent, concurrent tasks**: one agent refactoring an API in the background while another writes unit tests, and a third updates the docs. That is when boundaries and handoffs earn their setup cost.

---

## What Next?

To make a layered team work, you need a way to enforce boundaries. You need a **contract** that the Orchestrator scaffolds, the Planner writes, the Executor reads, and the Verifier checks.

How do we build this contract in plain Markdown and Git, and how does a 10-second CLI enforce it locally without heavy platforms?

👉 **[Read Part 2: Harness Engineering & Bounded Contracts with wtcraft](/blog/wtcraft-lightweight-git-native-multi-agent-scaffolding/)** to see how to install and run this workflow on your own machine.
