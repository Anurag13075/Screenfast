---
title: "Why Dark Mode is Harder Than Inverting Colors"
date: "2024-07-18"
description: "The technical and perceptual challenges of designing true dark themes, from elevation to contrast."
tags: ["design", "ux"]
readingTime: "8 min read"
---

# Why Dark Mode is Harder Than Inverting Colors

The naive approach to dark mode is simple: swap the white background for black, and the black text for white. Any developer who has tried this quickly realizes it looks terrible. Pure black (`#000000`) with pure white (`#FFFFFF`) text causes eye strain and halation (where the white text seems to bleed into the dark background). 

Furthermore, simply inverting colors destroys depth. In light mode, we use shadows to indicate elevation. In dark mode, shadows disappear into the background.

## Elevation through Illumination

In a dark UI, you cannot rely on drop shadows to show that a modal is sitting on top of the background. Instead, you must use illumination. As an element moves closer to the user (higher elevation), its background color should become lighter.

```css
/* Dark Mode Elevation System */
:root {
  --bg-base: #121212;
  --bg-surface-1: #1E1E1E; /* Cards, basic elements */
  --bg-surface-2: #232323; /* Modals */
  --bg-surface-3: #2C2C2C; /* Tooltips, Popovers */
}

.modal {
  background-color: var(--bg-surface-2);
  /* Subdued shadow for subtle depth, but mostly relying on bg color */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5); 
}
```

## Conclusion
Dark mode requires a dedicated design system. It is not a CSS trick or a simple filter. It is a fundamental rethinking of how your interface handles light, depth, and contrast.