import type { SettingsSchemaV11 } from './v11'

export interface SettingsSchemaV12 extends Omit<SettingsSchemaV11, 'version' | 'background'> {
  version: 12
  background: Omit<SettingsSchemaV11['background'], 'local' | 'localDark'> & {
    solid: { light: string; dark: string }
    rotation: { enabled: boolean; order: 'random' | 'ordered' }
  }
}
