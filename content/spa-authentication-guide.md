---
title: "The Right Way to Handle Authentication in Modern SPA Frameworks"
date: "2026-06-10"
description: "A deep dive into securing Single Page Applications, exploring the evolution from localStorage JWTs to the Backend-For-Frontend (BFF) pattern."
tags: ["engineering", "frontend"]
readingTime: "8 min read"
---

# The Right Way to Handle Authentication in Modern SPA Frameworks

Authentication in Single Page Applications (SPAs) has always been a contentious topic. Over the last decade, we've seen best practices evolve rapidly as browsers introduce new security mechanisms and attackers find new vulnerabilities. In 2026, building a secure, scalable authentication system for a React, Vue, or Svelte application requires a deep understanding of distributed systems, browser security models, and the intricate dance between cross-origin resource sharing (CORS) and cookies. 

In this comprehensive guide, I want to break down the architectural choices available to us today, why older methods are now considered dangerous, and what you should be doing instead. We will cover the pitfalls of `localStorage`, the nuances of `HttpOnly` cookies, and the gold standard for enterprise applications: the Backend-For-Frontend (BFF) pattern.

## The Dark Ages: JWTs in Local Storage

When JWTs (JSON Web Tokens) first gained immense popularity around 2015, the prevailing advice was beautifully simple, yet fatally flawed: "Just get the token from your login endpoint and stick it in `localStorage`." 

The architecture looked like this:
1. User submits credentials.
2. API returns a signed JWT.
3. SPA saves it: `localStorage.setItem('token', jwt)`.
4. SPA attaches it to every subsequent request: `Authorization: Bearer <token>`.

### The Problem: Cross-Site Scripting (XSS)

The Achilles heel of this approach is XSS. `localStorage` is accessible via JavaScript on the same origin. If an attacker can execute arbitrary JavaScript on your domain (perhaps through a compromised third-party analytics script, a vulnerable npm dependency, or unescaped user input), they can simply run `localStorage.getItem('token')` and exfiltrate your user's credentials to their own server.

I learned this the hard way back in 2021. We were building a B2B SaaS platform and pulled in a seemingly harmless open-source rich text editor. Unbeknownst to us, a malicious actor had compromised the package maintainer's account and published a patch that quietly skimmed `localStorage` for keys matching `/token|auth/i` and beaconed them out. We had a minor incident, but it taught me a valuable lesson: **Never store sensitive credentials where JavaScript can reach them.**

## The Middle Ground: HttpOnly Cookies

Once the community realized that `localStorage` was a minefield, the pendulum swung back towards an older, battle-tested technology: Cookies. But not just any cookies—`HttpOnly` cookies.

When a cookie is flagged as `HttpOnly`, the browser prevents client-side scripts from accessing it. `document.cookie` will not reveal its contents. This neutralizes the XSS threat regarding token exfiltration.

### The Architecture

