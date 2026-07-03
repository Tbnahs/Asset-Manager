---
name: Expo package.json drift causes Metro crash
description: What to do when an Expo artifact's workflow fails to start after adding an import for a new native package
---

If an Expo app workflow fails at startup with `CommandError: "<pkg>" is added as a dependency in your project's package.json but it doesn't seem to be installed`, the package was added to `package.json` (often by a previous edit that imported it in code) but `pnpm install` was never run for it in this workspace.

**Why:** Editing `package.json` by hand (or adding an import that assumes a package exists) doesn't install it — the lockfile/node_modules stay stale until an install step runs.

**How to apply:** From the artifact directory, run `pnpm exec expo install <package-name>` (not plain `pnpm add`) so Expo also picks the version compatible with the installed Expo SDK and registers any config plugin. Then restart the artifact's workflow and verify via `refresh_all_logs` / a screenshot.
