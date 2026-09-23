---
title: "Why I Stopped Using Redux for Complex UI State"
date: "2024-05-05"
description: "How migrating from Redux to atomic state management simplified our frontend architecture and eliminated unnecessary re-renders."
tags: ["engineering", "saas"]
readingTime: "8 min read"
---

# Why I Stopped Using Redux for Complex UI State

For years, Redux was the default choice for React state management. It provided a single source of truth, predictable state updates via reducers, and fantastic developer tools. But as our application—a heavily interactive, canvas-based design tool—grew, Redux became our biggest bottleneck. 

Here is why we tore out Redux and replaced it with a combination of Zustand and Jotai, and why you might want to consider doing the same.

## The Problem with the Global Store

Redux relies on a monolithic global state object. When you connect a component to the store, you use a selector to extract the slice of state you care about.

```javascript
const selectedNodeId = useSelector(state => state.canvas.selectedNodeId);
```

Under the hood, whenever *any* action is dispatched and the state object updates, Redux must run *all* selectors across the entire application to check if their specific slice changed. In a complex UI with hundreds of connected components (layers panel, property inspectors, canvas nodes), this selector evaluation becomes a severe performance tax.

We spent weeks optimizing `reselect` memoization, carefully structuring our store, and profiling renders. But we were fighting the architecture.

## Atomic State with Jotai

We realized that our UI state wasn't truly a monolith; it was a highly fragmented graph of independent values. 

Enter atomic state management (like Recoil or Jotai). Instead of a single store, you define "atoms" of state. Components subscribe directly to the atoms they need.

```javascript
import { atom, useAtom } from 'jotai';

export const selectedNodeIdAtom = atom(null);

function PropertiesPanel() {
  const [nodeId] = useAtom(selectedNodeIdAtom);
  // Only re-renders when selectedNodeIdAtom specifically changes
}
```

This dependency graph is resolved at the component level. If `nodeId` changes, only the components explicitly subscribed to that atom are notified. There is no global selector evaluation phase. Our rendering bottlenecks vanished overnight.

## Zustand for Application Logic

While Jotai is brilliant for UI state (like dropdowns, selection states, and transient input), we still needed something for our core business logic—handling websocket connections, syncing documents, and managing offline queues.

For this, we chose Zustand. It provides the predictability of Redux but without the boilerplate of actions, types, and reducers.

```javascript
import create from 'zustand';

const useDocumentStore = create((set, get) => ({
  document: null,
  isSyncing: false,
  updateNode: (id, payload) => {
    set(state => /* immutable update logic */);
    syncService.pushUpdate(id, payload);
  }
}));
```

## The Verdict

Redux taught the React ecosystem invaluable lessons about immutability and predictable state updates. But the tools have evolved. By separating transient UI state (Jotai) from core application state (Zustand), we cut our boilerplate in half, improved performance by orders of magnitude, and made our codebase significantly easier to onboard new engineers into.
