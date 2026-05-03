---
name: update-changelog
description: Workflow command scaffold for update-changelog in galaxy-tab.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /update-changelog

Use this workflow when working on **update-changelog** in `galaxy-tab`.

## Goal

Update changelog files to reflect recent changes or releases.

## Common Files

- `CHANGELOG.md`
- `CHANGELOG_zh.md`
- `entrypoints/newtab/Changelog.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit CHANGELOG.md
- Edit CHANGELOG_zh.md
- Edit entrypoints/newtab/Changelog.tsx

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.