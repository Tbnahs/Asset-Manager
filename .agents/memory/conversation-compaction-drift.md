---
name: Conversation compaction drift
description: After memory compaction, earlier file edits may not persist; verify key edits before continuing.
---

After a conversation memory compaction, earlier file edits can end up in a different state than expected. Some edits may persist while others are rolled back, so the codebase can be inconsistent with the compacted summary.

**Why:** Memory compaction reconciles conversation state but may not preserve every file change, especially when the file was modified multiple times or when the compaction boundary splits an editing sequence.

**How to apply:** Before resuming work after a compaction, run `git diff` or grep the codebase for the edits you believe are in place. Re-apply any missing edits before continuing to build on top of them. Do not rely solely on the compacted summary to know the current file state.
