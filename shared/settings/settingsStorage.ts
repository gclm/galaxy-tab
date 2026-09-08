import { storage } from '#imports'

import { migrateWallpaperLibrary } from '../wallpaperLibrary'

import { type CURRENT_CONFIG_SCHEMA, CURRENT_CONFIG_VERSION } from './current'
import { defaultSettings } from './default'
import { migrateSettingsOneVersion, type MigratableSettings } from './migrateToCurrent'
import type {
  SettingsSchemaV10,
  SettingsSchemaV11,
  SettingsSchemaV7,
  SettingsSchemaV8,
  SettingsSchemaV9,
} from './types'

// 合并重复的迁移逻辑，通过辅助函数创建迁移函数
function createMigration<From, To>(fromVersion: number) {
  return async (settings: From & { version: number }): Promise<To> => {
    if (settings.version > fromVersion) {
      return settings as unknown as To
    }
    console.log(`[Settings] Migrating config from version ${fromVersion} to ${fromVersion + 1}`)
    if (settings.version === fromVersion) {
      return (await migrateSettingsOneVersion(
        settings as unknown as MigratableSettings,
      )) as unknown as To
    }
    throw new Error('Invalid config version')
  }
}

const storedSettings = storage.defineItem<CURRENT_CONFIG_SCHEMA>('local:settings', {
  fallback: structuredClone(defaultSettings),
  version: CURRENT_CONFIG_VERSION,
  migrations: {
    // 不再提供对第6版及以前的迁移支持，遇到 <=6 的数据应由初始化逻辑提示用户清除数据
    8: createMigration<SettingsSchemaV7, SettingsSchemaV8>(7),
    9: createMigration<SettingsSchemaV8, SettingsSchemaV9>(8),
    10: createMigration<SettingsSchemaV9, SettingsSchemaV10>(9),
    11: createMigration<SettingsSchemaV10, SettingsSchemaV11>(10),
    12: async (settings: SettingsSchemaV11) => {
      await migrateWallpaperLibrary(settings.background)
      return createMigration<SettingsSchemaV11, CURRENT_CONFIG_SCHEMA>(11)(settings)
    },
  },
})

// WXT 会记录迁移失败后继续返回旧值；阻止调用方把未迁移的数据当作当前配置保存。
export const settingsStorage = {
  ...storedSettings,
  async getValue() {
    const value = await storedSettings.getValue()
    if (value.version !== CURRENT_CONFIG_VERSION)
      throw new Error('Settings migration did not complete')
    return value
  },
}
