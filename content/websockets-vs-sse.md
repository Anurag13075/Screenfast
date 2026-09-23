---
title: "WebSockets vs. Server-Sent Events for Real-Time Canvas Collaboration"
date: "2026-06-11"
description: "An architectural comparison of WebSockets and Server-Sent Events for building real-time, multi-user canvas applications like Figma or Miro."
tags: ["engineering", "frontend"]
readingTime: "8 min read"
---

# WebSockets vs. Server-Sent Events for Real-Time Canvas Collaboration

Building a highly interactive, real-time collaborative canvas application—think Figma, Miro, or Excalidraw—is one of the most challenging engineering tasks in modern web development. When multiple users are interacting with a shared document simultaneously, the system must broadcast mouse movements, vector path updates, and object state changes with millisecond latency. A few dropped frames or out-of-order messages can lead to visual stuttering, race conditions, and corrupted document state.

At the heart of this challenge is the network layer. How do you push state changes from the server to the client efficiently? For years, the default answer has been WebSockets. However, Server-Sent Events (SSE) have emerged as a powerful, and sometimes superior, alternative depending on your specific architectural constraints.

In this deep dive, I want to explore the technical nuances, edge cases, and trade-offs between WebSockets and SSE in the context of a real-time collaborative canvas. 

## The Core Difference: Bi-directional vs. Uni-directional

Before diving into the architecture, we must define the fundamental difference between the protocols.

**WebSockets** provide a full-duplex, bi-directional communication channel over a single TCP connection. Once the initial HTTP handshake (the protocol upgrade) is completed, the client and server can push binary or text frames to each other asynchronously with incredibly low overhead.

**Server-Sent Events (SSE)**, on the other hand, are strictly uni-directional. They allow the server to push real-time updates to the client over a standard HTTP connection. If the client needs to send data back to the server (e.g., broadcasting a mouse movement), it must use standard HTTP POST requests, fetch, or XHR.

## Architecture Deep Dive: WebSockets

When you choose WebSockets for a canvas application, you are opting for a stateful architecture. 

### The Protocol Upgrade and Framing

A WebSocket connection begins with a standard HTTP GET request containing an `Upgrade: websocket` header. If the server agrees, it responds with a `101 Switching Protocols` status code. From that point on, the connection is no longer HTTP. 

Data is sent in "frames." A WebSocket frame has a tiny header (as small as 2 bytes), making it incredibly efficient for sending high-frequency, small payloads—exactly what you need when transmitting mouse coordinates (`x: 150, y: 300`) 60 times a second.

### Scaling WebSockets: The Hard Part

Scaling a WebSocket backend is notoriously difficult. Because connections are long-lived and stateful, traditional load balancers can struggle. You must use "sticky sessions" or configure your load balancer to hash based on the client IP, ensuring that a specific client always connects to the same backend node.

Furthermore, if User A is connected to Node 1, and User B is connected to Node 2, how do they collaborate on the same canvas? You need a message broker (a pub/sub system like Redis or NATS) to route messages between nodes.

Here is a conceptual Node.js/Redis implementation:

```javascript
const WebSocket = require('ws');
const Redis = require('ioredis');

const wss = new WebSocket.Server({ port: 8080 });
const redisPub = new Redis();
const redisSub = new Redis();

wss.on('connection', (ws, req) => {
  const canvasId = extractCanvasId(req.url);
  
  // Subscribe to Redis channel for this canvas
  redisSub.subscribe(`canvas:${canvasId}`);
  redisSub.on('message', (channel, message) => {
    if (channel === `canvas:${canvasId}`) {
      ws.send(message); // Forward to client
    }
  });

  ws.on('message', (data) => {
    // When client draws, publish to Redis so other nodes get it
    redisPub.publish(`canvas:${canvasId}`, data);
  });

  ws.on('close', () => {
    redisSub.unsubscribe(`canvas:${canvasId}`);
  });
});
```

