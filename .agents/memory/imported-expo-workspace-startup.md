---
name: Imported Expo workspace startup
description: Recover an Expo artifact in a fresh pnpm monorepo when dependencies are absent or blocked by the package firewall.
---

On fresh imports, `node_modules` may be entirely absent, so workflow errors such as `expo not found` are dependency-setup failures rather than app-code failures. Install the Expo app's workspace dependency closure first instead of letting unrelated service dependencies block it. If Replit's package firewall rejects an older transitive tarball, check the parent package's declared range and move only that child to a compatible maintained release; do not bypass the firewall. Expo's web port can differ from the script's `PORT`, so use the running workflow's reported open port for preview checks.

**Why:** Mobile and service artifacts have separate dependency closures, while one blocked legacy package can stop a workspace-wide install; Expo may also serve web on a different port than Metro.

**How to apply:** When an imported Expo artifact will not start, inspect workflow logs, install only the Expo app and its workspace dependencies, run Expo's compatibility checks, then restart the managed artifact workflow and use its open port to verify the preview.
