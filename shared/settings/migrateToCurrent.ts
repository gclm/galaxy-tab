import { migrateWallpaperLibrary } from '../wallpaperLibrary'

import { CURRENT_CONFIG_VERSION, type CURRENT_CONFIG_SCHEMA } from './current'
import {
  migrateFromVer10To11,
  migrateFromVer7To8,
  migrateFromVer8To9,
  migrateFromVer9To10,
} from './migrate'
import { migrateFromVer11To12 } from './migrate/fromVer11'
import { normalizeCurrentSettings } from './normalize'
import type {
  SettingsSchemaV10,
  SettingsSchemaV11,
  SettingsSchemaV7,
  SettingsSchemaV8,
  SettingsSchemaV9,
} from './types'

export type MigratableSettings =
  | SettingsSchemaV7
  | SettingsSchemaV8
  | SettingsSchemaV9
  | SettingsSchemaV10
  | SettingsSchemaV11
  | CURRENT_CONFIG_SCHEMA

export function migrateSettingsOneVersion(settings: MigratableSettings): MigratableSettings {
  switch (settings.version) {
    case 7:
      return migrateFromVer7To8(settings)
    case 8:
      return migrateFromVer8To9(settings)
    case 9:
      return migrateFromVer9To10(settings)
    case 10:
      return migrateFromVer10To11(settings)
    case 11:
      return migrateFromVer11To12(settings)
    default:
      throw new Error(`Unsupported config version: ${settings.version}`)
  }
}

export function migrateSettingsToCurrent(settings: MigratableSettings): {
  settings: CURRENT_CONFIG_SCHEMA
  migrated: boolean
} {
  let current = settings
  let migrated = false

  while (current.version < CURRENT_CONFIG_VERSION) {
    const previousVersion = current.version
    current = migrateSettingsOneVersion(current)
    if (current.version <= previousVersion || current.version > CURRENT_CONFIG_VERSION) {
      throw new Error(`Invalid migration result: ${previousVersion} -> ${current.version}`)
    }
    migrated = true
  }

  if (current.version !== CURRENT_CONFIG_VERSION) {
    throw new Error(`Unexpected config version after migration: ${current.version}`)
  }

  return {
    settings: normalizeCurrentSettings(current as CURRENT_CONFIG_SCHEMA),
    migrated,
  }
}

/** 修复 WXT 元数据已前进、但配置值仍停留在旧版本的异常状态。 */
export async function migrateSettingsToCurrentWithWallpaper(
  settings: MigratableSettings,
): Promise<CURRENT_CONFIG_SCHEMA> {
  let current = settings

  while (current.version < CURRENT_CONFIG_VERSION) {
    const previousVersion = current.version
    if (current.version === 11) {
      await migrateWallpaperLibrary(current.background)
    }
    current = migrateSettingsOneVersion(current)
    if (current.version <= previousVersion || current.version > CURRENT_CONFIG_VERSION) {
      throw new Error(`Invalid repair migration result: ${previousVersion} -> ${current.version}`)
    }
  }

  if (current.version !== CURRENT_CONFIG_VERSION) {
    throw new Error(`Unexpected config version after repair: ${current.version}`)
  }

  return normalizeCurrentSettings(current as CURRENT_CONFIG_SCHEMA)
}