1. User submits credentials.
2. API validates and sets a `Set-Cookie` header in the response: 
   `Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
3. The browser automatically attaches this cookie to subsequent requests to the same origin.

### The New Problem: Cross-Site Request Forgery (CSRF)

By moving to cookies, we solved XSS (token theft), but we reintroduced CSRF. Since the browser automatically attaches cookies to requests destined for the cookie's origin, an attacker could trick an authenticated user into visiting a malicious site, which then submits a hidden form to your API.

To mitigate this, we rely on the `SameSite` attribute. 
- `SameSite=Lax`: Cookies are not sent on cross-site POST requests. (Default in modern browsers).
- `SameSite=Strict`: Cookies are only sent for first-party context. 

While `SameSite` provides excellent defense-in-depth, relying on it solely can be problematic if your SPA and API live on different domains (e.g., `app.example.com` and `api.example.com`). This cross-origin setup often forces developers into complex CORS configurations and requires `SameSite=None`, which completely neuters the CSRF protection and necessitates manual CSRF tokens.

## The Gold Standard: The Backend-For-Frontend (BFF) Pattern

As architectures matured, the industry realized that pushing complex auth logic into the browser was a mistake. Enter the Backend-For-Frontend (BFF) pattern. 

In this architecture, your SPA does not talk directly to the upstream microservices or identity providers (like Auth0, Okta, or AWS Cognito). Instead, it talks to a dedicated, lightweight backend server that exists solely to serve that specific frontend. 

### How it Works

The BFF handles the OAuth2/OIDC flow entirely on the server side. 

1. **Login Initiation**: The SPA redirects the user to the BFF's `/login` route.
2. **OIDC Dance**: The BFF redirects to the Identity Provider (IdP). The user logs in. The IdP redirects back to the BFF with an authorization code.
3. **Token Exchange**: The BFF exchanges the code for access and refresh tokens. **Crucially, these tokens never reach the browser.**
4. **Session Creation**: The BFF stores the tokens in a server-side session store (like Redis) and issues a traditional, encrypted, `HttpOnly`, `SameSite=Strict` cookie to the SPA representing that session.
5. **API Proxying**: When the SPA needs data, it makes a request to the BFF. The BFF intercepts the request, looks up the session cookie, retrieves the associated access token from Redis, attaches it to the `Authorization` header, and proxies the request to the downstream microservice.

### Code Snippet: A Minimal Node.js BFF Proxy

Here is a simplified example using Express and `http-proxy-middleware` to demonstrate how a BFF proxies requests and injects the token:

```javascript
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const app = express();

// 1. Configure robust, server-side sessions
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// 2. Proxy middleware to downstream API
app.use('/api', createProxyMiddleware({
  target: 'https://internal-microservices.cluster.local',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Inject the real access token from the secure session
    if (req.session && req.session.accessToken) {
      proxyReq.setHeader('Authorization', `Bearer ${req.session.accessToken}`);
    }
  },
  onError: (err, req, res) => {
    res.status(500).send('Proxy Error');
  }
}));

// 3. Auth routes handle the OIDC flow and populate req.session.accessToken...
app.get('/auth/callback', handleOidcCallback);
```

### Edge Cases and Trade-offs

The BFF pattern is incredibly secure, but it is not a silver bullet. It introduces state to an otherwise stateless architecture. 

**Trade-off 1: Infrastructure Complexity.** You now have a Node.js (or Go, or Python) server to maintain, deploy, and scale. You need a highly available Redis cluster to store sessions. 

**Trade-off 2: Latency.** Every API request incurs an extra network hop through the BFF. However, because the BFF is typically deployed in the same private network or Kubernetes cluster as the downstream services, this latency is usually negligible (1-2ms).

**Edge Case: Token Expiration and Silent Refresh.** One of the hardest parts of SPA auth is handling token expiration seamlessly. With a BFF, this becomes trivial. Because the BFF holds the refresh token, when an access token expires, the downstream API returns a 401 to the BFF. The BFF can intercept this, use the refresh token to get a new access token, update Redis, and retry the proxy request transparently. The SPA doesn't even know it happened.

**Edge Case: Clock Skew.** When dealing with JWT expiration (`exp` claim), clock skew between servers can cause valid tokens to be rejected. By centralizing token validation in the BFF, you only have to ensure the BFF's NTP daemon is synced correctly, rather than relying on the client's internal clock (which is notoriously unreliable).

## Conclusion

Building secure SPAs is a moving target. While the simplicity of dumping a JWT into `localStorage` is tempting, the security risks are simply too high for any serious application. By adopting `HttpOnly` cookies and leveraging the Backend-For-Frontend pattern, you can isolate sensitive credentials from the browser environment, seamlessly handle token lifecycles, and sleep much better at night. Remember, in security, defense in depth is everything. Don't rely on just one mechanism; build layered architectures that anticipate failure and limit the blast radius.