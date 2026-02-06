---
title: 'Refactor Playbook: Models, Risk, and Git Worktrees'
description: 'A practical guide to choosing models and worktree setups when refactoring code, based on risk and ambiguity.'
pubDate: 'Feb 5 2025'
heroImage: '../../assets/blog-placeholder-1.jpg'
tags: ['Refactoring', 'Git', 'Worktrees', 'Planning', 'AI Tools', 'Engineering']
---

## Why this matters

Refactors fail when the plan is fuzzy, the risk is high, and the work happens in one long-lived branch. A good refactor balances three forces: ambiguity, mechanical churn, and the cost of being wrong. The right model and the right worktree setup help you control all three.

This is a practical playbook you can apply in real repos, not just toy projects.

## Use different models by phase

### 1) Recon and scoping (high ambiguity)

Use your strongest reasoning model.

Goals:
- Map the current architecture and dependencies
- Identify invariants and critical paths
- Find gaps in tests and observability
- Define stopping points where the code is still shippable

Switch away once you have a written plan, a file list, and a change sequence.

### 2) API and design decisions (tradeoffs)

Use the strong model again.

Goals:
- Define new boundaries, interfaces, and data flow
- Decide what to delete, wrap, or temporarily adapt
- Produce a migration checklist with small steps

Output you want: a mini design doc and a migration checklist.

### 3) Mechanical edits (repetitive change)

Use a faster or cheaper coding model.

Goals:
- Rename or move files
- Update imports and wiring
- Apply codemods
- Expand boilerplate and update call sites

Rule of thumb: if the change is deterministic and tool-assisted, do not spend your strongest model here.

### 4) Debugging and test failures (high uncertainty)

Use the strong model again.

Goals:
- Diagnose subtle runtime regressions
- Trace concurrency, state, or caching bugs
- Propose minimal fixes that preserve behavior

### 5) Review and hardening (quality gate)

Use the strong model for a final pass.

Goals:
- Check compatibility, performance, and error handling
- Separate must-do fixes from nice-to-haves
- Validate logging, metrics, and rollback safety

## Use different worktrees by risk and parallelism

### A) Mainline-safe incremental refactor (default)

Worktree strategy: one branch, small commits.

Use this when you can keep tests green after each step. Merge or rebase frequently to avoid long-lived drift.

### B) Big surgery with high churn

Worktree strategy: two worktrees.

- `wt-main`: tracks `main` for hotfixes and behavior checks
- `wt-refactor`: your long-running refactor branch

Use this when you expect days of broken builds or massive file moves.

### C) Spike vs production implementation

Worktree strategy: three worktrees.

- `wt-main`: baseline
- `wt-spike`: experimental proof
- `wt-impl`: clean implementation after the spike

Use this when you are unsure the approach is correct and want to test quickly without polluting the real branch.

### D) Multi-track refactor

Worktree strategy: multiple worktrees per subsystem.

- `wt-auth-refactor`, `wt-storage-refactor`, `wt-ui-refactor`
- Merge into an integration branch once each stream is stable

Use this when modules can be refactored independently and multiple people are working in parallel.

## A simple decision matrix

- Unclear architecture: strong model + `wt-spike`
- Clear plan, lots of edits: fast model + `wt-refactor`
- Build will be broken for a while: keep a clean `wt-main`
- Flaky regressions: strong model, keep changes small
- Sweeping renames and moves: fast model for the move, strong model for dependency edges

## A concrete workflow that works

1) Baseline mapping (strong model)

- Document modules, dependencies, and pain points
- Define the refactor target and a step plan
- List invariants and tests to add first

2) Add safety rails (fast model, reviewed by strong model)

- Add or strengthen tests
- Add feature flags or adapters if needed

3) Spike in a separate worktree (strong model)

- Prove the new boundaries compile and integrate
- Validate naming and folder structure
- Throw away the spike if it is wrong

4) Implementation refactor (fast model)

- Codemods, file moves, import updates
- Commit in small, logical chunks

5) Stabilize (strong model)

- Fix runtime regressions and edge cases
- Review for API compatibility and behavior parity

6) Final cleanup (fast model)

- Remove dead code and adapters
- Format, lint, and update docs

## Do and don’t rules

- Do keep a worktree on `main` to reproduce bugs fast
- Do isolate experimental ideas in a spike worktree
- Do keep change sets small and cohesive
- Don’t run multiple high-churn refactor branches without an integration plan
- Don’t let the strongest model do purely mechanical edits

## Closing thought

Refactors are a risk-management exercise. The model and the worktree layout are your two biggest levers. Use them deliberately and you will refactor faster, with fewer surprises.