### The Edge Case: Corporate Firewalls

A major edge case with WebSockets is corporate network infrastructure. Many strict enterprise firewalls and deep packet inspection (DPI) proxies aggressively drop non-HTTP traffic on port 80/443, or forcibly terminate long-lived connections that don't look like standard HTTP requests. If your target demographic is enterprise users, WebSockets might suffer from silent connection drops and require complex polling fallbacks (like Socket.io provides).

## Architecture Deep Dive: Server-Sent Events (SSE)

SSE takes a different approach. It leverages standard HTTP semantics. The client opens an `EventSource` connection, and the server responds with a `Content-Type: text/event-stream` header, keeping the connection open and pushing text data in a specific format.

### Multiplexing and HTTP/2

In the HTTP/1.1 era, SSE had a fatal flaw: browsers limited connections to a specific domain to 6. If a user opened 6 tabs of your application, the 7th tab would hang indefinitely.

HTTP/2 completely changed the game for SSE. HTTP/2 multiplexes multiple requests over a single TCP connection. This means you can have dozens of SSE streams open without hitting browser connection limits. Because SSE is just HTTP, it benefits natively from HTTP/2's binary framing and header compression (HPACK).

### The Canvas Use Case with SSE

To build a collaborative canvas with SSE, you split the architecture:
- **Downlink (Server to Client):** SSE stream delivering operations (e.g., `{"type": "draw", "path": [...]}`).
- **Uplink (Client to Server):** Standard HTTP `fetch` POST requests to send user actions.

You might think that sending a high volume of POST requests for mouse movements would destroy performance. However, with HTTP/2 multiplexing, the overhead of concurrent POST requests is surprisingly low. The TCP connection is already established, so you skip the TLS handshake latency.

### Built-in Resiliency

One of the greatest benefits of SSE is that resiliency is built into the browser API. If the connection drops, the `EventSource` object automatically attempts to reconnect. Even better, it sends a `Last-Event-ID` header upon reconnection, allowing the server to seamlessly replay any events the client missed while disconnected. With WebSockets, you have to write all this reconnection and state-sync logic manually.

```javascript
// Client-side SSE implementation
const source = new EventSource('/api/canvas/123/stream');

source.addEventListener('draw_stroke', (event) => {
  const data = JSON.parse(event.data);
  canvasRenderer.draw(data.path);
});

source.onopen = () => console.log('Connected!');
source.onerror = (err) => console.error('Connection lost, auto-reconnecting...', err);
```

### The Edge Case: Proxy Buffering

I learned about a severe SSE edge case the hard way. We deployed an SSE-based dashboard, and it worked perfectly locally. In production, updates were arriving in weird, delayed batches. 

It turned out our Nginx ingress controller had `proxy_buffering on;` configured by default. Nginx was buffering the SSE chunks until it hit a size threshold before flushing them to the client, completely destroying the "real-time" aspect. When using SSE, you must ensure all proxies and load balancers in your stack have buffering disabled for event streams.

## Trade-offs and the Final Verdict

So, which should you choose for a real-time canvas?

**Choose WebSockets if:**
- You need the absolute lowest possible latency (sub-10ms).
- You are sending massive volumes of small binary payloads (like raw ArrayBuffer pixel data).
- You need bi-directional streaming where the client is pushing as much data as it receives.

**Choose SSE if:**
- Your data naturally flows primarily from server to client, and client-to-server updates are slightly less frequent.
- You want to leverage standard HTTP infrastructure (caching, load balancing, API gateways) without special configurations.
- You want robust, native auto-reconnection and missed-message recovery out of the box.
- You are building an application where corporate firewall traversal is critical.

In 2026, with the ubiquity of HTTP/2 and HTTP/3, the gap between the two has narrowed significantly. For many teams, the operational simplicity of SSE makes it the superior choice, allowing them to focus on complex CRDT (Conflict-free Replicated Data Type) document resolution rather than debugging stateful WebSocket load balancers.