---
title: "The Architecture of an Infinite Canvas Web App"
date: "2026-05-01"
description: "A deep dive into the technical decisions, spatial data structures, and rendering optimizations required to build a buttery-smooth infinite canvas web application."
tags: ["engineering", "saas"]
readingTime: "12 min read"
---

# The Architecture of an Infinite Canvas Web App

When I first set out to build our infinite canvas collaboration tool, I thought it would be as simple as absolute positioning `div` elements on a very large HTML document. Oh, how naive I was. Today, infinite canvas apps like Figma, Miro, and our own tool set a completely different standard for web engineering. They push the boundaries of what browsers can handle, forcing us to step away from traditional DOM-based mental models and embrace game engine paradigms.

In this post, I want to take you deep into the trenches of building a highly performant infinite canvas. We'll cover everything from spatial indexing and view transformations to WebGL rendering and state synchronization.

## 1. Escaping the DOM: Why HTML isn't enough

The Document Object Model (DOM) is an incredible piece of technology optimized for documents and reflowable text. It is decidedly *not* optimized for rendering ten thousand independently moving, zooming, and overlapping graphical elements.

Early in our development, we tried mapping canvas nodes to DOM elements using CSS `transform`. It worked flawlessly up to about 500 nodes. But as users added more elements, panned rapidly, or zoomed out to see the whole board, the browser's layout engine choked. Garbage collection pauses became noticeable. Memory consumption skyrocketed.

We had to make the jump to `CanvasRenderingContext2D` and eventually WebGL. 

When you move to a `<canvas>` element, you are essentially building a bespoke rendering engine. The browser gives you a pixel buffer, and it's your job to draw every shape, every text node, every bounding box, and every selection outline at 60 (or 120) frames per second.

```typescript
// A highly simplified render loop
function render(context, scene, viewState) {
  // Clear the previous frame
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  
  // Apply the camera transformation
  context.save();
  context.translate(viewState.cameraX, viewState.cameraY);
  context.scale(viewState.zoom, viewState.zoom);
  
  // Find visible nodes (Crucial for performance!)
  const visibleNodes = scene.spatialIndex.search(viewState.viewportBoundingBox);
  
  // Draw from back to front (Painter's algorithm)
  for (const node of visibleNodes) {
    drawNode(context, node);
  }
  
  context.restore();
  
  // Schedule the next frame
  requestAnimationFrame(() => render(context, scene, viewState));
}
```

## 2. Spatial Indexing: The Secret Sauce

In the snippet above, the line `scene.spatialIndex.search()` is the heartbeat of our performance. If you iterate through an array of 50,000 shapes to check which ones intersect with the current viewport on every frame, your app will freeze.

You need a spatial data structure. We evaluated three main contenders:
1. **Grids (Spatial Hashing):** Dividing the canvas into a uniform grid of buckets.
2. **Quadtrees:** Recursively dividing the 2D space into four quadrants.
3. **R-Trees:** A tree data structure that groups nearby objects and represents them with their minimum bounding rectangles in the next higher level.

### Why We Chose R-Trees (Specifically RBush)
Grids fall apart when objects are sparsely distributed or highly clustered (which is common on infinite canvases—users create islands of dense content). Quadtrees are better, but they struggle when objects frequently straddle quadrant boundaries, requiring complex splitting logic or forcing items up the tree hierarchy.

R-Trees, and specifically Vladimir Agafonkin's `rbush` library, gave us the perfect balance of fast bulk-insertion, rapid bounding-box queries, and decent dynamic update performance.

```typescript
import RBush from 'rbush';

class CanvasSpatialIndex {
  private tree = new RBush<NodeBox>();
  private nodeMap = new Map<string, NodeBox>();

  insert(node: SceneNode) {
    const box = {
      minX: node.x,
      minY: node.y,
      maxX: node.x + node.width,
      maxY: node.y + node.height,
      id: node.id
    };
    this.tree.insert(box);
    this.nodeMap.set(node.id, box);
  }

  update(node: SceneNode) {
    const oldBox = this.nodeMap.get(node.id);
    if (oldBox) this.tree.remove(oldBox);
    this.insert(node);
  }

  search(viewport: BoundingBox): string[] {
    return this.tree.search(viewport).map(box => box.id);
  }
}
```
*Trade-off alert:* The cost of an R-Tree is update speed. When a user selects 1,000 objects and drags them across the screen, updating the R-Tree 60 times a second is too expensive. Our solution? We remove moving objects from the spatial index completely during the drag operation, storing them in a temporary "moving objects" array that is rendered unconditionally. When the `pointerup` event fires, we bulk-reinsert them into the R-Tree.

