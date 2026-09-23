---
title: "Why I Stopped Using Redux for Complex UI State"
date: "2026-05-05"
description: "Redux is great, but when building high-frequency, complex UI applications like infinite canvases or game-like interfaces, the global immutable store becomes a bottleneck. Here is why we moved away from it."
tags: ["engineering", "saas"]
readingTime: "10 min read"
---

# Why I Stopped Using Redux for Complex UI State

For years, Redux was my default answer to state management in React. It provided a predictable state container, a crystal-clear debugging experience via the Redux DevTools, and a rigid, unyielding structure that kept spaghetti code at bay. If you asked me in 2020 how to build a complex web app, I would have handed you a Redux boilerplate without a second thought.

But in late 2024, while building the core engine for our infinite canvas application, Redux almost brought our product to its knees. 

This post isn't a "Redux is dead" hit piece. Redux is still a fantastic tool for managing coarse-grained, global application state (like user authentication, routing, and high-level preferences). However, for high-frequency, fine-grained, transient UI state—the kind you find in canvas apps, video editors, or complex drag-and-drop interfaces—a single, global immutable store is fundamentally the wrong architectural pattern.

Here is the story of how we realized Redux was failing us, and how we eventually solved our state management crisis using atomic state and signals.

## The Problem: High-Frequency Transient State

Imagine a user dragging a rectangle across a canvas. In a smooth application, this action fires `mousemove` events at 60 (or 120) times per second. 

If you store the rectangle's coordinates `(x, y)` in a Redux store, every single pixel of mouse movement triggers an action dispatch:

```javascript
// The Redux Way: Dispatching an action for every mouse move
function handleMouseMove(e) {
  dispatch({
    type: 'NODE_MOVED',
    payload: { id: selectedNodeId, x: e.clientX, y: e.clientY }
  });
}
```

What happens under the hood when this action is dispatched?
1. The action hits the root reducer.
2. The root reducer calls every slice reducer.
3. A new immutable state tree is allocated and created. (Even if only deeply nested `x` and `y` properties changed, all their parent objects must be shallow-copied to maintain immutability).
4. Redux notifies all connected React components that the state has updated.
5. React components map the state, run equality checks (`useSelector`), and decide if they need to re-render.

Doing this 60 times a second for a large state tree creates massive garbage collection pressure and eats up the CPU budget you desperately need for rendering. We started noticing severe micro-stutters. The React Profiler looked like a horror movie—a massive wall of red cascading updates.

## Attempt 1: Throttling and Debouncing

Our first instinct was to fight the symptoms. We throttled the Redux dispatches so they only happened every 16ms (roughly one frame). This barely helped. 

Next, we tried debouncing the store updates entirely. We kept the drag state in a local React `useState` while the drag was happening, and only dispatched the final `NODE_MOVED` action to Redux on `mouseup`.

```javascript
// A hacky compromise
const [localPos, setLocalPos] = useState({ x: initialX, y: initialY });

function handleMouseMove(e) {
  // Update local state for immediate visual feedback (fast)
  setLocalPos({ x: e.clientX, y: e.clientY });
}

function handleMouseUp() {
  // Sync back to Redux only at the end (slow, but infrequent)
  dispatch({ type: 'NODE_MOVED', payload: { id, ...localPos } });
}
```

This solved the performance issue for a single dragging element, but it destroyed the architectural purity we adopted Redux for in the first place. 

What if another component needed to know the node's position *while* it was dragging? (For example, aligning snapping guides or updating a real-time coordinates panel). Because the state was temporarily hidden inside a local React component, those other components were completely blind to it. We ended up passing props through five layers of components just to share this "local" state. It was a mess.

## The Core Mismatch: Top-Down vs. Bottom-Up

Redux enforces a **top-down** data flow. State lives at the very top of the tree, and changes trickle down through selectors. 

But highly interactive UIs often require **bottom-up** or **peer-to-peer** data flows. A node on a canvas doesn't care about the state of the entire document; it just cares about its own `x` and `y`. A properties panel just cares about the `color` of the currently selected node. 

Forcing all these micro-updates to travel all the way up to the global store and back down again is like routing all local city traffic through the national highway system. 

## The Solution: Atomic State (Jotai) and Signals

We realized we needed a state management system that allowed for fine-grained subscriptions. When Node A's X-coordinate changes, only Node A's React component should re-render. The root component, the sidebar, and Node B shouldn't even know the change occurred.

We migrated to **Jotai**, an atomic state management library (similar to Recoil). 

In Jotai, state is broken down into tiny, independent pieces called "atoms". 

```javascript
import { atom, useAtom } from 'jotai';

// Instead of a giant node tree, each property can be its own atom
const nodeXAtom = atom(100);
const nodeYAtom = atom(200);

function CanvasNode() {
  // This component ONLY subscribes to nodeX and nodeY.
  // It will not re-render if nodeColor changes!
  const [x, setX] = useAtom(nodeXAtom);
  const [y, setY] = useAtom(nodeYAtom);
  
  return (
    <div style={{ transform: `translate(${x}px, ${y}px)` }} />
  );
}
```

This immediately solved our performance issues. Because atoms exist outside the React tree but components can subscribe to them directly, we had the best of both worlds: global accessibility without global re-renders. 

### Enter Signals

As our requirements grew more extreme (moving to WebGL), even React's render cycle became a bottleneck. We started bypassing React entirely for certain high-frequency updates, adopting the **Signals** pattern (popularized by SolidJS and Preact).

Signals allow you to bind a reactive state directly to a DOM node or a canvas render function, completely sidestepping React's Virtual DOM diffing.

```javascript
import { signal, effect } from '@preact/signals-react';

const nodeX = signal(100);

// In our WebGL render loop, we just read the signal directly.
// No React components are involved in this hot path.
function renderLoop() {
  mesh.position.x = nodeX.value;
  renderer.render(scene, camera);
  requestAnimationFrame(renderLoop);
}

// When the mouse moves, we update the signal.
// This is practically zero-cost.
function handleMouseMove(e) {
  nodeX.value = e.clientX; 
}
```

## The Mental Shift

Moving away from Redux required a significant shift in how our team thought about state. We had to categorize our state into three distinct buckets:

1. **Global/Persistent State:** (User profile, billing status, document metadata). This still lives in a traditional store (we use Zustand now, for its simplicity).
2. **Transient UI State:** (Selection state, drag coordinates, hover states, scroll positions). This lives in Jotai atoms or local component state. It is highly volatile and updates 60fps.
3. **Derived/Computed State:** (Bounding boxes of groups, collision detection results). We rely heavily on memoized selectors and derived atoms to compute these only when their specific dependencies change.

## Conclusion

Redux is an architectural marvel for the problems it was designed to solve. But the web has evolved. We are now building applications in the browser that rival desktop software in complexity and interactivity. 

If you are building an application where the user is constantly manipulating the UI, dragging elements, scrubbing timelines, or painting on a canvas, do not default to a single global immutable store. Look into atomic state management (Jotai, Recoil) or Signals. Your CPU (and your users) will thank you.
