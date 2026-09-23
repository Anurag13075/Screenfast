---
title: "Handling Optimistic UI Updates in a Local-First World"
date: "2024-06-09"
description: "How to build buttery-smooth local-first applications using optimistic updates and robust conflict resolution."
tags: ["engineering", "frontend"]
readingTime: "8 min read"
---

# Handling Optimistic UI Updates in a Local-First World

Users expect immediate feedback. When a user clicks "Like," they expect the heart to turn red instantly, regardless of their network latency. This pattern, known as Optimistic UI, is the cornerstone of modern web applications. But as we move towards local-first architectures, optimistic updates become more complex than simple state toggles.

## The Anatomy of an Optimistic Update

At its core, an optimistic update involves three steps:
1.  **Mutate locally:** Immediately update the UI state as if the server request succeeded.
2.  **Fire request:** Send the actual mutation to the server.
3.  **Reconcile:** If the request fails, roll back the local state. If it succeeds, sync any new server-generated data (like IDs or timestamps).

### Implementation with React Query

Libraries like TanStack Query make this pattern manageable through mutation lifecycles.

```javascript
const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => api.toggleLike(postId),
    onMutate: async (postId) => {
      // Cancel any outgoing refetches to avoid race conditions
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update to the new value
      queryClient.setQueryData(['posts'], (old) => 
        old.map(post => post.id === postId 
          ? { ...post, liked: !post.liked, likesCount: post.liked ? post.likesCount - 1 : post.likesCount + 1 }
          : post
        )
      );

      // Return context containing previous state
      return { previousPosts };
    },
    // If mutation fails, use context to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['posts'], context.previousPosts);
    },
    // Always refetch after error or success to ensure sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
```

## Conclusion
Optimistic UI bridges the gap between network latency and user expectations. Whether implemented at the caching layer with React Query or baked into a local-first database architecture, prioritizing immediate UI feedback is non-negotiable for building high-quality software.