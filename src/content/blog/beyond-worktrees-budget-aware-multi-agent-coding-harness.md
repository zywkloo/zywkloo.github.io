---
title: 'Beyond Worktrees: A Budget-Aware Multi-Agent Coding Harness for Solo Developers'
description: 'Parallel coding agents are no longer the hard part. The hard part is boundaries: which agent owns which files, when work can run in parallel, and how a solo developer keeps token spend and review load under control.'
pubDate: 'May 26 2026'
heroImage: '../../assets/budget-aware-agent-harness-hero.svg'
tags: ['AI Tools', 'Codex', 'Claude Code', 'Git', 'Worktrees', 'Engineering']
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

Git worktrees are no longer a secret trick.

Most serious AI coding workflows eventually discover the same pattern: one agent per branch, one branch per worktree, one terminal or editor window per task. It works because `git worktree` gives each agent its own working directory and index. They can read the same repository history without stepping on the same checkout.

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

The ecosystem is moving fast, and the direction is obvious: coding agents are becoming parallel by default.

[OpenAI's Codex app](https://openai.com/index/introducing-the-codex-app/) is explicitly designed to manage multiple agents at once, run work in parallel, and collaborate over long-running tasks. It is powerful, but it is also a dedicated desktop surface. That is great if you want an agent command center. It is less ideal if your preferred workflow is still "CLI plus VS Code" or "CLI plus any editor."

[Codex cloud](https://platform.openai.com/docs/codex/overview) provisions a sandboxed cloud container per task. That is convenient for many repo-level changes, but cloud sandboxes are not always enough for local/mobile/native workflows. Some builds need local simulators, device state, private toolchains, local credentials, or project-specific machine setup.

[Claude Code worktrees](https://code.claude.com/docs/en/worktrees) are closer to the workflow I want. Claude Code supports parallel sessions isolated in git worktrees, and its docs describe `--worktree` and subagent `isolation: worktree`. That is a strong primitive.

[workmux](https://github.com/raine/workmux) is also very close in spirit. It combines git worktrees with tmux windows for low-friction parallel development. Tools like this solve session orchestration: create the worktree, open the terminal, run the agent, keep things visible.

But none of these fully answer the question I care about most:

> What is this agent allowed to change, and how do I prove it stayed inside the boundary?

That is the layer I call the harness.

## The missing layer: task contracts

A worktree isolates a filesystem checkout. It does not isolate intent.

If two agents both decide to "clean up the store," "fix the shared schema," or "touch the index barrel while I am here," you still have a problem. The worktree prevented file-level stomping in the same directory, but it did not prevent design drift, overlapping ownership, or review chaos.

So every non-trivial worktree task needs a contract.

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

This file is not product documentation. It is local execution metadata for one worktree.

`Scope` says what the agent may touch. `Off-limits` says what it must not touch. `Verification` defines done. `Context` is the minimum information needed to avoid wasting tokens rediscovering the same facts.

The tags are useful too:

- `[D]` means deterministic: read files, run tests, check diffs.
- `[A]` means agentic: reason, generate code, interpret errors.

The distinction matters because deterministic steps are the ground truth. If `pnpm tsc --noEmit` fails twice, the answer is not "try vibes harder." The answer is stop, report the failure, and re-plan.

## My workflow: Claude plans, Codex executes

The workflow I use is intentionally boring:

- Git provides the sandbox.
- Claude Code acts as planner and conductor.
- Codex CLI or extension acts as executor.
- `.worktree-task.md` acts as the task contract.
- `CLAUDE.md` and `AGENTS.md` only route agents to the right local harness docs.

I like Claude Code as the planning layer because it is strong at repo exploration, decomposition, and instruction writing. I like Codex as the execution layer because it can work tightly inside a bounded task and is easy to run from CLI/editor workflows.

But the model names are not the real point. GPT-5.5, Claude, Codex, Cursor, or another coding agent can all fit into this pattern. The point is capability and cost tiering:

- use the strongest model for understanding and planning
- use a cheaper or faster agent for bounded implementation
- return to a stronger model for review and debugging
- do not spend premium tokens on repetitive mechanical edits

This matters for solo developers. Many of us are not running enterprise agent infrastructure. We are using first-tier paid plans, local machines, and whatever time we have after the rest of life gets its share.

The harness is how you make that constraint productive instead of frustrating.

## DAG, not task queue

When I say "DAG," I do not mean the workflow needs to feel academic.

I just mean: do not treat tasks as a simple queue, and do not open eight agents at once because the tool lets you.

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

> Merge the shared foundation first. Parallelize file-disjoint tasks after that. Serialize anything that touches the same important file.

This is the difference between useful parallelism and self-inflicted merge work.

For a solo developer, there is another limit: review bandwidth.

Eight agents can produce eight branches, but you are still the person who has to read the diffs, understand the tradeoffs, run the app, and decide what lands. Two high-quality parallel branches are often better than eight half-reviewed ones.

## Budget-aware orchestration

Multi-agent coding has three budgets:

- token budget
- context budget
- review budget

Token budget is obvious. Expensive models should spend their time where their reasoning matters.

Context budget is easier to miss. A long-running agent accumulates assumptions. If every task gets the whole repo history, all architecture docs, and a huge prompt, you pay for context that may not help the task.

Review budget is the quiet killer. When agents run faster than you can review, your project does not become faster. It becomes messier.

The harness controls all three:

- durable project knowledge goes in repo docs, not repeated chat prompts
- task-specific knowledge goes in `.worktree-task.md`
- file ownership is written down before execution
- verification commands are deterministic
- failed verification has a retry limit
- work that shares files is serialized

This is why I prefer the phrase "budget-aware multi-agent coding" over "parallel agents."

Parallelism is just a capability. Budget-aware orchestration is a workflow.

## Where wtcraft fits

[wtcraft](https://github.com/zywkloo/wtcraft) is the small CLI I started extracting from this workflow.

It is not trying to replace Codex, Claude Code, workmux, tmux, VS Code, or GitHub. It sits one layer lower:

- scaffold `.agent-harness/` docs
- create `.worktree-task.md` templates
- optionally add tiny routing stubs to `CLAUDE.md` and `AGENTS.md`
- create worktrees
- show task status
- check changed files against Scope and Off-limits
- run Verification commands

The important design choice is non-invasiveness.

`wtcraft init` does not overwrite your `CLAUDE.md` or `AGENTS.md`. If you want integration, you opt in:

```bash
wtcraft init --patch-agent-files
```

That appends a small managed routing block. Your existing project instructions remain yours.

The package is intentionally plain:

```bash
wtcraft init
wtcraft new feat/my-task
wtcraft status
wtcraft check feat/my-task
wtcraft verify feat/my-task
```

The early version is just shell scripts, templates, CI, and smoke tests. That is enough to prove the workflow before turning it into an npm package.

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

Git worktrees solve checkout isolation. They do not solve task ownership.

Codex app, Codex cloud, Claude Code worktree isolation, and tools like workmux all make parallel agent work more practical. But for solo developers, the missing piece is a lightweight harness: a way to decide what can run in parallel, what must be serialized, and what each agent is allowed to touch.

My answer is:

- Git-native worktrees for isolation
- `.worktree-task.md` for task contracts
- Claude or another strong model for planning
- Codex or another fast agent for bounded execution
- deterministic verification before merge
- fewer, higher-quality parallel branches

That is what [wtcraft](https://github.com/zywkloo/wtcraft) is trying to package: not another agent, but a small set of rails for using the agents you already have.
