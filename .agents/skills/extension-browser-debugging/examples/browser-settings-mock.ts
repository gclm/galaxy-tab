import { defaultSettings } from '../../../shared/settings/default'

import { storage } from './browser-storage-mock'

export { normalizeCurrentSettings } from '../../../shared/settings/normalize'
export const settingsStorage = storage.defineItem('local:settings', {
  fallback: structuredClone(defaultSettings),
})
