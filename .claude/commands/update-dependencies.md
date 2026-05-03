---
name: update-dependencies
description: Workflow command scaffold for update-dependencies in galaxy-tab.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /update-dependencies

Use this workflow when working on **update-dependencies** in `galaxy-tab`.

## Goal

Update project dependencies to newer versions, often via package manager.

## Common Files

- `package.json`
- `pnpm-lock.yaml`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Update package.json with new dependency versions
- Update pnpm-lock.yaml to lock new versions

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.