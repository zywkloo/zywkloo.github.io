---
title: 'Keeping Domain Semantics Intact in a Transaction App'
description: 'A practical framework for maintaining domain semantics in a transaction app across contracts, validators, policies, projections, UI states, and regression boundaries.'
pubDate: 'Mar 29 2026'
heroImage: '../../assets/domain-semantics-hero.jpg'
---

Transaction apps look simple from the outside:

- a summary card
- a feed
- a detail view
- a filter bar

But semantic drift usually starts long before the UI looks obviously wrong.

It starts when different parts of the app quietly answer the same business question differently:

- What counts as available balance?
- What does pending mean?
- Which transactions belong in spending totals?
- Which timestamp drives ordering?
- Which colors or badges imply finality?

So the real question is not just "how do we model transactions?"

It is:

How do we maintain one interpretation of a transaction across data, behavior, UI, and change over time?

## The Right Unit of Analysis: Dimensions, Not Screens

When people analyze a transaction app screen by screen, the write-up often turns into a feature demo.

That misses the important part.

A stronger way to think about semantic maintenance is by layer.

For a transaction-heavy financial app, I would group the problem into three sections:

1. **Domain rules**
   contract, validator, decider, policy
2. **View semantics**
   projection, interaction semantics, design system enforcement
3. **Operational integrity**
   regression boundaries and governance

![Domain semantics maintenance loop](/images/domain-semantics-maintenance-loop.svg)

## 1. Domain Rules

This is the layer that decides what the app is allowed to mean before it ever renders a screen.

### Contract: What Is the System Allowed to Represent?

The contract layer defines the vocabulary of the app.

For a transaction entity, that usually includes:

- identity
- type
- category
- amount
- currency
- status
- timestamps
- derived fields such as running balance

The contract should answer questions like:

- Is `amount` stored in integer minor units?
- Are `type` and `category` both needed, and do they mean different things?
- Is `runningBalance` authoritative or derived?
- Are notes and tags user-entered metadata or business data?

In a small transaction app, this may live in TypeScript types and service interfaces. In a larger system, it usually becomes an API contract, persistence schema, and shared domain vocabulary.

The important part is not where it lives. The important part is that everyone is speaking the same language.

### Validator: What Must Never Be Wrong?

Once the contract exists, the next layer is validation.

This is where semantic rules stop being descriptive and become enforceable.

Typical examples in a transaction app:

- amounts must use integer minor units
- status must come from a restricted set
- pending records should not carry final-only fields
- currency and formatting rules must be compatible
- category values must belong to an approved vocabulary

These are not "nice to have" checks.

They are what prevent the model from silently absorbing semantic nonsense.

In practice, validators can live in:

- model constructors
- service adapters
- selectors
- backend request handlers
- import pipelines

The exact location is less important than the discipline: important invariants should fail loudly instead of relying on team memory.

### Decider: How Is Change Allowed?

A lot of semantic drift is really state-transition drift.

That is why I like to separate the decider dimension from the validator dimension.

Validators say:

- this state is invalid

Deciders say:

- this change is not allowed

In a transaction app, that shows up as questions like:

- Can pending become settled?
- Can settled become reversed?
- Can a transaction change category after ingestion?
- Can a retry create a second transaction, or should it reconcile with an existing one?

If these rules are not explicit, they end up scattered across reducers, service code, and UI conditionals.

A decider can be a reducer rule, a domain service, a transition table, or a backend workflow. The form is flexible. The point is that lifecycle decisions should be centralized enough to reason about.

### Policy: Which Interpretation Wins?

Policy is where a lot of business semantics actually lives.

A policy is not just a validation rule. It is a decision rule applied repeatedly.

For transaction apps, policy questions include:

- Does available balance exclude pending funds?
- Does 30-day spending include only settled outflows?
- Does a transfer count as spending, movement, or neither?
- Which date defines recency: created, posted, or settled?
- What does the app do with stale local data on launch?

These are not screen decisions.

They are cross-cutting policies that multiple parts of the app must obey.

One of the easiest ways for semantics to decay is letting each screen or selector rediscover policy independently.

## 2. View Semantics

Once the domain rules are defined, the next question is whether the app expresses them consistently across its views.

### Projection: How Do Derived Views Stay Honest?

A transaction app is full of projections:

- available balance
- 30-day spending
- filtered feeds
- detail views
- analytics summaries
- badge states

The key discipline here is separating facts from projections.

Facts are the underlying records.

Projections are interpretations of those records for a particular purpose.

The moment a projection is mistaken for source of truth, semantics start to fork.

That is why selectors and summary logic matter so much. They are not just performance helpers. They are projection boundaries.

A good projection layer should make it easy to answer:

- where does this number come from?
- which rules were applied?
- should the detail screen and summary card always agree?

### Interaction and UI Semantics: What Does the User Actually Learn?

Semantic maintenance is not just backend logic.

It also includes how meaning is expressed in the interface.

A feed row, for example, is not just decoration. It encodes business interpretation through:

- signed amount formatting
- relative or absolute time labels
- pending versus settled badge language
- category iconography
- empty, loading, and error states

The detail screen carries the same responsibility. It should deepen the user’s understanding of the record, not reinterpret it.

A strong question to ask is:

What would a user believe after looking at this screen?

If the answer differs from what the domain model intends, that is a semantic bug even if the data is technically correct.

### Design System Enforcement: Can the UI Drift Semantically?

This belongs in the same section as UI semantics because design systems are one of the main ways interaction meaning gets enforced consistently.

In a transaction app, the design system is not just typography and spacing. It is also a semantic control surface.

That can include:

- semantic color tokens like `positive`, `negative`, `pending`
- status badges with consistent language and contrast
- custom UI elements such as transaction rows, amount labels, and state chips
- component contracts for loading, error, and empty states

The point is not to build a huge component library too early.

The point is to notice which UI meanings need system-level enforcement instead of discipline alone.

A useful maturity ladder looks like this:

- token file
- shared semantic components
- lint or review rules for new hard-coded states
- visual regression coverage for critical surfaces

Without that, semantic meaning can drift visually even when the underlying data logic stays correct.

## 3. Operational Integrity

The last section is about keeping semantic meaning stable as the app evolves.

### Regression and Governance: How Does the Meaning Stay Stable?

The last dimension is not code structure. It is maintenance discipline.

A transaction app should usually protect semantics through several layers of verification:

- unit tests for pure projection rules
- contract tests around service boundaries
- integration tests for feed, summary, filter, error, and retry coordination
- visual regression tests for status, amount, and balance presentation
- decision logs when semantics change

This is also where ownership matters.

When a semantic rule changes, someone should be able to answer:

- what changed?
- which screens and services are affected?
- what historical behavior remains valid?
- how will regressions be detected?

That is what keeps "multiple truths at once" from creeping in.

## What This Looks Like in a Small App

Even in a compact transaction app, you can already see these dimensions:

- domain rules in the transaction model, service interface, and semantic calculation choices
- view semantics in selectors, rows, badges, detail screens, and design tokens
- operational integrity in tests, review discipline, and future change control

That is why I do not think of semantic maintenance as one special domain layer.

I think of it as alignment across dimensions.

## Final Thought

If a transaction app is trustworthy, it is usually because multiple layers are agreeing on meaning at the same time.

That trust does not come only from a good model.

It comes from:

- a clear contract
- strong validators
- explicit deciders
- stable policies
- honest projections
- consistent UI semantics
- design-system enforcement
- regression boundaries that keep interpretation from drifting

That is the practical work of maintaining domain semantics.

Not describing the domain once.

Keeping the whole system honest over time.
