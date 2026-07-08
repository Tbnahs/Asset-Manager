---
name: Expo web export + express.static dotfiles trap
description: Why Expo web builds served via express.static can silently 404-fallback on font/asset requests
---

Expo's web export nests some vendor assets (e.g. Google Fonts, icon fonts) under
paths containing a dot-segment, like `assets/__node_modules/.pnpm/@scope+pkg@1.0.0/...`.

`express.static`'s default option `dotfiles: "ignore"` treats any path with a
dot-segment as if it doesn't exist and calls `next()`. In an Express app that
also has a SPA catch-all route (`app.get("/{*path}", ...)` serving `index.html`
for client-side routing), this means the "missing" static file falls through
to the catch-all and returns **200 with `index.html` content** instead of a
clear 404 — so it looks like a CORS/decoding error in the browser ("OTS parsing
error: invalid sfntVersion") rather than a routing bug.

**Why:** Express's dotfiles default is a security convenience (hiding `.env`,
`.git`, etc.) but it doesn't distinguish "dotfile itself" from "path that merely
passes through a dot-named directory" — both get ignored.

**How to apply:** When serving an Expo (or any bundler) web export that has
SPA fallback behind it, pass `{ dotfiles: "allow" }` to `express.static()` for
that build's static root. Verify by curling a known nested vendor-font asset
path directly and checking `Content-Type`/`Content-Length` match the real file,
not `index.html`.
