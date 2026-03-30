---
title: 'From Structure to Semantics: Using EIT-TCF for Executable Semantics'
description: 'A practical way to use entity, invariant, transition, time, consistency, and failure to turn domain meaning into executable design.'
pubDate: 'Mar 28 2026'
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

More specifically, semantics should not remain trapped in docs, discussions, or team memory. They should become executable in code, projections, tests, and failure handling.

## Structure Organizes Code. Semantics Protect Meaning.

A system can be beautifully structured and still be wrong.

You can still ship bugs like:

- a pending transaction showing up as available balance
- duplicate records after a retry
- a summary card disagreeing with the underlying list
- stale data overwriting fresher state
- illegal state transitions because status is just a string

These are not really structural failures.

They are semantic failures.

The issue is not where the code lives. The issue is that the system never made its business meaning explicit enough to defend itself.

Structure tells you where code goes.

Semantics tell you what the system is allowed to mean.

## A Practical Design Lens

When I look at a feature or system, I usually want six things to be clear:

- Entity
- Invariant
- Transition
- Time
- Consistency
- Failure

Not as a formal framework. Just as a practical checklist for turning business meaning into something the system can actually enforce.

### Entity

What is the thing we are modeling?

What gives it identity? Which fields are facts, and which are derived views?

If that is vague, everything downstream becomes unstable.

### Invariant

What must never be wrong?

Money stored in integer minor units. Immutable creation timestamps. Pending records excluded from available balance. Summaries following the same rules as the underlying data.

If these rules are only implicit, the system will eventually violate them.

### Transition

How is change allowed?

A strong system does not treat state as free text. It defines legal movement.

Pending can become settled. Settled may become reversed. Some transitions should not exist at all.

### Time

Which timestamp matters?

Created time, processed time, settled time, displayed time: these are not interchangeable.

If the system does not define which one drives ordering, grouping, or reconciliation, inconsistency is only a matter of time.

### Consistency

What must agree, and when?

Not everything needs strong consistency. But the system should be explicit about where temporary divergence is acceptable and where it is not.

### Failure

How does the model behave when reality gets messy?

Retries, duplicate requests, stale caches, out-of-order events, partial failures, replayed messages: this is not edge-case territory. This is production.

A design is incomplete until meaning survives failure.

## The Real Goal: Make Semantics Executable

Good design should not stop at describing semantics.

It should make them executable.

That means correctness lives in code, data flow, and tests, not just in docs or team memory.

In practice, that often means:

- value objects for concepts like money, status, and identity
- validators for invariants
- explicit state transition rules
- projections derived from a clear source of truth
- idempotency rules for retries
- fixtures and tests that preserve interpretation across refactors
- versioning rules for evolving contracts safely

The goal is simple:

Make valid states easier to represent, and invalid states harder to construct.

## Why DDD and DDIA Still Matter

*Domain-Driven Design* forces you to take business meaning seriously. It pushes important concepts out of vague language and into explicit models.

*Designing Data-Intensive Applications* reminds you that meaning does not stay still. Data gets retried, replayed, cached, delayed, reordered, and projected. If the semantics are not durable, the system becomes structurally clean but behaviorally inconsistent.

One clarifies the model. The other stress-tests it against reality.

Together, they push design toward a better question:

Not "How should I structure this?"

But "What must remain true when this system is under delay, drift, and failure?"

## A Simple Example

Take something as ordinary as a transaction feed.

It already contains a lot of semantic design:

- `amount` should be integer minor units
- `availableBalance` probably excludes pending records
- `thirtyDaySpending` may include only settled outflows
- `runningBalance` depends on ordering assumptions
- retries should not create duplicates
- list ordering and accounting ordering may not be the same
- `pending` should not quietly behave like `final`

Those are not mostly UI decisions.

They are domain decisions.

And they shape everything else: model design, selectors, service contracts, storage choices, tests, and recovery behavior.

That is why good engineering design is often less about drawing cleaner boxes and more about protecting meaning.

## Final Thought

Structure matters.

But structure is only the container.

The deeper design work is deciding what the system means, what it must never mean, and how that meaning survives real-world failure.

That is why I keep coming back to the same idea:

Domain semantics should become executable.

That is what makes EIT-TCF useful. It is not just a checklist for analysis. It is a way to identify the semantics that should be encoded, tested, and preserved across the system.

Not just in the model, but across the whole pipeline.

Because structure can be refactored.

Broken meaning is much harder to repair.
