---
title: "Designing a Document Editor that Doesn't Feel Like Word"
date: "2024-05-20"
description: "Overcoming contenteditable quirks to build a block-based editor optimized for modern web workflows."
tags: ["engineering", "saas"]
readingTime: "8 min read"
---

# Designing a Document Editor that Doesn't Feel Like Word

For over a decade, building a rich text editor on the web meant wrestling with `contenteditable`—a browser API notorious for inconsistent behavior, unpredictable HTML output, and cursor jumping. 

When we set out to build our document editor, we knew we couldn't rely on the legacy paradigms of Microsoft Word or basic WYSIWYG wrappers. We needed a block-based editor, similar to Notion, that treats the document as a structured tree of data rather than a blob of HTML.

## Escaping the contenteditable Trap

If you rely on raw `contenteditable`, your data model is tied to the DOM. If a user pastes text from a website, the browser attempts to retain the inline styles, resulting in a nested nightmare of `<span>` tags.

We opted for a block-level architecture using frameworks like ProseMirror / TipTap. In this model, the editor's state is an immutable JSON tree. The DOM is merely a reflection of this state.

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Project Spec" }]
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "This is a block." }]
    }
  ]
}
```

By decoupling the data from the DOM, we achieved deterministic rendering. When a user pastes content, our parser intercepts the HTML, strips out malicious or unsupported tags, and translates it cleanly into our JSON schema before rendering.

## The Block Abstraction

A document is no longer a single canvas; it is a stack of independent blocks. This unlocks immense power:

1. **Drag and Drop:** Because each block is an isolated React component, we can wrap them in dnd contexts to rearrange intuitively.
2. **Slash Commands:** Typing `/` opens a menu. We dynamically swap a `paragraph` for a `code_block` without hacking the DOM.
3. **Collaborative Editing:** Syncing atomic changes to a JSON tree using CRDTs (like Yjs) is incredibly reliable.

## Conclusion

Building a modern document editor requires abandoning the idea of editing text, and embracing editing structured data.