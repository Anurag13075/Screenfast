---
title: "Handling Optimistic UI Updates in a Local-First World"
date: "2026-06-09"
description: "A comprehensive guide to building resilient, local-first applications using Optimistic UI, CRDTs, and advanced synchronization strategies."
tags: ["engineering", "frontend"]
readingTime: "13 min read"
---

# Handling Optimistic UI Updates in a Local-First World

The traditional client-server request/response cycle is dying. For years, web applications have operated on a simple paradigm: user takes an action, client shows a spinner, client sends request to server, server processes and responds, client updates UI. 

In a world of spotty 5G connections, subway commutes, and users expecting desktop-caliber performance in the browser, this latency is no longer acceptable. The industry is moving rapidly toward a "local-first" architecture. In this paradigm, the local database (IndexedDB, OPFS) is the primary source of truth for the UI, and background synchronization handles eventual consistency with the cloud.

Central to this architecture is the concept of Optimistic UI. But optimistic updates in a truly local-first, collaborative environment are vastly more complex than just temporarily updating React state. In this post, we'll explore the edge cases, race conditions, and architectural patterns required to build robust local-first applications.

## What is Optimistic UI?

At its core, Optimistic UI means updating the user interface immediately after a user interaction, assuming that the underlying backend request will succeed. 

If I click "Like" on a post, the heart turns red instantly. In the background, a network request fires. If it succeeds, great. If it fails, the UI must gracefully roll back to its previous state and inform the user.

### The Naive Implementation (And Why It Fails)

In a simple React application using a data fetching library like TanStack Query or SWR, an optimistic update looks something like this:

```tsx
// A standard, somewhat naive optimistic update
const mutation = useMutation({
  mutationFn: updateTodoItem,
  onMutate: async (newTodo) => {
    // Cancel any outgoing refetches so they don't overwrite our optimistic update
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // Snapshot the previous value
    const previousTodos = queryClient.getQueryData(['todos']);

    // Optimistically update to the new value
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo]);

    // Return a context object with the snapshotted value
    return { previousTodos };
  },
  onError: (err, newTodo, context) => {
    // If the mutation fails, use the context returned from onMutate to roll back
    queryClient.setQueryData(['todos'], context.previousTodos);
  },
  onSettled: () => {
    // Always refetch after error or success to ensure server sync
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

This works perfectly well for simple CRUD apps over a stable connection. But it completely breaks down in a local-first, offline-capable, or highly collaborative environment.

## The Challenges of Local-First

When you build a local-first application, the network is not just slow; it's considered unreliable and optional. Users might go offline for hours, make dozens of mutations, and then reconnect. 

This introduces immense complexity:

1.  **Queueing and Ordering:** If a user creates a task, updates it, and deletes it while offline, those mutations must be replayed to the server in exactly that order.
2.  **Conflict Resolution:** What happens if User A updates the title of a task offline, while User B updates the description of the same task online? 
3.  **Client-Side ID Generation:** If the server generates IDs, an offline client cannot create new entities easily.
4.  **Complex Rollbacks:** Reverting a single "Like" is easy. Reverting a deeply nested series of relational changes made over two hours of offline work is mathematically terrifying.

## Conflict-Free Replicated Data Types (CRDTs)

To solve these problems in 2026, we don't manually manage mutation queues anymore. We use CRDTs (Conflict-Free Replicated Data Types). Libraries like Yjs and Automerge have become the foundational layer of modern web apps.

A CRDT is a data structure that can be replicated across multiple computers in a network, updated independently and concurrently without coordination between the replicas, and is mathematically guaranteed to eventually converge to the same state.

Instead of thinking about "requests" and "responses," you think about "documents." 

1. User modifies the local CRDT document in memory.
2. The UI reacts instantly (Optimistic UI is built-in by default!).
3. The local changes are persisted to IndexedDB.
4. The CRDT engine calculates a binary patch of the changes.
5. When the network is available, the patch is synced to the server and broadcast to other clients via WebSockets or WebRTC.

### How CRDTs Solve Optimistic UI Edge Cases

Because CRDTs handle merging deterministically, you don't need manual rollback logic. 

Imagine User A and User B are editing a text field offline. 
User A changes "Hello" to "Hello World".
User B changes "Hello" to "Hello Friend".

When they reconnect, a traditional database would have a write-conflict, usually resolving with "last write wins" (LWW), resulting in data loss for one user. 

A text-based CRDT will merge the intent at the character level, perhaps resulting in "Hello World Friend" or similar. While the semantic result might need human tweaking, the mathematical convergence is guaranteed, and neither user's work is entirely lost. For JSON-like objects, CRDTs allow merging changes to different properties of the same object perfectly.

## Architecture of a Local-First App

Building this requires a layered architecture:

1.  **The View Layer (React/Vue/Svelte):** Binds strictly to local state. It never waits for a network request to render.
2.  **The Local Storage Engine:** An indexedDB wrapper (like RxDB or an Automerge document store) that persists the CRDTs.
3.  **The Sync Engine:** A background web worker responsible for managing WebSocket connections, detecting online/offline status, and transmitting binary patches to the server.
4.  **The Server:** Often just a dumb relay. It receives patches, stores them, and forwards them to connected clients. The heavy lifting of conflict resolution is done on the clients.

### Handling IDs Locally

In a traditional app, you send a POST request, and the database returns the incrementing integer ID. In local-first, the client must generate the ID before the server ever sees it. 

We must use UUIDs or, preferably, sortable IDs like ULIDs or CUIDs. 

```javascript
import { ulid } from 'ulid';