## 3. View Transformations and Coordinate Systems

One of the steepest learning curves in canvas engineering is managing coordinate systems. You constantly have to translate between three spaces:
1. **Screen/Client Space:** The physical pixels on the user's monitor (e.g., `e.clientX`, `e.clientY`).
2. **Viewport Space:** The coordinate system of the DOM `<canvas>` element itself.
3. **Scene/World Space:** The infinite mathematical coordinate system where the nodes actually live.

If a user clicks on the screen, which node did they click? You must transform the screen coordinates into world coordinates using the inverse of your camera matrix.

```typescript
function screenToWorld(clientX: number, clientY: number, camera: Camera): Point {
  // Subtract the DOM element's offset (if any)
  const rect = canvasElement.getBoundingClientRect();
  const viewportX = clientX - rect.left;
  const viewportY = clientY - rect.top;
  
  // Apply inverse scale and translation
  const worldX = (viewportX - camera.x) / camera.zoom;
  const worldY = (viewportY - camera.y) / camera.zoom;
  
  return { x: worldX, y: worldY };
}
```
Zooming is particularly tricky because users expect the zoom to pivot around their mouse cursor, not the top-left corner of the screen. Implementing "zoom to pointer" requires calculating the world coordinate of the pointer *before* the zoom, applying the new zoom factor, and then adjusting the camera translation so that the pointer remains over the exact same world coordinate.

## 4. State Synchronization and CRDTs

An infinite canvas is inherently a multiplayer environment. Two users might edit the same text node or drag the same sticky note simultaneously. 

Early on, we used Operational Transformation (OT), heavily relying on WebSockets and a central resolving server. But OT for highly nested graphical structures became a nightmare of edge cases. We transitioned to Conflict-free Replicated Data Types (CRDTs), specifically using Yjs.

CRDTs allowed us to treat the canvas state as a distributed database. The beauty of Yjs is its ability to handle deep object structures efficiently.

```typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const doc = new Y.Doc();
const provider = new WebsocketProvider('wss://sync.example.com', 'room-id', doc);

// The shared scene map
const yNodes = doc.getMap('nodes');

// When a local user moves a node
function handleLocalDrag(nodeId: string, newX: number, newY: number) {
  const yNode = yNodes.get(nodeId);
  if (yNode) {
    yNode.set('x', newX);
    yNode.set('y', newY);
  }
}

// Listening for remote changes
yNodes.observeDeep((events) => {
  events.forEach(event => {
    // Rebuild spatial index and trigger render
    syncToLocalState(event);
    requestRender();
  });
});
```

The challenge with CRDTs in a canvas app is memory overhead. CRDTs maintain a history of tombstones (deleted items) to resolve conflicts. For an infinite canvas that runs for days, memory can bloat. We had to implement aggressive garbage collection and epoch-based state snapshots, resetting the CRDT history every time all users disconnected from a room.

## 5. WebGL and the Future

While 2D Canvas is fast, it struggles with complex paths, rich gradients, and hundreds of overlapping alpha-blended images. 

We recently began porting our rendering pipeline to WebGL via a library called PixiJS (and evaluating WebGPU for the future). WebGL shifts the rendering burden to the GPU. We batch shapes together, compiling them into vertex and fragment shaders.

The migration forced us to completely rethink text rendering, which is notoriously difficult in WebGL (you either use signed distance fields (SDF) or render text to hidden 2D canvases and upload them as textures). 

## Conclusion

Building an infinite canvas is an exercise in pushing the browser to its absolute limits. It requires a deep understanding of data structures, linear algebra, and performance profiling. But the result—a boundless, smooth, collaborative space where users can think and create without constraints—is incredibly rewarding. 

If you are embarking on this journey, my biggest advice is: respect the geometry, choose your spatial index wisely, and treat every allocation inside your render loop as a mortal enemy.
