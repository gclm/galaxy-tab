# galaxy-tab Development Patterns

> Auto-generated skill from repository analysis

## Overview

The `galaxy-tab` repository is a TypeScript-based Vue application that appears to be a browser extension for customizing new tab pages. The codebase follows modern Vue 3 patterns with TypeScript, uses pnpm for package management, and includes a comprehensive localization system supporting multiple languages. The project emphasizes modular architecture with well-organized components, utilities, and settings management.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names
- Component files use `.vue` extension
- Utility files use `.ts` extension
- Test files follow `*.test.*` pattern

```typescript
// ✅ Good
quickStartUtils.ts
settingsStorage.ts
QuickStart.vue

// ❌ Avoid
quick-start-utils.ts
settings_storage.ts
```

### Import Style
- Use **alias imports** for cleaner paths
- Prefer named imports over default imports

```typescript
// ✅ Good
import { settingsStorage } from '@/scripts/storages/settingsStorage'
import { QuickStartItem } from '@/components/QuickStart/types'

// ❌ Avoid
import settingsStorage from '../../../scripts/storages/settingsStorage'
```

### Export Style
- Use **named exports** consistently
- Avoid default exports except for Vue components

```typescript
// ✅ Good
export const useSettings = () => { ... }
export const migrateSettings = () => { ... }
export type SettingsType = { ... }
```

## Workflows

### Dependency Update
**Trigger:** When packages need to be updated or new dependencies added
**Command:** `/update-deps`

1. Update version numbers in `package.json`
2. Run `pnpm install` to update `pnpm-lock.yaml`
3. Test the application to ensure compatibility
4. Commit both files together with a descriptive message

```json
// package.json example
{
  "dependencies": {
    "vue": "^3.4.0",
    "@vueuse/core": "^10.5.0"
  }
}
```

### Code Cleanup
**Trigger:** When refactoring components or removing unused code
**Command:** `/cleanup`

1. Remove unused imports and variables
2. Optimize Vue component logic and templates
3. Clean up utility functions in QuickStart modules
4. Update type definitions if needed
5. Ensure all components still function correctly

```vue
<!-- Before cleanup -->
<template>
  <div class="unused-wrapper">
    <div class="container">
      <QuickStartItem v-for="item in items" :key="item.id" />
    </div>
  </div>
</template>

<!-- After cleanup -->
<template>
  <div class="container">
    <QuickStartItem v-for="item in items" :key="item.id" />
  </div>
</template>
```

### Localization Update
**Trigger:** When adding new text or updating translations
**Command:** `/update-i18n`

1. Add or modify keys in `locales/en.yml` (English base)
2. Update corresponding translations in `locales/zh_CN.yml`
3. Update corresponding translations in `locales/zh_TW.yml`
4. Update Vue components that use the new translation keys
5. Test language switching functionality

```yaml
# locales/en.yml
quickstart:
  title: "Quick Start"
  add_item: "Add New Item"
  
# locales/zh_CN.yml
quickstart:
  title: "快速开始"
  add_item: "添加新项目"
```

### Settings Modification
**Trigger:** When changing settings structure, storage, or migration logic
**Command:** `/modify-settings`

1. Update type definitions in `entrypoints/newtab/scripts/settings/types/`
2. Modify storage logic in `settingsStorage.ts`
3. Create or update migration scripts in `migrate/` directory
4. Update settings-related Vue components
5. Test settings persistence and migration paths

```typescript
// Example settings type update
export interface SettingsType {
  theme: 'light' | 'dark' | 'auto'
  quickStart: {
    enabled: boolean
    maxItems: number
  }
  // New setting
  animations: boolean
}
```

### Changelog Update
**Trigger:** When preparing releases or documenting significant changes
**Command:** `/update-changelog`

1. Add new entries to `CHANGELOG.md` (English)
2. Add corresponding entries to `CHANGELOG_zh.md` (Chinese)
3. Update `entrypoints/newtab/Changelog.tsx` component if needed
4. Follow semantic versioning principles
5. Group changes by type (Added, Changed, Fixed, Removed)

```markdown
## [1.2.0] - 2024-01-15

### Added
- New QuickStart customization options
- Dark mode theme support

### Changed
- Improved settings migration performance

### Fixed
- Translation missing for new features
```

### QuickStart Enhancement
**Trigger:** When improving or adding features to the QuickStart component
**Command:** `/enhance-quickstart`

1. Modify main component in `entrypoints/newtab/components/QuickStart/index.vue`
2. Update utility functions in the `utils/` subdirectory
3. Add or modify child components in `components/` subdirectory
4. Update related TypeScript types
5. Test drag-and-drop and customization features

```vue
<!-- QuickStart component structure -->
<template>
  <div class="quickstart-container">
    <QuickStartHeader @add-item="handleAddItem" />
    <QuickStartGrid :items="quickStartItems" @reorder="handleReorder" />
    <QuickStartSettings v-if="showSettings" />
  </div>
</template>
```

## Testing Patterns

The project uses a testing framework with files following the `*.test.*` pattern. Tests should be placed alongside their corresponding source files or in dedicated test directories.

```typescript
// Example test structure
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuickStart from './QuickStart.vue'

describe('QuickStart Component', () => {
  it('renders correctly', () => {
    const wrapper = mount(QuickStart)
    expect(wrapper.exists()).toBe(true)
  })
})
```

## Commands

| Command | Purpose |
|---------|---------|
| `/update-deps` | Update project dependencies and lock file |
| `/cleanup` | Clean up and refactor code files |
| `/update-i18n` | Update translations across multiple languages |
| `/modify-settings` | Modify settings system including storage and migration |
| `/update-changelog` | Update changelog and version information |
| `/enhance-quickstart` | Enhance QuickStart component functionality and UI |