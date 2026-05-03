---
name: feature-addition-or-settings-enhancement
description: Workflow command scaffold for feature-addition-or-settings-enhancement in galaxy-tab.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /feature-addition-or-settings-enhancement

Use this workflow when working on **feature-addition-or-settings-enhancement** in `galaxy-tab`.

## Goal

Add or enhance a feature, especially settings-related, often involving Vue components, settings scripts, migration scripts, and locale files.

## Common Files

- `entrypoints/newtab/components/SettingsPage/Settings/*.vue`
- `entrypoints/newtab/scripts/settings/index.ts`
- `entrypoints/newtab/scripts/settings/migrate/*.ts`
- `entrypoints/newtab/scripts/settings/types/*.d.ts`
- `locales/*.yml`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit or add Vue component(s) under components/SettingsPage/Settings/
- Update settings script(s) in scripts/settings/
- Update or add migration scripts in scripts/settings/migrate/
- Update or add type definition files in scripts/settings/types/
- Update locale files for new/changed labels

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.