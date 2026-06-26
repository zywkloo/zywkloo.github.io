---
title: "Ternary Native Component Swap"
series: 'ReactNativeCulprits 03'
description: "Identical stack to RN Culprit #1. Same assertion. The fix looks like magic, but is deeply logical when you understand how Fabric commit queues process layout-only view unmounting."
pubDate: "Jun 26 2026"
heroImage: "../../assets/rn_ternary_native_component_swap_hero.jpg"
tags: ["React Native", "Fabric", "iOS", "Crash", "New Architecture", "Debugging"]
tldr: "Investigates a Fabric crash identical to Culprit #2's stack trace, but triggered by ternary unmounting of layout-only views, and explains the commit pipeline fix."
---

## The Same Crash, a Different Cause

```
*** Terminating app due to uncaught exception 'NSInternalInconsistencyException',
reason: 'RCTComponentViewRegistry: Attempt to recycle a mounted view.'

#11  -[RCTComponentViewRegistry _enqueueComponentViewWithComponentHandle:...]
       at RCTComponentViewRegistry.mm:114
```

Identical stack to [RN Culprit #2](/blog/rn-culprit-02-fabric-view-flattening). Same assertion. Same `Delete` instruction firing on a view whose `superview` is still non-nil.

But triggered by a different architectural pattern entirely. While legacy interop components (like old gradient libraries) or view flattening are notorious for causing this assertion, another major culprit that lives purely in your React logic is the ternary native component swap.

---

## The Pattern

```jsx
{isDownloading
  ? <ActivityIndicator color="#FFFFFF" size="small" />  // native component A
  : <SearchIcon color="#FFFFFF" size={24} />}           // native component B
```

A ternary in a slot. One branch renders a native `ActivityIndicator` (`UIActivityIndicatorView` under the hood). The other renders an SVG-backed `SearchIcon`. The slot always holds one or the other.

When `isDownloading` changes, Fabric must replace one native component with the other:

```
Transition: true → false

Remove  ActivityIndicator (tag=5) from parent (tag=3)
Delete  ActivityIndicator (tag=5)       → recycled to pool
Create  SearchIcon (tag=6)
Insert  SearchIcon (tag=6) into parent (tag=3)
```

A clean four-instruction sequence. Harmless for a single, low-frequency transition.

---

## Why It Breaks Under Rapid Updates

The `isDownloading` state was not just a binary flag. It came from a download progress store that updated on every transferred chunk — potentially dozens of times per second. Each update called `setStatus({kind: 'downloading', bytesDone, bytesTotal})`. Each call triggered a render. React batched some, but not all. Multiple Fabric commits were generated and queued.

Now consider the commit pipeline when state alternates `true → false → true` in rapid succession.

Commit A processes `true → false`: Remove+Delete `ActivityIndicator`, Create+Insert `SearchIcon`.  
Commit B processes `false → true`: Remove+Delete `SearchIcon`, Create+Insert `ActivityIndicator`.

The two commits are dispatched to the main thread and processed sequentially. Within a single commit the instructions execute in order. But there is a subtlety: Fabric's `RCTMountingManager` tracks an in-flight flag. When a transaction arrives while another is being applied, it sets a follow-up flag and the current transaction is asked to re-check state after finishing.

Under high-frequency updates, the commits pile up faster than the main thread can drain them. The shadow tree snapshots that back each commit can fall out of sync with what is actually attached in UIKit. A `Delete` instruction referencing a tag that has already been recycled and re-inserted by a prior commit fires against a view that is still attached — `superview != nil` — assertion fails.

The component types being *different* is what makes this worse than updating a single component. Same-type updates reuse the native view via `Update` instructions and never touch the recycle pool. Different-type swaps always go through Delete+Create, exercising the pool on every single toggle. Under rapid toggling the pool's in/out cycle races against the commit queue.

---

## The Misread Fix

The obvious instinct is to slow down state updates — throttle the progress callbacks, debounce the store writes. That reduces the crash rate but does not eliminate it. The underlying fragility remains: any commit overlap during a type-swap is potentially unsafe. One slow frame during a download can still trigger it.

A less obvious wrong fix: wrapping the ternary in a `key` prop.

```jsx
{isDownloading
  ? <ActivityIndicator key="spinner" color="#FFFFFF" size="small" />
  : <SearchIcon key="icon" color="#FFFFFF" size={24} />}
```

Explicit keys force React to always unmount the old component and mount the new one cleanly — but "cleanly" still means Delete+Create going through the recycle pool on every toggle. The crash rate can actually increase because React now bypasses its own reconciler heuristics that might have batched updates.

---

## The Right Fix: Remove the Swap Entirely

The root problem is not the frequency. It is the Delete+Create cycle itself for different native component types. The fix is to eliminate the cycle: keep both components mounted at all times and toggle visibility instead.

```jsx
{/* always mounted — no Delete/Create cycle on state change */}
<View
  style={[styles.searchIconLayer, isDownloading && styles.transparent]}
  collapsable={false}           {/* see RN Culprit #1 for why this matters */}
  pointerEvents="none"
  accessibilityElementsHidden={isDownloading}>
  <SearchIcon color="#FFFFFF" size={24} />
</View>

<OfflineDownloadIndicator
  visible={isDownloading}       {/* opacity toggle, not mount/unmount */}
  display={downloadDisplay}
/>
```

With both components always mounted, state changes produce only `Update` instructions — `updateProps`, `updateLayoutMetrics` — never `Delete` or `Create`. The recycle pool is never touched. The commit pipeline processes the update in a single pass regardless of how fast `isDownloading` toggles.

The `collapsable={false}` props are required on any absolute-positioned layout wrapper with no visual properties. That is the subject of [RN Culprit #2](/blog/rn-culprit-02-fabric-view-flattening) — the crash this fix accidentally introduced before `collapsable={false}` was added.

---

## The Principle

> **In Fabric, never alternate between two different native component types in the same slot under state that can change rapidly. The Delete+Create cycle through the view recycle pool is unsafe under commit queue pressure.**

Corollaries:

**① `{condition ? <NativeA /> : <NativeB />}` is a time bomb if `condition` updates frequently.** It works in testing (one or two slow transitions) and breaks in production (rapid updates driven by network I/O, sensor data, or animation timers).

**② Same-type swaps are safe; different-type swaps are not.** `{condition ? <Text style={a} /> : <Text style={b} />}` is always an `Update`. `{condition ? <ActivityIndicator /> : <SearchIcon />}` is always a Delete+Create. The type is what determines the instruction.

**③ The fix is architectural, not a throttle.** Throttling state updates papers over the crash; eliminating the type-swap prevents it. The two strategies have different failure modes: throttling fails when a frame drops; always-mount never fails at the Fabric level.

**④ Always-mount + opacity requires `collapsable={false}` on layout-only wrappers.** The two fixes are a pair — applying one without the other trades one crash for another. See [RN Culprit #2](/blog/rn-culprit-02-fabric-view-flattening).

---

## Recognising the Pattern in the Wild

Any ternary or `&&` short-circuit that produces a different native component type is a candidate:

```jsx
{/* risky — ActivityIndicator and Image are different native types */}
{isLoading ? <ActivityIndicator /> : <Image source={avatar} />}

{/* risky — TextInput and Text are different native types */}
{isEditing ? <TextInput value={name} /> : <Text>{name}</Text>}

{/* risky inside a list — FlatList and ScrollView are different types */}
{items.length > 0 ? <FlatList data={items} ... /> : <ScrollView>...</ScrollView>}
```

The tell is: does a state change cause Fabric to swap the native view type at that position? If yes, and if that state can change more than once per second, the recycle pool is under pressure and the crash is a question of when, not if.

---

## What's Next

The next entry in this series covers `setNativeProps` — a common escape hatch for direct native mutations that silently breaks in New Architecture because it bypasses the shadow tree entirely. Fabric overwrites your manual change on the next render with no warning and no error.

---

*Part of the **RN Culprit** series — post-mortems on React Native Fabric bugs where the crash stack tells you nothing and the real culprit is hiding in plain sight.*
