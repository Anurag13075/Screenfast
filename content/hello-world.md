---
title: "The Typography-First Approach to Web Design"
date: "2024-05-15"
description: "Why most websites get typography wrong, and how treating type as a structural element changes everything."
tags: ["design", "typography"]
readingTime: "5 min read"
---

When we look at the web today, we see an overreliance on utility classes to fix structural problems. 

We add margins, padding, and borders to create hierarchy. But what if we relied purely on the type scale?

## The Problem with Default Scales

Most frameworks provide a default type scale that is too linear. The jump from a paragraph to an `h3` isn't confident enough, resulting in layouts that feel mushy and undifferentiated.

```javascript
// This is how most people configure Tailwind
module.exports = {
  theme: {
    fontSize: {
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    }
  }
}
```

Instead, we need confident jumps in scale.

## Establishing a Rhythm

A strong layout uses type to create structural rhythm.

1. **Hierarchy**: Your headlines should be undeniably larger and heavier than your body text.
2. **Whitespace**: Give elements room to breathe.
3. **Contrast**: Pair a high-contrast serif with a neutral, geometric sans.

> "Good typography is like a good grid system. It should be felt, but not seen."

When we start with typography, the layout designs itself.
