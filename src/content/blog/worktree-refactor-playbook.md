---
title: 'Vibe Coding with Git Worktrees: A Playbook Most Devs Are Missing'
description: 'Most people vibe-code with one model in one branch. Here is how to use multiple models, git worktrees, and a phased workflow to ship refactors without breaking everything.'
pubDate: 'Feb 5 2026'
heroImage: '../../assets/worktree-refactor-hero.svg'
tags: ['Vibe Coding', 'Git', 'Worktrees', 'Claude', 'AI Tools', 'Engineering']
---

## The problem nobody talks about

So you're vibe coding. You fire up Claude or Cursor, describe what you want, and let the AI rip through your codebase. It works great for greenfield stuff — new features, small scripts, quick prototypes.

But then you try to **refactor something real**. A messy auth module. A tangled state management layer. A migration from one ORM to another. And suddenly your one-shot vibe coding session turns into a disaster: half the tests are broken, you lost track of what changed, and you're not even sure which version of the code is the "good" one anymore.

Here's the thing most devs don't realize: **vibe coding has phases**, and each phase works best with a different model, a different branch strategy, and a different level of caution. If you're using the same model and the same branch for everything — understanding, planning, execution, verification — you're leaving a ton of value on the table.

This playbook is how I actually do it. No theory, just what works.

## Wait, what are git worktrees?

If you've never used git worktrees, here's the 30-second version: they let you have **multiple branches checked out at the same time** in different folders. No stashing, no branch switching, no "wait let me save my work first."

```bash
# Create a worktree for your spike experiment
git worktree add ../my-spike spike-branch

# Create one for your actual refactor
git worktree add ../my-refactor refactor-branch

# Your main branch stays untouched in the original folder
```

You can literally have `main`, a throwaway spike, and your real refactor open in three different VS Code windows simultaneously. That's the superpower. And it pairs incredibly well with AI-assisted coding because you can have **different Claude sessions working on different worktrees** without stepping on each other.

## Git branch vs. git worktree — what's actually different?

A lot of people hear "worktree" and think it's just a fancy way to say "branch." It's not. They solve different problems, and understanding the mechanism helps you pick the right one.

### How branches work

A **branch** is just a pointer to a commit. When you `git switch feature-x`, git rewrites your working directory to match that commit. Your whole folder changes in place.

```
my-project/          ← one folder, one branch at a time
  ├── src/
  ├── package.json
  └── .git/          ← all branches live here as refs
```

The limitation: you can only have **one branch checked out at a time** per folder. Want to look at `main` while working on `feature-x`? You have to stash, switch, look, switch back, pop. It's annoying, and it breaks your flow — especially when you have an AI coding agent mid-session that loses context when you switch.

### How worktrees work

A **worktree** creates a separate working directory that shares the same `.git` data. Each worktree checks out a different branch independently.

```
my-project/              ← main branch (original)
  ├── src/
  ├── package.json
  └── .git/              ← the single source of truth

../my-spike/             ← spike branch (worktree)
  ├── src/
  ├── package.json
  └── .git  (file)       ← just a pointer back to my-project/.git

../my-refactor/          ← refactor branch (worktree)
  ├── src/
  ├── package.json
  └── .git  (file)       ← same pointer
```

Key things to know:
- All worktrees share the same git history, remotes, and object store — no duplicated `.git` blobs
- Each worktree has its own working directory and index (staging area), so changes don't collide
- You **cannot** check out the same branch in two worktrees simultaneously (git protects you from this)
- Commits made in any worktree are visible to all others immediately

### When to use which

