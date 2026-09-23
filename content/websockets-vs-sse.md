---
title: "WebSockets vs. Server-Sent Events for Real-Time Canvas Collaboration"
date: "2024-06-11"
description: "Evaluating real-time protocols for collaborative applications, focusing on latency, throughput, and connection stability."
tags: ["engineering", "frontend"]
readingTime: "8 min read"
---

# WebSockets vs. Server-Sent Events for Real-Time Canvas Collaboration

When building a real-time collaborative canvas (like Figma or Miro), you need a system capable of broadcasting high-frequency mouse movements and drawing operations to dozens of concurrent users. The two primary technologies for web-based real-time communication are WebSockets and Server-Sent Events (SSE). How do you choose?

## WebSockets: The Bi-Directional Standard

WebSockets provide a full-duplex, persistent connection over a single TCP socket. After the initial HTTP handshake, the connection stays open, allowing both the client and server to push messages at any time.

### Pros for Canvas Apps
- **Low Latency:** Crucial for transmitting high-frequency events like 60fps cursor tracking.
- **Bi-directional:** The client pushes draw commands to the server over the same socket the server uses to broadcast updates.

## Server-Sent Events (SSE): The Uni-Directional Workhorse

SSE is a standard that allows the server to push real-time updates to the client over standard HTTP. It is strictly uni-directional: Server to Client.

### How it Works

The client opens an `EventSource` connection. The server streams text data down this open HTTP connection.

```javascript
const eventSource = new EventSource('/api/canvas/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateCanvasState(data);
};
```

## The Verdict for Collaborative Canvases

For a highly interactive, 60fps collaborative canvas, **WebSockets are almost always the right choice.** The requirement for low-latency, high-throughput bi-directional data flow maps perfectly to WebSocket capabilities.