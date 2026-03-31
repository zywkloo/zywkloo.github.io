---
title: 'Keeping Domain Semantics Intact in a Transaction App'
description: 'A practical look at how a transaction-heavy financial app can preserve domain meaning across models, selectors, UI states, tests, and design tokens.'
pubDate: 'Mar 29 2026'
heroImage: '../../assets/domain-semantics-hero.jpg'
---

When people talk about financial apps, they usually talk about features:

- account summary
- transaction feed
- detail screen
- filters
- loading and error states

But the hard part is not really the surface area.

The hard part is semantic integrity.

In a transaction-heavy financial app, small ambiguities quickly become product bugs:

- Does pending money count as available?
- Is a transfer spending, movement, or both?
- Which date drives the 30-day window?
- Can the summary card and detail screen disagree temporarily?
- Is a color token just visual, or does it carry state meaning?

This article is about that practical layer: how to maintain domain semantics in a transaction app so the system keeps one interpretation of the truth across data, UI, and interaction.

## The Semantic Surface of the App

Even a compact transaction app already contains multiple semantic surfaces:

- the transaction model
- the account summary
- the paginated feed
- the transaction detail screen
- category filters
- design tokens and status colors

If those surfaces do not share the same meaning, the app may still compile and still be wrong.

## Start with the Transaction Model

In this app, the core transaction model already tells us which concepts need protection:

- `id`
- `type`
- `category`
- `amount`
- `currency`
- `date`
- `status`
- `runningBalance`
- `notes`
- `tags`

Some of these are just descriptive.

Some are semantic anchors:

- `amount` is stored in integer minor units
- `status` distinguishes pending from settled
- `runningBalance` is a derived accounting value
- `type` and `category` shape downstream interpretation

That is the first maintenance rule in practice:

not all fields are equally important, but the high-risk ones must be interpreted consistently everywhere.

## The Summary Header Is a Semantic Projection

The summary header looks simple:

- available balance
- 30-day spending

But those numbers are not raw fields. They are semantic projections.

That distinction matters.

In the app, `availableBalance` is derived by excluding pending transactions from spendable funds. That is not just a calculation detail. It is a product decision about what "available" means.

Likewise, `thirtyDaySpending` excludes pending transactions and only counts settled outflows in the 30-day window. Again, that is semantics, not formatting.

If another screen computed those numbers differently, the app would have two balances and two spending totals pretending to be one.

## The Feed Is Not the Source of Truth

A transaction feed is a view, not the model itself.

That means the feed has to preserve meaning while still being optimized for readability:

- relative dates for scanning
- status labels for quick interpretation
- signed amounts for inflow vs outflow
- category icons for fast recognition

In the row component, even the text treatment carries semantic weight:

- pending is visually separated from settled
- positive amounts and negative amounts are styled differently
- date and status are grouped as one compact interpretation layer

The lesson is simple:

presentation is not separate from semantics. It is one of the places semantics are communicated and therefore one of the places they can drift.

## The Detail Screen Has to Agree with the Feed

The detail screen is where semantic inconsistencies become obvious.

If the feed says one thing and the detail screen says another, users do not experience that as a distributed systems problem. They experience it as mistrust.

That is why the detail screen matters so much in financial software. It has to carry the same meaning as the feed, only with more explicit context:

- full date instead of relative date
- running balance after the transaction
- type, category, status, notes, and tags

This is a good example of semantic continuity:

the detail screen should deepen the meaning of the record, not reinterpret it.

## Filters Are Also Semantic

Even something as ordinary as a category filter contains semantic choices.

The filter in this app is client-side and instant, which is good for responsiveness. But the more important point is that it works on the same transaction set and the same category model as the rest of the app.

That keeps the meaning stable:

- the category list and the feed agree on category values
- the filtered list is a projection, not a different dataset
- summary and feed behavior can be reasoned about against the same base records

When filters silently change the meaning of totals or list membership, semantic drift starts to creep in.

## Time Semantics Are Everywhere

Time handling in financial software is rarely "just a date field."

In this app, time affects at least three things:

- feed ordering
- relative date display
- the 30-day spending window

That means the app needs one stable interpretation of time even though the UI renders it in multiple ways.

A relative label like "2 days ago" is only a presentation layer. The semantic source is still the underlying ISO timestamp.

The same goes for windowed spending totals. If one part of the app uses transaction creation time while another uses settlement time, the app will drift even if both screens look reasonable in isolation.

## Design Tokens Are Part of Semantic Maintenance

This is where design system thinking becomes surprisingly important.

The token file in the app does not just define colors. It defines semantic visual roles:

- `positive`
- `negative`
- `pending`
- `textPrimary`
- `textSecondary`
- `bgSecondary`

That matters because visual language is part of meaning.

If pending is orange in one place, neutral in another, and error-red in a third, the UI stops having a coherent semantic system. The same is true for positive and negative monetary states.

So yes, design tokens can absolutely be part of semantic maintenance. They help ensure the same domain state is expressed consistently across components.

## Tests Protect Interpretation

One of the strongest practical moves in this app is testing selectors that encode semantic rules.

Those tests do not just check arithmetic. They protect interpretation.

Examples:

- pending transactions are excluded from available balance
- only settled withdrawals count toward 30-day spending
- category filters return the correct semantic subset

This is exactly the kind of test that keeps a financial app honest over time. It is less about whether a function runs and more about whether the app still means the same thing after refactors.

## What I Would Extend in a Real Production Version

If this app were connected to a real backend, the next semantic safeguards I would add are:

- explicit idempotency handling for retried transaction fetches or writes
- clearer distinction between event time and settlement time
- versioned projections for summary calculations
- domain-level status transitions beyond just pending and settled
- stronger ownership of semantic rules shared across mobile, backend, and analytics

The point is not to over-engineer a small demo.

The point is to notice where semantic drift would happen first once the app grows.

## Final Thought

Maintaining domain semantics in a financial app is not one design decision.

It is a chain of aligned decisions:

- the model means one thing
- selectors derive one interpretation
- the feed communicates that interpretation clearly
- the detail screen confirms it
- tokens reinforce it visually
- tests keep it stable over time

That is what semantic maintenance looks like in practice.

Not abstract theory.

A product that keeps telling the same truth across every layer.
