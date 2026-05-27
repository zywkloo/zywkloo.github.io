---
title: 'wtcraft — Budget-Aware Multi-Agent Coding Harness'
description: 'wtcraft is a lightweight, git-native harness for solo developers orchestrating multiple coding agents on a limited budget. Clean agent handoffs, file boundaries, and task contracts — without a heavy platform.'
pubDate: 'May 26 2026'
heroImage: '../../assets/budget-aware-agent-harness-hero.svg'
tags: ['AI Tools', 'Codex', 'Claude Code', 'Git', 'Worktrees', 'Solo Dev', 'Engineering']
---

## Contents

- [Why this exists](#why-this-exists)
- [The current tool landscape](#the-current-tool-landscape)
- [The missing layer: task contracts](#the-missing-layer-task-contracts)
- [My workflow: Claude plans, Codex executes](#my-workflow-claude-plans-codex-executes)
- [DAG, not task queue](#dag-not-task-queue)
- [Budget-aware orchestration](#budget-aware-orchestration)
- [Where wtcraft fits](#where-wtcraft-fits)
- [The workflow in one screen](#the-workflow-in-one-screen)
- [TL;DR](#tldr)

## Why this exists

**Keywords:** `Solo Dev` · `Budget-Aware` · `Agent Handoff` · `Boundaries` · `Lightweight`

> **[wtcraft](https://github.com/zywkloo/wtcraft) — Budget-Aware Multi-Agent Coding Harness**
>
> A real, installable package — not a thought experiment. Try it: `npx wtcraft init`

Git worktrees are no longer a secret trick.

Most serious AI coding workflows eventually discover the same pattern: one agent per branch, one branch per worktree, one terminal or editor window per task. It works because `git worktree` gives each agent its own working directory and index. They can read the same repository history without stepping on the same checkout.

But solo developers hit a different ceiling than large teams.

We do not have unlimited token budgets, dedicated agent infrastructure, or a reviewer pool waiting for ten AI-generated branches. We are usually orchestrating a few paid tools, a local machine, one editor, one terminal, and our own finite attention.

So the real workflow problem is not just parallelism. It is handoff.

When Claude plans and Codex executes, what exactly gets handed off? When one agent finishes, how does another agent know what was changed, what was off-limits, and how to verify the result? When you come back two hours later, how do you know whether a branch is safe to review or still half-baked?

That is the problem this workflow is designed around:

- solo developer constraints
- budget-aware model use
- explicit agent handoff
- file and task boundaries
- lightweight tooling that stays close to Git

I already wrote the basic version of that playbook in [Vibe Coding with Git Worktrees](/blog/worktree-refactor-playbook/). This article is the next layer.

The real problem is no longer "can I run multiple agents?" The answer is yes. The real problem is:

- which agent should plan?
- which agent should execute?
- which files may each agent touch?
- which files are off-limits?
- which tasks can run in parallel?
- when should a solo developer stop spawning agents because review load is now the bottleneck?

That is why I started building [wtcraft](https://github.com/zywkloo/wtcraft): a small, git-native harness for bounded multi-agent coding.

The goal is not maximum parallelism. The goal is clean boundaries.

## The current tool landscape

The ecosystem is moving fast, and the direction is obvious: **coding agents are becoming parallel by default**.

Here is how the major tools stack up — and where the gaps are:

| Tool | What it does | Strength | Gap | Why wtcraft |
|------|-------------|----------|-----|-------------|
| **[Codex App](https://openai.com/index/introducing-the-codex-app/)** | OpenAI's desktop command center for managing multiple parallel agents | Purpose-built multi-agent UI; full task visibility across parallel workstreams | Cloud-centric; unsuitable for local device builds, private toolchains, or simulator-dependent workflows | Adds **file-boundary contracts** and **budget gating** for local-first execution alongside Codex tasks |
| **[Codex Cloud](https://platform.openai.com/docs/codex/overview)** | Per-task sandboxed cloud containers provisioned by OpenAI | Zero-setup isolation; great for stateless repo-scoped changes | No access to local device state, simulators, private credentials, or project-specific machine setup | Wraps local Codex CLI in **task contracts**, bridging cloud tasks with local builds |
| **[Claude Code Worktrees](https://code.claude.com/docs/en/worktrees)** | Git-native worktree isolation for parallel Claude sessions (`--worktree`, `isolation: worktree`) | Strong repo exploration, planning, and subagent dispatch; solid filesystem primitive | Token budget, handoff format, file ownership, and review fanout are still left entirely to the developer | Supplies the **contract layer**: `Scope`, `Off-limits`, `Verification` — the pieces `--worktree` doesn't define |
| **[workmux](https://github.com/raine/workmux)** | Git worktrees + tmux windows for parallel session orchestration | Low-friction terminal layout; keeps all agent sessions visible at once | Handles session topology, not task ownership — no built-in handoff contracts or file boundary enforcement | `.worktree-task.md` adds **intent contracts** that sit alongside workmux sessions without conflicting |
| **Claude Code App (Engineering Skills)** | **Role-personalized skill bundles** (`/architecture`, `/code-review`, `/debug`, `/deploy-checklist`, …) curated to your developer role | Curated, repeatable structured workflows; dramatically lowers the floor for consistent AI-assisted engineering | Skills are session-scoped — no persistent cross-session task contracts or file-level boundary enforcement across agents | `/wtplan` generates task contracts that **pair directly** with these skills; `/wtfinish` closes the review loop |

![Claude Code App — Engineering skill bundle, showing role-personalized skills including /architecture, /code-review, /debug, /deploy-checklist, /documentation, /incident-response](/images/claude-code-app-skills.png)

*Claude Code App's Engineering skill bundle: role-personalized workflows out of the box. My `/wtplan` and `/wtfinish` commands complement these — wtcraft supplies the **durable task contract** that survives across sessions and agents.*

None of these fully answer the question I care about most:

> **What is this agent allowed to change, and how do I prove it stayed inside the boundary?**

That is the layer I call the **harness**.

## The missing layer: task contracts

A worktree isolates a **filesystem checkout**. It does not isolate **intent**.

If two agents both decide to "clean up the store," "fix the shared schema," or "touch the index barrel while I am here," you still have a problem. The worktree prevented file-level stomping in the same directory, but it did not prevent **design drift**, **overlapping ownership**, or **review chaos**.

So every non-trivial worktree task needs a **contract**.

In my workflow, that contract is `.worktree-task.md`:

```md
---
branch: feat/example-task
agent: codex
status: ready
created: 2026-05-26
priority: medium
base: develop
---

## Scope

- src/example.ts
- src/example.test.ts

## Steps

- [ ] [D] Read files listed in Scope and Context.
- [ ] [A] Implement only the requested change.
- [ ] [D] Run verification checks and capture outcomes.

## Off-limits

- pnpm-lock.yaml
- contracts/
- CLAUDE.md
- AGENTS.md

## Context

This task should follow the existing parser pattern in `src/parser.ts`.

## Verification

- [ ] pnpm tsc --noEmit
- [ ] pnpm test src/example.test.ts
```

This file is not product documentation. It is **local execution metadata** for one worktree.

`Scope` says what the agent may touch. `Off-limits` says what it must not touch. `Verification` defines done. `Context` is the minimum information needed to avoid wasting tokens rediscovering the same facts.

The tags are useful too:

- `[D]` means **deterministic**: read files, run tests, check diffs.
- `[A]` means **agentic**: reason, generate code, interpret errors.

The distinction matters because **deterministic steps are the ground truth**. If `pnpm tsc --noEmit` fails twice, the answer is not "try vibes harder." The answer is stop, report the failure, and re-plan.

## My workflow: Claude plans, Codex executes

The workflow I use is intentionally boring:

- **Git** provides the sandbox.
- **Claude Code** acts as planner and conductor.
- **Codex CLI** or extension acts as executor.
- **`.worktree-task.md`** acts as the task contract.
- `CLAUDE.md` and `AGENTS.md` only route agents to the right local harness docs.

I like Claude Code as the **planning layer** because it is strong at repo exploration, decomposition, and instruction writing. I like Codex as the **execution layer** because it can work tightly inside a bounded task and is easy to run from CLI/editor workflows.

But the model names are not the real point. GPT-5.5, Claude, Codex, Cursor, or another coding agent can all fit into this pattern. The point is **capability and cost tiering**:

- use the **strongest model** for understanding and planning
- use a **cheaper or faster agent** for bounded implementation
- return to a **stronger model** for review and debugging
- do not spend premium tokens on repetitive mechanical edits

This matters for solo developers. Many of us are not running enterprise agent infrastructure. We are using first-tier paid plans, local machines, and whatever time we have after the rest of life gets its share.

**The harness is how you make that constraint productive instead of frustrating.**

## DAG, not task queue

When I say "DAG," I do not mean the workflow needs to feel academic.

I just mean: **do not treat tasks as a simple queue**, and do not open eight agents at once because the tool lets you.

Take a feature like "offline file sync." A naive split might be:

```text
T1: shared types and constants
T2: BLE transfer client
T3: UI status component
T4: tests and docs
```

`T2`, `T3`, and `T4` probably depend on the types and constants from `T1`. So the safe shape is:

```text
T1 first
then T2 / T3 / T4 in parallel if they do not touch the same files
```

The rule is simple:

> **Merge the shared foundation first.** Parallelize file-disjoint tasks after that. Serialize anything that touches the same important file.

This is the difference between **useful parallelism** and self-inflicted merge work.

For a solo developer, there is another limit: **review bandwidth**.

Eight agents can produce eight branches, but you are still the person who has to read the diffs, understand the tradeoffs, run the app, and decide what lands. **Two high-quality parallel branches are often better than eight half-reviewed ones.**

## Budget-aware orchestration

Multi-agent coding has **three budgets**:

- **Token budget** — obvious. Expensive models should spend their time where their reasoning matters.
- **Context budget** — easier to miss. A long-running agent accumulates assumptions. If every task gets the whole repo history, all architecture docs, and a huge prompt, you pay for context that may not help the task.
- **Review budget** — the quiet killer. When agents run faster than you can review, your project does not become faster. **It becomes messier.**

The harness controls all three:

- durable project knowledge goes in **repo docs**, not repeated chat prompts
- task-specific knowledge goes in **`.worktree-task.md`**
- **file ownership is written down before execution**
- verification commands are **deterministic**
- failed verification has a **retry limit**
- work that shares files is **serialized**

This is why I prefer the phrase **"budget-aware multi-agent coding"** over "parallel agents."

Parallelism is just a capability. **Budget-aware orchestration is a workflow.**

## Where wtcraft fits

**[wtcraft](https://github.com/zywkloo/wtcraft)** is the small CLI I started extracting from this workflow.

It is not trying to replace Codex, Claude Code, workmux, tmux, VS Code, or GitHub. It **sits one layer lower** — supplying the contract infrastructure these tools assume but don't provide:

- scaffold `.agent-harness/` docs
- create **`.worktree-task.md` templates**
- optionally add tiny routing stubs to `CLAUDE.md` and `AGENTS.md`
- create worktrees
- show task status
- **check changed files against Scope and Off-limits**
- **run Verification commands**

The important design choice is **non-invasiveness**.

`wtcraft init` does not overwrite your `CLAUDE.md` or `AGENTS.md`. If you want integration, you opt in:

```bash
wtcraft init --patch-agent-files
```

That appends a small managed routing block. **Your existing project instructions remain yours.**

The package is intentionally plain:

```bash
wtcraft init
wtcraft new feat/my-task
wtcraft status
wtcraft check feat/my-task
wtcraft verify feat/my-task
```

The early version is just shell scripts, templates, CI, and smoke tests. That is enough to **prove the workflow** before turning it into an npm package.

## The workflow in one screen

Here is the mental model I keep coming back to:

```text
Human developer
  |
  | defines intent and reviews merge risk
  v
Planner agent
  |
  | explores repo, writes task contract
  v
git worktree + .worktree-task.md
  |
  | bounded execution
  v
Executor agent
  |
  | edits only Scope, avoids Off-limits
  v
Verifier
  |
  | runs deterministic checks
  v
Human review + merge
```

The small detail that makes the whole system work is the contract in the middle.

Without it, "multi-agent coding" turns into a room full of very fast interns all touching the same whiteboard.

With it, a solo developer can start to feel like a small engineering team:

- one agent maps the terrain
- one agent executes the bounded task
- another reviews the edge cases
- Git keeps each lane isolated
- the task contract keeps the lanes honest

## TL;DR

**Git worktrees solve checkout isolation. They do not solve task ownership.**

Codex app, Codex cloud, Claude Code worktree isolation, Claude Code App skill bundles, and tools like workmux all make parallel agent work more practical. But for solo developers, **the missing piece is a lightweight harness**: a way to decide what can run in parallel, what must be serialized, and what each agent is allowed to touch.

My answer is:

- **Git-native worktrees** for isolation
- **`.worktree-task.md`** for task contracts
- **Claude** or another strong model for planning
- **Codex** or another fast agent for bounded execution
- **deterministic verification** before merge
- **fewer, higher-quality parallel branches**

That is what **[wtcraft](https://github.com/zywkloo/wtcraft)** is trying to package: not another agent, but a small set of rails for using the agents you already have.
