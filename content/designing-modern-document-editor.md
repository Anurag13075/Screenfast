---
title: "Designing a Document Editor that Doesn't Feel Like Word"
date: "2026-05-20"
description: "How we built a block-based editor from scratch, handling contenteditable quirks, CRDTs for real-time collaboration, and custom rendering."
tags: ["engineering", "saas"]
readingTime: "8 min read"
---

# Designing a Document Editor that Doesn't Feel Like Word

Building a rich text editor is a rite of passage for software engineers. It usually starts with a naive optimism: "How hard can it be? We'll just use `contenteditable` and sprinkle some JavaScript on top." 

Three months later, you're knee-deep in browser inconsistencies, cursor positioning bugs, and race conditions that only happen when a user presses `Backspace` while holding `Shift` on Safari during a full moon.

When we set out to build the document editing experience for our SaaS platform in 2026, we had one explicit goal: **It cannot feel like Microsoft Word.** It needed to be fast, block-based, deeply collaborative, and fluid. We didn't want a static toolbar with 50 icons. We wanted a slash-command driven, Notion-esque experience, but with our own unique spin on structured data integration.

Here is the story of how we built it, the architectural dead-ends we went down, and the code that eventually made it work.

## The `contenteditable` Trap

Our first attempt used a single, giant `<div contenteditable="true">` for the entire document. This is how many legacy editors work. It’s easy to set up, and the browser handles text selection and typing for you. 

But it’s a trap.

The moment you want to introduce complex, non-text elements—like an interactive kanban board embedded in the document, or a dynamic chart—the single `contenteditable` model falls apart. The browser's native `Document.execCommand()` API (which is mercifully deprecated but still haunts our nightmares) generates horrific HTML. If you bold a word, you might get `<b>`, or `<strong>`, or `<span style="font-weight: bold;">` depending on the browser. 

We realized that to have total control, we needed to abandon the monolithic `contenteditable` and embrace a **block-based architecture**.

## The Block-Based Architecture

In our revised architecture, a document is not a string of HTML. It is an array of JSON objects, where each object represents a "block".

```typescript
type Block = {
  id: string;
  type: 'paragraph' | 'heading' | 'code' | 'image' | 'database';
  content: any; // Type depends on the block type
  metadata: Record<string, any>;
};

type Document = {
  id: string;
  title: string;
  blocks: Block[];
};
```

This seemingly simple change solved 80% of our rendering issues. Every block is a separate React component. Only the `paragraph` and `heading` blocks actually use `contenteditable`, and they only manage a single line or paragraph of text.

### The Cursor Conundrum

However, splitting the document into multiple independent React components introduced a massive new problem: **Cursor Management (Selection).**

If the user is typing in Block A, and presses the `Down Arrow`, the browser's native cursor doesn't know that Block B exists if they aren't in the same continuous contenteditable flow. We had to manually hijack keyboard events to move the cursor between discrete React components.

Here is a snippet of the custom selection manager we built:

```typescript
class SelectionManager {
  // Moves focus to the next block and places cursor at the beginning
  static focusNextBlock(currentBlockId: string) {
    const blocks = store.getState().document.blocks;
    const currentIndex = blocks.findIndex(b => b.id === currentBlockId);
    
    if (currentIndex >= 0 && currentIndex < blocks.length - 1) {
      const nextBlockId = blocks[currentIndex + 1].id;
      const nextElement = document.getElementById(`block-${nextBlockId}`);
      
      if (nextElement) {
        nextElement.focus();
        // Set cursor to start of text
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(nextElement);
        range.collapse(true); // true = start
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }
}
```

We had to write specific handlers for `ArrowUp`, `ArrowDown`, `Backspace` (at the beginning of a block to merge it with the previous one), and `Enter` (to split a block in two). It felt like we were rewriting the browser's rendering engine, which, in a way, we were.

## Real-time Collaboration with CRDTs

The requirement that truly pushed our architecture to the limit was real-time collaboration. We needed Google Docs-level multiplayer, where multiple people could edit the same block simultaneously without overwriting each other.

Initially, we tried Operational Transformation (OT). It's what Google Docs uses. But OT requires a central server to sequence operations, and the logic for resolving conflicts is notoriously complex.

We decided to use **Conflict-free Replicated Data Types (CRDTs)** instead. Specifically, we adopted Yjs.

CRDTs are magical. They allow you to treat local state as a distributed database. Every keystroke is an operation that is applied locally and then broadcasted to all other clients via WebRTC or WebSockets. The math behind CRDTs guarantees that regardless of the order in which these operations arrive, all clients will eventually converge on the exact same state.

Integrating Yjs with our block architecture required us to map our React state to Yjs types:

```typescript
import * as Y from 'yjs';

// The Yjs document
const ydoc = new Y.Doc();

// The shared array of blocks
const yBlocks = ydoc.getArray<Y.Map<any>>('blocks');

// When a user types, we don't update React state directly.
// We update the Yjs document, which triggers an observer, 
// which then updates React.
function onBlockTextChanged(blockId: string, newText: string) {
  const blockMap = findBlockMap(blockId);
  if (blockMap) {
    // This local change is automatically broadcasted by Yjs
    blockMap.set('content', newText); 
  }
}

yBlocks.observeDeep(() => {
  // Sync Yjs state back to Redux/React
  const newBlocks = yBlocks.toArray().map(map => map.toJSON());
  store.dispatch(updateBlocks(newBlocks));
});
```

The trade-off here is memory usage. CRDTs maintain a history of every operation (tombstones for deleted characters) to resolve conflicts. A long-lived document can grow massive in memory. We had to implement a snapshotting mechanism to periodically compress the CRDT history on the server and send optimized payloads to new clients joining the session.

## The Slash Command Extensibility

To make it "not feel like Word," we heavily invested in the slash command menu (`/`). Instead of looking up at a toolbar, users just type `/` and a contextual menu appears.

Architecturally, this was implemented as a pluggable registry. We wanted third-party developers (and our own team) to easily add new block types.

```typescript
interface BlockPlugin {
  name: string;
  icon: React.ReactNode;
  shortcut: string; // e.g., '/table'
  render: (props: BlockProps) => React.ReactNode;
  serialize: (data: any) => string; // For markdown export
}

const PluginRegistry = new Map<string, BlockPlugin>();

// Registering a new block type is trivial
PluginRegistry.set('code', {
  name: 'Code Snippet',
  shortcut: '/code',
  render: ({ content, onChange }) => (
    <CodeMirrorEditor value={content} onChange={onChange} />
  ),
  serialize: (data) => `\n\`\`\`\n${data.code}\n\`\`\`\n`
});
```

This decoupled design allowed us to ship features incredibly fast. Marketing needed a "Callout" block? A frontend engineer could write the plugin in 2 hours without touching the core editor engine.

## Conclusion

Building a modern document editor is a humbling experience. You realize how much heavy lifting browsers do for you, and how painful it is to take over those responsibilities. 

By avoiding the monolithic `contenteditable`, embracing a block-based JSON model, and betting hard on CRDTs for collaboration, we built an editor that feels snappy, modern, and extensible. It was a massive upfront engineering investment, but the resulting user experience—where formatting gets out of the way and users can just *flow*—was entirely worth it.