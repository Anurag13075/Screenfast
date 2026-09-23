---
title: "Why Your React App is Slow (And How to Actually Fix It)"
date: "2024-06-07"
description: "A deep dive into React rendering bottlenecks, context api pitfalls, and actionable strategies for high-performance applications."
tags: ["engineering", "frontend"]
readingTime: "8 min read"
---

# Why Your React App is Slow (And How to Actually Fix It)

React is fast by default, but complex applications often suffer from performance degradation as they scale. If your application feels sluggish, the culprit usually boils down to wasted renders, large bundle sizes, or main thread blocking. In this post, we'll dive into the technical depths of React's reconciliation process and explore how to fix the real bottlenecks.

## The Reconciliation Bottleneck

When state changes, React builds a new virtual DOM and compares it against the previous one. While this process is highly optimized, doing it unnecessarily across large component trees is expensive. 

### The Problem with Context

React Context is excellent for dependency injection but terrible for high-frequency state updates. When a context provider's value changes, *every* component consuming that context re-renders, regardless of whether it uses the specific part of the state that changed.

```javascript
// Anti-pattern: High-frequency state in a global context
const AppStateContext = createContext();

function AppProvider({ children }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [user, setUser] = useState(null);

  // Any mouse movement will re-render components that only care about the user!
  return (
    <AppStateContext.Provider value={{ mousePosition, user }}>
      {children}
    </AppStateContext.Provider>
  );
}
```

### The Fix: Context Splitting and Selectors

Split your context by update frequency. Alternatively, use state management libraries like Zustand or Redux Toolkit that support selectors, allowing components to subscribe only to the precise slices of state they need.

## Memoization: You're Probably Doing It Wrong

`React.memo`, `useMemo`, and `useCallback` are powerful tools, but they carry an inherent cost: the cost of the comparison function and memory overhead.

### Referential Equality Traps

A common mistake is wrapping a component in `React.memo` but passing inline objects or functions as props. This defeats the memoization because the references change on every parent render.

```javascript
// Defeating React.memo
const OptimizedChild = React.memo(Child);

function Parent() {
  // {} creates a new reference every render!
  return <OptimizedChild config={{ showTitle: true }} />; 
}
```

**How to fix it:**
Always extract static configurations outside the component or wrap dynamic objects in `useMemo`. 

## Main Thread Blocking and Concurrent React

If your app feels janky during heavy computations, you are blocking the main thread. React 18 introduced Concurrent Mode, which allows rendering to be interruptible. 

Use `useTransition` for expensive state updates that don't need immediate visual feedback. This keeps the UI responsive for high-priority updates like user typing.

```javascript
const [isPending, startTransition] = useTransition();

function handleSearch(query) {
  setInputValue(query); // High priority
  startTransition(() => {
    setSearchQuery(query); // Low priority, interruptible
  });
}
```

## Conclusion
Performance optimization isn't about sprinkling `useMemo` everywhere. It's about understanding how your component tree updates, minimizing re-renders through localized state, and utilizing the right architectural patterns. Profile your app using the React DevTools Profiler, identify the longest render paths, and tackle the root causes directly.
