---
title: 'React State Fundamentals — Why These Still Bite You in Fabric'
series: 'ReactNativeCulprits 01'
description: 'The React state patterns from 2019 that remain directly relevant to understanding why Fabric crashes happen in 2024. Async batching, immutability, and re-render pressure are not new problems — Fabric just makes them lethal.'
pubDate: 'Dec 01 2019'
updatedDate: 'Jun 25 2026'
heroImage: '../../assets/react-dev-tips-hero.svg'
tags: ['React', 'React Native', 'Fabric', 'JavaScript', 'State Management', 'Best Practices']
tldr: "React Native Fabric's commit queue gets overwhelmed when components trigger rapid, un-batched state updates or derived state anti-patterns. This prologue explains why legacy React patterns cause 100%-reproducible Fabric crashes."
---

> *Written in 2019 as a general React guide. Updated in 2026 as the prologue to the **RN Culprit** series — because every Fabric-specific crash in [#2](/blog/rn-culprit-02-fabric-view-flattening) and [#3](/blog/rn-culprit-03-ternary-native-component-swap) has a root that traces back to one of the patterns below.*

The React Native Fabric crashes I document in this series are not random. They follow predictable patterns that become obvious once you understand how React's rendering model works at the fundamental level. Specifically:

- **Async state batching** → controls how many Fabric commits fire per user action
- **Functional updates** → determines whether rapid state changes collapse into one commit or many
- **Derived state anti-patterns** → create phantom re-renders that add commit queue pressure

If these feel familiar already, jump straight to [#2](/blog/rn-culprit-02-fabric-view-flattening). If not, this is where to start.

---

## Understanding React State Updates

State management forms the foundation of React applications, yet many developers encounter issues due to misunderstandings about how React handles state updates. This article covers essential lessons and patterns.

## Core Principle: State Updates Are Asynchronous

### The Problem

```javascript
// ❌ Common mistake - doesn't work as expected
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
    // count only increases by 1, not 2!
  };
}
```

### The Solution

React batches state updates for performance. Use functional updates:

```javascript
// ✅ Correct approach
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(prevCount => prevCount + 1);
    setCount(prevCount => prevCount + 1);
    // count increases by 2 as expected
  };
}
```

**Why it matters**: Functional updates ensure you're working with the most current state value, even when updates are batched.

> **Fabric connection**: In React Native Fabric, each un-batched `setState` call can generate a separate commit dispatched to the main thread. If a store emits state updates at high frequency (e.g., on every downloaded chunk, every BLE sensor packet, every scroll position change), the commit queue fills faster than the main thread drains it. This is the pressure that turns a latent Fabric bug into a 100%-reproducible crash. See [RN Culprit #3](/blog/rn-culprit-03-ternary-native-component-swap).

## Working with Objects and Arrays

### The Immutability Principle

React requires immutable state updates. Direct mutations won't trigger re-renders:

```javascript
// ❌ Wrong - mutating state directly
const [user, setUser] = useState({ name: 'John', age: 30 });

const updateAge = () => {
  user.age = 31; // Component won't re-render!
};

// ✅ Correct - creating new object
const updateAge = () => {
  setUser({ ...user, age: 31 });
};

// ✅ Better - using functional update
const updateAge = () => {
  setUser(prevUser => ({ ...prevUser, age: prevUser.age + 1 }));
};
```

### Nested Updates

```javascript
// ✅ Updating nested objects
setUser(prevUser => ({
  ...prevUser,
  preferences: {
    ...prevUser.preferences,
    theme: 'dark'
  }
}));

// ✅ Updating arrays
setItems(prevItems => [...prevItems, newItem]);
setItems(prevItems => prevItems.filter(item => item.id !== id));
```

## useEffect Dependencies: Getting It Right

### The Missing Dependency Problem

```javascript
// ❌ Bug - missing dependency
function Profile({ userId }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchUserData(userId);
  }, []); // userId changes but effect doesn't re-run!
}

// ✅ Correct - including all dependencies
useEffect(() => {
  fetchUserData(userId);
}, [userId]); // Effect runs when userId changes
```

### Rules to Follow

1. **Include all values** from component scope used in the effect
2. **Use exhaustive-deps ESLint rule** to catch missing dependencies
3. **Consider useCallback** to stabilize function dependencies

```javascript
const fetchData = useCallback(async () => {
  const result = await api.get(`/users/${userId}`);
  setData(result);
}, [userId]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

## Common Patterns and Anti-Patterns

### Pattern 1: Derived State

```javascript
// ❌ Storing computed values in state
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Computing on render instead
const fullName = `${firstName} ${lastName}`;
```

### Pattern 2: Initial State from Props

```javascript
// ❌ State doesn't update when props change
function Component({ initialValue }) {
  const [value, setValue] = useState(initialValue);
}

// ✅ Update when props change
function Component({ initialValue }) {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
}
```

### Pattern 3: Complex State Logic

When state logic becomes complex, consider useReducer:

```javascript
function complexReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return { ...state, count: state.count - 1 };
    case 'reset':
      return { ...state, count: 0 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(complexReducer, { count: 0 });
  
  return (
    <button onClick={() => dispatch({ type: 'increment' })}>
      Count: {state.count}
    </button>
  );
}
```

> **Fabric connection**: `useReducer` is particularly valuable in React Native because dispatching an action produces exactly one state object, which produces exactly one Fabric commit. Multiple `useState` setters called in sequence outside of React's event system (e.g., from a native BLE callback) can each produce an independent commit. Consolidating them into a single reducer dispatch or a single Zustand `set({...})` call is the correct way to keep commit pressure low.

## Performance Considerations

### Optimizing Re-renders

```javascript
// ❌ Causing unnecessary re-renders
function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ExpensiveChild data={expensiveComputation()} />
    </div>
  );
}

// ✅ Memoizing expensive computations
function Parent() {
  const [count, setCount] = useState(0);
  const memoizedData = useMemo(() => expensiveComputation(), [dependencies]);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ExpensiveChild data={memoizedData} />
    </div>
  );
}
```

## Debugging State Issues

1. **React DevTools**: Inspect component state and props
2. **Console logs**: Add strategic logging to track state changes
3. **Strict Mode**: Enable in development to catch issues early
4. **Test thoroughly**: Test async operations and edge cases

## Best Practices Summary

1. ✅ Always use functional updates when state depends on previous state
2. ✅ Never mutate state directly - create new objects/arrays
3. ✅ Include all dependencies in useEffect, useCallback, useMemo
4. ✅ Consider useReducer for complex state logic
5. ✅ Use useMemo and useCallback to optimize performance
6. ✅ Test state updates, especially async operations

---

## Where This Leads in Fabric

These patterns were written against the old React Native bridge architecture. In Fabric, the consequences are sharper:

- **Un-batched rapid state updates** no longer just feel laggy — they can corrupt Fabric's commit pipeline and crash the app. ([#3: Ternary Native Component Swap](/blog/rn-culprit-03-ternary-native-component-swap))
- **Derived state anti-patterns** that cause extra renders add commits to the main-thread queue, increasing the window for ordering bugs.
- **Missing useCallback stabilisation** on callbacks passed to native event handlers can cause the native layer to reference stale closures, making Fabric see a different component tree than JS expects.

The Fabric crashes documented in this series all have a JS-side contributing factor. Understanding the React fundamentals above is what makes the native crash reports interpretable.

**Next**: [RN Culprit #2 — The Fabric View-Flattening Crash](/blog/rn-culprit-02-fabric-view-flattening)

---

*Part of the **RN Culprit** series — post-mortems on React Native Fabric bugs where the crash stack tells you nothing and the real culprit is hiding in plain sight.*
