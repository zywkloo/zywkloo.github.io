---
title: 'From Structure to Semantics: Using EIT-TCF for Executable Semantics'
description: 'A practical way to use entity, invariant, transition, time, consistency, and failure to turn domain meaning into executable design.'
pubDate: 'Mar 28 2026'
heroImage: '../../assets/eit-tcf-executable-semantics-hero.svg'
---

Most engineers learn design through structure.

We talk about layers, patterns, and boundaries:

- MVVM or Clean Architecture
- repository and service layers
- monoliths, microservices, and event-driven systems

These are useful tools. They help us organize complexity.

But they are not usually what determines whether a system is correct.

The harder questions sit one level deeper:

- What is this system actually allowed to represent?
- What states are valid, invalid, or impossible?
- What must stay true under retries, delay, and failure?

That is the layer I care about most in design: semantics.

The core thesis is simple:

- structure organizes code
- semantics protect correctness
- semantics should become executable

## Why Structure Is Not Enough

A system can be well-structured and still wrong.

Common failures:

- a pending transaction appears as available balance
- retries create duplicate records
- summary totals disagree with the feed
- stale data overwrites fresher state
- illegal status transitions are representable

These are semantic failures, not folder-structure failures.

## EIT-TCF at a Glance

EIT-TCF is a practical lens for semantic design:

- `Entity`: what the system is modeling
- `Invariant`: what must never be wrong
- `Transition`: how state is allowed to change
- `Time`: which clock drives behavior
- `Consistency`: what must agree, and when
- `Failure`: how meaning survives retries and partial failure

It is not a formal framework. It is a checklist for turning domain meaning into enforceable system behavior.

![EIT-TCF semantic design lens](/images/eit-tcf-lens-diagram.svg)

### Entity

Define identity and facts first.

- What makes this record the same record over time?
- Which fields are authoritative facts?
- Which fields are only derived views?

If this stays fuzzy, everything downstream drifts.

### Invariant

Define non-negotiable rules early.

- money in integer minor units
- immutable creation timestamps
- pending records excluded from spendable balance
- summaries derived with the same rules as details

If invariants are implicit, bugs will rewrite them.

### Transition

Model legal state movement explicitly.

- pending -> settled
- pending -> failed
- settled -> reversed

Not every transition should be representable.

### Time

Pick the right clock for each decision.

- created time
- processed time
- settled time
- display time

If these are mixed casually, ordering and reconciliation become unstable.

### Consistency

Choose agreement boundaries on purpose.

- what must be strongly consistent
- what can be eventually consistent
- what may diverge briefly, but never semantically

The key is intentionality, not ideology.

### Failure

Design for production reality, not happy paths.

- retries
- duplicates
- out-of-order events
- stale caches
- partial writes

A design is incomplete until meaning survives these cases.

## Make Semantics Executable

The real goal is to encode semantics into code and pipeline behavior.

Practical patterns:

- value objects for money, identity, status
- validators for invariants
- explicit transition tables or guards
- projections from a clear source of truth
- idempotency keys and replay-safe handlers
- golden fixtures that lock interpretation across surfaces

![Semantics as code pipeline](/images/semantics-as-code-pipeline.svg)

The objective is straightforward:

- valid states are easy to represent
- invalid states are hard to construct

## Where DDD and DDIA Help

Both books are useful, but for different reasons.

- *Domain-Driven Design* sharpens business meaning and boundaries.
- *Designing Data-Intensive Applications* stress-tests that meaning under retries, replication, delay, and reordering.

Together they answer one practical question:

What must remain true when the system is under real operational stress?

## Example: Transaction Feed

Even a simple feed carries real semantic design:

- `amount` in minor units, not floating point
- `availableBalance` excludes pending funds
- `thirtyDaySpending` includes settled outflows only
- `runningBalance` depends on a defined ordering rule
- retries must not duplicate ledger effects
- display ordering and accounting ordering may differ

These are domain commitments. Architecture should enforce them, not weaken them.

## Final Thought

EIT-TCF is useful because it turns semantic design into executable decisions.

It helps teams move from:

- "How should we structure this?"

to:

- "What must this system mean, and how do we enforce it?"

Structure can be refactored.

Broken meaning is much harder to repair.