| Scenario | Use branch | Use worktree |
|---|---|---|
| Quick feature, no context switching needed | Yes | Overkill |
| Need to reference `main` while refactoring | Stash-switch is painful | Yes — keep both open |
| Running an AI agent on a long task | Risky to switch mid-session | Yes — separate folder, separate session |
| Throwaway experiment / spike | Sure, but cleanup is manual | Yes — `git worktree remove` and it's gone |
| Comparing old vs. new behavior side by side | Awkward with one folder | Yes — two VS Code windows |
| CI broke main, need a hotfix while deep in a refactor | Stash everything, fix, pop | Yes — hotfix in `wt-main`, don't touch refactor |
| Multiple team members, each on a module | Branches are fine | Worktrees if they need cross-reference |

**The rule of thumb:** if you're going to switch branches more than twice in an hour, or if you need two versions of the code visible at the same time, use a worktree. If it's a simple feature branch you'll merge and delete, a regular branch is fine.

### The AI coding angle

Here's why this matters specifically for vibe coding: when you have Claude Code or Cursor working in a session, **switching branches kills the context**. The AI was building up understanding of the files in your working directory. If you stash and switch to `main` to check something, then switch back, the AI's mental model might not survive the disruption.

With worktrees, you never switch. Main is always *over there*. Your refactor is always *right here*. Your spike is in a third folder. Each can have its own terminal, its own AI session, its own flow state. That's the real reason worktrees pair so well with AI-assisted development.

## The four phases of vibe coding (and which model to use)

Here's where it gets interesting. Most people just pick one model and go. But each phase of a refactor has different needs:

### Phase 1: Understanding — "What even is this code doing?"

**Use your strongest model.** (Opus, o1, etc.)

This is where you're mapping the codebase, understanding dependencies, and figuring out what's actually going on. You need deep reasoning here, not speed.

What to ask:
- "Walk me through the architecture of this module and its dependencies"
- "What are the invariants this code relies on? What breaks if I change X?"
- "Where are the gaps in test coverage?"
- "What's the riskiest part to touch?"

**You're done with this phase when** you have a written plan, a file list, and a rough sequence of changes. Don't skip this. The number one reason AI-assisted refactors go sideways is jumping straight to "just rewrite it."

### Phase 2: Planning — "How should I restructure this?"

**Strong model again.**

Now you're making design decisions: new interfaces, what to delete vs. wrap, data flow changes. This is tradeoff territory and you want the model that's best at reasoning about consequences.

What you want out of this phase:
- A mini design doc (even just bullet points in a markdown file)
- A migration checklist with small, atomic steps
- Clear boundaries between "must change" and "nice to have"

### Phase 3: Execution — "Okay, time to actually move code around"

**Switch to a faster/cheaper model.** (Sonnet, Haiku, GPT-4o-mini, etc.)

This is the mechanical part: renaming files, updating imports, applying codemods, expanding boilerplate, wiring up new interfaces. The changes are deterministic and repetitive. You don't need your strongest model burning tokens on `find-and-replace` work.

This is also where **worktrees shine**. You can have:
- Your `main` branch open to quickly verify "what did the old code do here?"
- Your refactor branch where the AI is cranking through changes
- Optionally a spike branch if you tried something experimental earlier

### Phase 4: Verification — "Did I break anything?"

**Back to the strong model.**

Subtle runtime regressions, state bugs, concurrency issues, weird edge cases — this is where you need deep reasoning again. The fast model is great at *making* changes, but the strong model is better at *catching* what went wrong.

What to ask:
- "Here's my diff. What behavioral changes might I have missed?"
- "These 3 tests are failing. What's the root cause?"
- "Is this change backwards compatible with the existing API consumers?"

## Worktree strategies: pick one that fits your situation

Not every refactor needs three worktrees. Here's how to decide:

### Strategy A: Just one branch (low risk)

When to use it: the refactor is straightforward, tests stay green after each step, you can merge frequently.

This is your default. Don't overcomplicate things if you don't need to.

### Strategy B: Two worktrees (medium risk)

```
wt-main     →  tracks main, for hotfixes and behavior checks
wt-refactor →  your long-running refactor branch
```

When to use it: you expect the build to be broken for a while, or you need to frequently compare old vs. new behavior side by side.

