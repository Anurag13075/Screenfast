---
title: "The Right Way to Handle Authentication in Modern SPA Frameworks"
date: "2024-06-10"
description: "Why localStorage is dangerous for tokens, and how to implement secure HttpOnly cookie-based authentication in SPAs."
tags: ["engineering", "frontend"]
readingTime: "8 min read"
---

# The Right Way to Handle Authentication in Modern SPA Frameworks

Authentication in Single Page Applications (SPAs) has been a source of security debates for years. If you are storing your JWTs (JSON Web Tokens) in `localStorage`, you are likely exposing your users to Cross-Site Scripting (XSS) attacks. Let's look at the correct architecture for SPA authentication.

## The LocalStorage Trap

It's common tutorial practice to receive a JWT from a login endpoint and store it via `localStorage.setItem('token', token)`. 

**The risk:** Any JavaScript running on your page (including third-party scripts, analytics, or a malicious script injected via an XSS vulnerability) can read `localStorage`. Once an attacker has the token, they can impersonate the user completely until the token expires.

## The Solution: HttpOnly Cookies

The most secure approach for web clients is to use secure, HttpOnly, SameSite cookies. 

When a cookie is flagged as `HttpOnly`, the browser prevents client-side JavaScript from accessing it. When flagged as `SameSite=Strict` or `Lax`, the browser prevents the cookie from being sent in cross-site requests, mitigating Cross-Site Request Forgery (CSRF) attacks.

### Architecture Overview

1.  **Login Request:** The SPA sends credentials to the server.
2.  **Server Response:** The server validates credentials and sets an `HttpOnly` cookie containing the session ID or JWT in the `Set-Cookie` header.
3.  **Subsequent Requests:** The SPA makes API calls using `fetch` or `axios` with `credentials: 'include'`. The browser automatically attaches the HttpOnly cookie. The SPA never touches the token directly.

## Conclusion
Moving away from `localStorage` to HttpOnly cookies adds slight complexity to the backend routing and CORS configuration but dramatically improves the security posture of your SPA. Treat tokens with the utmost sensitivity and let the browser do the heavy lifting of keeping them safe.