// Generating an ID locally allows us to immediately construct the object
// and relate it to other entities before a server sync occurs.
const newTask = {
  id: ulid(),
  title: "Buy milk",
  completed: false,
  createdAt: Date.now()
};

// Insert into local CRDT store. UI updates instantly.
doc.getArray('tasks').push([newTask]); 
```

## When Optimistic UI is Dangerous

Despite its benefits, you should not be optimistic about everything. 

**Rule of Thumb:** Be optimistic about state changes, be pessimistic about irreversible actions.

*   **Optimistic:** Liking a post, updating a title, rearranging a list, adding an item to a cart.
*   **Pessimistic:** Processing a payment, deleting an account, granting administrative permissions.

If a payment fails, rolling back the UI to say "Just kidding, you didn't buy that" is a terrible user experience and a customer service nightmare. For these actions, explicit loading states are absolutely necessary.

## A Personal Anecdote: The Ghost Dependencies

A few years ago, I was building an offline-capable inspection app for construction workers. They would go into basements with no cell service, create a new "Site," and then create multiple "Issues" belonging to that Site. 

In our first naive implementation, we didn't use CRDTs. We just queued network requests. When the worker got back to connectivity, the app would replay the queue. 

But the queue fired simultaneously. The "Create Issue" requests were hitting the server *before* the "Create Site" request finished, meaning the server rejected the issues because the foreign key (Site ID) didn't exist yet. We had ghost dependencies.

We spent weeks writing complex queue management logic to track dependencies between pending requests. It was a nightmare. When we eventually threw it out and rewrote the app using a local-first CRDT architecture (Automerge), all those problems vanished. The local database just worked, and the background sync handled the topological ordering of patches automatically. 

## Conclusion

Optimistic UI is no longer a "nice to have" feature; it is the baseline expectation for modern web applications. However, as applications become more complex and collaborative, simple `onMutate` rollbacks are insufficient.

By embracing a local-first architecture powered by CRDTs, you fundamentally shift the complexity away from manual state orchestration and network race conditions. The local database becomes the source of truth, the UI is instantly responsive by default, and synchronization becomes a background concern. The future of the web isn't faster servers; it's smarter clients.