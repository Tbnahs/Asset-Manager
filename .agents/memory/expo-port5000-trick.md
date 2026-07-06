---
name: Expo webview port 5000 detection trick
description: How to reliably get Replit's workflow system to detect port 5000 for webview workflows in this project.
---

## The problem
After configuring an Expo App workflow with `outputType: "webview"` and `waitForPort: 5000`, subsequent `WorkflowsRestart` calls consistently fail with "didn't open port 5000" — even though the server starts fine (curl localhost:5000 returns 200, process stays up).

## Fix — must do both steps in order
1. Call `verifyAndReplaceDotReplit({ tempFilePath })` with a .replit that has `localPort = 5000` → `externalPort = 80` (no conflicting 8081→80 entry).
2. Immediately call `WorkflowsRestart({ name: "Expo App" })` right after the replace succeeds.

**Why:** The [[ports]] mapping change triggers a proxy routing refresh in the platform, which is what the port detector actually checks — not just whether the OS port is open.

**How to apply:** Any time the Expo App workflow needs to be restarted and port 5000 detection fails, run verifyAndReplaceDotReplit first (even with identical content to current), then WorkflowsRestart.