### Strategy C: Three worktrees — spike + implementation (high uncertainty)

```
wt-main  →  baseline
wt-spike →  throwaway experiment to prove the approach works
wt-impl  →  clean implementation after you've validated the spike
```

When to use it: you're not sure the approach is even correct. The spike lets you test fast without polluting your real branch. If the spike fails, you just delete it. Zero cost.

**This is the one most people should be using more often.** Spikes are underrated. They let you vibe-code fearlessly because there's no consequence to failure.

### Strategy D: Multi-track (team or multi-module)

```
wt-auth-refactor
wt-storage-refactor
wt-ui-refactor
→ merge into integration branch when each is stable
```

When to use it: modules can be refactored independently. Great for teams, but also works solo if your codebase has clean module boundaries.

## The decision cheat sheet

Not sure what to do? Here's the quick version:

| Situation | Model | Worktree strategy |
|---|---|---|
| "I don't understand this code yet" | Strong (Opus) | Read-only on main |
| "I have a plan, lots of files to change" | Fast (Sonnet/Haiku) | wt-refactor |
| "Not sure if this approach works" | Strong for spike, fast for impl | wt-spike + wt-impl |
| "Build will be broken for days" | Mix | Keep clean wt-main |
| "Flaky regressions after changes" | Strong | Keep changes small |
| "Massive renames and file moves" | Fast for moves, strong for edges | wt-refactor |

## A workflow you can actually copy-paste

Here's the concrete playbook I follow for non-trivial refactors. The diagram below shows the full flow — which model to use at each step, and which worktree you're working in:

![The 6-Step Refactor Workflow — showing model selection and worktree usage for each phase](/images/worktree-workflow-diagram.svg)

Let's break each step down:

**Step 1: Map the territory** (strong model, on `main`)
- Document modules, dependencies, pain points
- Define the refactor target and step plan
- Identify invariants and tests to add first
- You're just reading here — don't change anything yet

**Step 2: Add safety nets** (fast model writes, strong model reviews)
- Add or strengthen tests before touching anything
- Set up feature flags or adapters if needed
- The fast model can crank out test boilerplate; the strong model checks if you're actually testing the right things

**Step 3: Spike it** (strong model, `wt-spike` worktree)
- Prove the new approach compiles and integrates
- Validate naming and folder structure
- If the spike is wrong, delete the worktree and try again — zero cost

**Step 4: Execute the refactor** (fast model, `wt-refactor` worktree)
- Codemods, file moves, import updates
- Commit in small, logical chunks
- Reference `wt-main` whenever you need to check old behavior

**Step 5: Stabilize** (strong model, still on `wt-refactor`)
- Fix runtime regressions and edge cases
- Review for API compatibility and behavior parity

**Step 6: Clean up and merge** (fast model)
- Remove dead code and temporary adapters
- Format, lint, update docs
- Merge `wt-refactor` into `main`, delete the worktrees

## The do's and don'ts

**Do:**
- Keep a worktree on `main` so you can reproduce bugs fast
- Isolate experiments in a spike worktree — they're free to throw away
- Keep change sets small and cohesive
- Use the strong model for *thinking* and the fast model for *doing*
- Switch models deliberately, not randomly

**Don't:**
- Run multiple high-churn refactor branches without an integration plan
- Use your most expensive model for mechanical find-and-replace work
- Skip the understanding phase because you're excited to start coding
- Let a spike branch silently become your production branch (clean-room it)

## TL;DR

Vibe coding is powerful, but it's not one-size-fits-all. The devs who ship clean refactors aren't just picking the "best" model — they're **matching the right model to the right phase**, and using git worktrees to keep their experiments isolated from their production work.

The combo of strong model for thinking + fast model for doing + worktrees for isolation is the closest thing I've found to a refactoring cheat code. Give it a try on your next non-trivial refactor and see how it feels.
