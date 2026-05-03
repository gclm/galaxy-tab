```markdown
# galaxy-tab Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development patterns, coding conventions, and team workflows used in the `galaxy-tab` project—a Vue-based TypeScript application. You'll learn how to structure code, manage settings and localization, update dependencies, refactor the codebase, and more. This guide is ideal for contributors seeking to follow established practices and efficiently collaborate on the project.

## Coding Conventions

### File Naming

- **CamelCase** is used for file and directory names.
  - Example: `SettingsPage.vue`, `quickStart.ts`, `settingsIndex.ts`

### Import Style

- **Alias imports** are preferred for referencing modules.
  - Example:
    ```typescript
    import { getSetting } from '@/scripts/settings'
    ```

### Export Style

- **Named exports** are used for functions, constants, and types.
  - Example:
    ```typescript
    export function getSetting(key: string): any { ... }
    export type Settings = { ... }
    ```

### Commit Patterns

- Commit messages are **freeform** with no enforced prefixes.
- Typical length: ~23 characters.

## Workflows

### Update Dependencies

**Trigger:** When you need to update project dependencies (e.g., new versions available via dependabot or manually).  
**Command:** `/update-deps`

1. Update `package.json` with new dependency versions.
2. Update `pnpm-lock.yaml` to lock the new versions.
3. Test the application to ensure compatibility.

**Example:**
```bash
pnpm up
pnpm install
```

---

### Update Changelog

**Trigger:** When documenting changes for a new release or bugfix.  
**Command:** `/update-changelog`

1. Edit `CHANGELOG.md` with a summary of changes.
2. Edit `CHANGELOG_zh.md` for Chinese changelog updates.
3. Update `entrypoints/newtab/Changelog.tsx` if the changelog is displayed in the UI.

---

### Feature Addition or Settings Enhancement

**Trigger:** When adding a new feature or enhancing settings (e.g., new setting item, UI option).  
**Command:** `/add-setting`

1. Add or edit Vue components under `components/SettingsPage/Settings/`.
2. Update settings scripts in `scripts/settings/`.
3. Add or update migration scripts in `scripts/settings/migrate/`.
4. Update or add type definitions in `scripts/settings/types/`.
5. Update locale files for new or changed labels.

**Example:**
```typescript
// scripts/settings/index.ts
export const newSetting = { ... }
```
```vue
<!-- components/SettingsPage/Settings/NewSetting.vue -->
<template>...</template>
<script lang="ts">
export default { ... }
</script>
```

---

### Refactor or Restructure Codebase

**Trigger:** When improving code structure, naming, or organization.  
**Command:** `/refactor`

1. Rename or move files and directories as needed (e.g., `quickstart` → `shortcut`).
2. Update all imports and references to reflect changes.
3. Refactor code for naming consistency, structure, or performance.

**Example:**
```typescript
// Before
import { QuickStart } from '@/components/QuickStart'

// After
import { Shortcut } from '@/components/Shortcut'
```

---

### CSS Styling and Theme Adjustment

**Trigger:** When changing visual styles or refactoring CSS for maintainability.  
**Command:** `/style-update`

1. Edit SCSS/CSS files under `styles/` or `assets/styles/`.
2. Update Vue components to change class names or styling.
3. Format or reorder CSS rules for clarity.

**Example:**
```scss
// styles/element/button.scss
.button--primary { ... }
```
```vue
<template>
  <button class="button--primary">Click</button>
</template>
```

---

### Add or Update Localization

**Trigger:** When adding or updating translations for UI changes.  
**Command:** `/update-locale`

1. Edit or add entries in `locales/*.yml`.
2. Update related Vue components or settings to use new localization keys.

**Example:**
```yaml
# locales/en.yml
new_setting_label: "New Setting"
```
```vue
<template>
  <label>{{ $t('new_setting_label') }}</label>
</template>
```

---

## Testing Patterns

- **Test files** use the pattern `*.test.*` (e.g., `settings.test.ts`).
- **Testing framework** is not explicitly specified—check existing test files for conventions.
- Place tests alongside or near the code they cover.

**Example:**
```typescript
// settings.test.ts
import { getSetting } from '@/scripts/settings'

test('should return default value', () => {
  expect(getSetting('theme')).toBe('light')
})
```

## Commands

| Command           | Purpose                                                |
|-------------------|--------------------------------------------------------|
| /update-deps      | Update project dependencies to latest versions          |
| /update-changelog | Update changelog files for recent changes/releases      |
| /add-setting      | Add or enhance a feature or settings item              |
| /refactor         | Refactor or restructure codebase for maintainability    |
| /style-update     | Adjust or refactor CSS/SCSS for style or theme changes |
| /update-locale    | Add or update localization/translation files           |
```