---
title: "The Architecture of an Infinite Canvas Web App"
date: "2024-05-01"
description: "Building a performant infinite canvas requires rethinking DOM rendering and embracing WebGL or Canvas APIs with spatial hashing."
tags: ["engineering", "saas"]
readingTime: "8 min read"
---

# The Architecture of an Infinite Canvas Web App

When building a visual collaboration tool, the infinite canvas is the holy grail. It feels magical to users—a boundless space where ideas can flow without the constraints of pagination or screen dimensions. However, underneath that magic lies a complex web of rendering pipelines, coordinate system math, and memory management.

In this post, we’ll tear down the architecture of a production-grade infinite canvas, exploring why traditional DOM manipulation falls short and how WebGL and spatial hashing solve the performance bottleneck.

## The DOM Bottleneck

Our first prototype used the standard DOM. Each sticky note, drawing stroke, and image was an absolute-positioned `div` or `svg` element inside a massive, draggable container. 

```javascript
// The naive approach
function Canvas() {
  const [elements, setElements] = useState([]);
  
  return (
    <div className="canvas-container" style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})` }}>
      {elements.map(el => <Node key={el.id} data={el} />)}
    </div>
  );
}
```

This works perfectly up to about 500 elements. Beyond that, the browser's layout engine starts gasping for air. Even with CSS containment (`contain: strict`), updating the transform of the wrapper forces the browser to recalculate styles and occasionally repaint, leading to dropped frames during panning and zooming.

## Migrating to the Canvas API

To achieve a buttery-smooth 60fps, we migrated to the `<canvas>` element (and eventually WebGL via PixiJS). The paradigm shifts entirely: instead of telling the browser *what* to render, you tell it *how* to render every single pixel.

### The Camera Coordinate System

The most critical concept in a canvas architecture is separating the **World Space** from the **Screen Space**. 

- **World Space**: The infinite grid where your objects actually live. A rectangle might be at `x: 10000, y: -50000`.
- **Screen Space**: The physical pixels on the user's monitor (e.g., `1920x1080`).

We need a Camera object to bridge these two spaces:

```typescript
class Camera {
  x: number = 0;
  y: number = 0;
  zoom: number = 1;

  worldToScreen(worldPoint: Point): Point {
    return {
      x: (worldPoint.x - this.x) * this.zoom,
      y: (worldPoint.y - this.y) * this.zoom
    };
  }

  screenToWorld(screenPoint: Point): Point {
    return {
      x: screenPoint.x / this.zoom + this.x,
      y: screenPoint.y / this.zoom + this.y
    };
  }
}
```

Every mouse event (Screen Space) must be translated into World Space before interacting with objects. Every object's World Space coordinates must be translated into Screen Space during the render loop.

## Spatial Hashing for Culling

Rendering 10,000 objects every frame will stall even a fast GPU if you're not careful. We must implement **Frustum Culling**—only drawing what is currently visible on the screen.

But iterating through 10,000 objects to check if they intersect with the camera viewport is an `O(n)` operation every frame. Enter **Spatial Hashing**.

We divide the infinite world into chunks (e.g., 1000x1000 pixels). When an object moves, we update which chunk it belongs to. During rendering, the camera calculates which chunks are currently visible and only iterates over the objects within those chunks.

```typescript
class SpatialHash {
  grid: Map<string, Set<CanvasObject>> = new Map();
  chunkSize = 1000;

  getHash(x: number, y: number): string {
    const cx = Math.floor(x / this.chunkSize);
    const cy = Math.floor(y / this.chunkSize);
    return `${cx},${cy}`;
  }
  
  // ... methods to insert, update, and query objects
}
```

## Conclusion

Building an infinite canvas is less about web development and more about game engine development. By abandoning the DOM, mastering coordinate spaces, and implementing spatial indexing, you can build an application that scales to thousands of objects without breaking a sweat.
