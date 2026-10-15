---
name: Metro image-size override
description: Build compatibility when the workspace security override upgrades image-size beyond Metro's supported API.
---

Metro 0.83 calls `image-size` with a filesystem path, but `image-size` v2 expects a byte buffer. A workspace security override that raises all image-size versions to v2 can therefore break Expo asset transforms with a `TextDecoder.decode` type error. Preloading a wrapper through Metro config or `NODE_OPTIONS` did not reach the asset-transform workers; adapting Metro's asset input to a buffer before worker startup did.

**Why:** Keep the security override intact and avoid changing Expo or React Native versions while making Metro's expected input compatible.

**How to apply:** When this conflict appears, locate Metro's asset metadata call and convert its on-disk file path to bytes before calling image-size. Do not lower the global security override or rely on a main-process-only preload.
