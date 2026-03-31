---
title: 'From Structure to Semantics: Using TEC-FIT for Executable Semantics'
description: 'How TEC-FIT emerges from the core ideas of Domain-Driven Design and Designing Data-Intensive Applications.'
pubDate: 'Mar 28 2026'
heroImage: '../../assets/eit-tcf-executable-semantics-hero.svg'
---

Most engineers first learn design through structure.

We learn layers, modules, service boundaries, patterns, and deployment shapes. Those are useful. They help organize code and teams.

But the question that stayed with me over time was different:

- What is this system actually allowed to represent?
- What must remain true even when data is delayed, retried, or partially wrong?
- Which states should be impossible, not just discouraged?

That question is what eventually led me to a simple lens I now use a lot:

- `Entity`
- `Invariant`
- `Transition`
- `Time`
- `Consistency`
- `Failure`

I call it `TEC-FIT`.

This article is not really about presenting a brand new framework. It is about explaining where that lens came from. For me, it emerged from the overlap between two books that shaped how I think about design:

- *Domain-Driven Design*
- *Designing Data-Intensive Applications*

## Why These Two Books Matter Together

The books solve different problems.

- *Domain-Driven Design* helps answer: what does the business mean?
- *Designing Data-Intensive Applications* helps answer: what happens to that meaning when data moves through a real system?

That distinction matters.

DDD pushes you to sharpen concepts such as identity, lifecycle, rules, and boundaries. DDIA pushes you to think about retries, reordering, replication, caching, projections, and time.

One gives you semantic precision.

The other gives you operational realism.

Put together, they force a more demanding design question:

How do we preserve meaning under real system behavior?

## What I Take from DDD

The most important lessons I take from *Domain-Driven Design* are:

- business language should be precise enough to model
- important concepts deserve explicit boundaries
- invariants should live close to the model that owns them
- not every noun needs to become a first-class concept, but the expensive ones do

DDD changed how I look at domain objects.

I stopped seeing them as containers for fields and started seeing them as carriers of meaning. Identity, lifecycle, and rule ownership became design questions, not just naming questions.

That shift is where `Entity`, `Invariant`, and much of `Transition` come from in TEC-FIT.

## What I Take from DDIA

The biggest lesson I take from *Designing Data-Intensive Applications* is that meaning is fragile once data starts moving.

The book keeps pulling attention back to things teams often postpone:

- retries
- duplicates
- projections
- caches
- ordering
- replication
- event time versus processing time
- strong versus eventual consistency

DDIA is valuable because it refuses to let a design stay idealized.

A model may look coherent on a whiteboard and still break in production because timestamps were underspecified, projections drifted, retries were not idempotent, or stale data overwrote fresher state.

That is where `Time`, `Consistency`, and `Failure` in TEC-FIT come from, and it is also where `Transition` becomes more than a state machine on paper.

## How TEC-FIT Emerged

I did not derive TEC-FIT from one single chapter or diagram. It emerged because the same design questions kept recurring across both books.

The mapping now looks fairly natural:

1. `Entity`
   DDD asks what the core thing is, what gives it identity, and which data is part of its meaning.

2. `Invariant`
   DDD asks what must never be violated and which part of the model owns that responsibility.

3. `Transition`
   DDD makes lifecycle explicit; DDIA reminds you that transitions are stressed by async behavior, retries, and delayed updates.

4. `Time`
   DDIA makes it impossible to stay vague about timestamps, ordering, windows, and late-arriving events.

5. `Consistency`
   DDIA forces you to decide what must agree, when, and across which projections or storage boundaries.

6. `Failure`
   DDIA treats failure as normal system behavior, while DDD makes you ask what those failures mean for the domain.

That is why TEC-FIT feels practical to me. It captures the semantic pressure points that repeatedly show up when business meaning meets real systems.

![TEC-FIT semantic design lens](/images/eit-tcf-lens-diagram.svg)

## Why This Lens Helps

TEC-FIT is useful because it turns abstract design quality into concrete questions.

Instead of saying:

- use clean architecture
- split this into services
- add a repository

it pushes the conversation toward:

- What is the entity?
- What must never be wrong?
- How is state allowed to change?
- Which notion of time matters here?
- What must stay consistent?
- How does the model behave under retries, duplication, and failure?

That is a better starting point because structure can serve those answers instead of substituting for them.

## From Theory to Executable Semantics

Once the semantic questions are explicit, the next step is to encode them.

That usually means:

- value objects for important concepts
- validators for invariants
- transition guards for lifecycle rules
- well-defined projections
- idempotent handlers
- tests that protect interpretation, not just implementation

In other words, the goal is not just semantics.

The goal is executable semantics.

![Semantics as code pipeline](/images/semantics-as-code-pipeline.svg)

## What the Two Books Ultimately Contribute

If I had to compress the relationship into one sentence, it would be this:

- DDD tells me what the domain needs to mean.
- DDIA tells me what can go wrong when that meaning is implemented in a real system.

TEC-FIT is my shorthand for holding both at the same time.

It is not a replacement for those books. It is a distilled design habit I took from reading them closely and applying them repeatedly.

## Final Thought

I still care about structure. Everyone should.

But structure is not where correctness begins.

Correctness begins when the system is clear about meaning:

- what it is modeling
- what must never be wrong
- how change is allowed
- how time, consistency, and failure affect interpretation

That is why TEC-FIT exists for me.

It is the point where lessons from DDD and DDIA become a practical checklist for semantic design.
