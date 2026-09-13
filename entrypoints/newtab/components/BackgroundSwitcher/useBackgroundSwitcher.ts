import i18next from 'i18next'

import { BgType } from '@/shared/enums'
import { useSettingsStore } from '@/shared/settings'

import {
  PermissionContext,
  PermissionResult,
  usePermission,
} from '@newtab/composables/usePermission'
import { clearAllOnlineWallpaperCache } from '@newtab/shared/wallpaper'
let isShowingPermissionDialog = false
export default function useBackgroundSwitcher() {
  const settings = useSettingsStore()
  // 在线壁纸相关
  const tempOnlineUrl = ref('') // 用于在线壁纸输入框的临时存储，避免频繁修改 settingsStore

  const onlineImageWarn = async () => {
    if (settings.background.online.url) {
      settings.background.bgType = BgType.Online
      return
    }
    ElMessageBox.confirm(
      i18next.t('settings:background.warning.unknownSource'),
      i18next.t('settings:background.warning.title'),
      {
        type: 'warning',
      },
    )
      .then(() => {
        settings.background.bgType = BgType.Online
      })
      .catch(() => {
        settings.background.bgType = BgType.None
        settings.background.online.url = ''
      })
  }

  const { checkAndRequestPermission } = usePermission()

  const offerEnableOnlineWallpaperCache = async (hostname: string) => {
    if (settings.background.online.cache.enabled) return

    try {
      await ElMessageBox.confirm(
        i18next.t('settings:background.cache.askEnable.message'),
        i18next.t('settings:background.cache.askEnable.title'),
        { type: 'info' },
      )
    } catch {
      return
    }

    if (import.meta.env.MANIFEST_VERSION === 2) {
      settings.background.online.cache.enabled = true
      return
    }

    const result = await checkAndRequestPermission(hostname, true, PermissionContext.WallpaperCache)
    if (result === PermissionResult.GrantedAll) {
      settings.background.online.cache.enabled = true
    } else {
      ElMessage.warning(i18next.t('settings:background.warning.cacheDisabled'))
    }
  }

  const handlePermissions = async (_url: string, hostname: string) => {
    const result = await checkAndRequestPermission(
      hostname,
      false,
      PermissionContext.OnlineWallpaper,
    )

    if (result === PermissionResult.GrantedAll) return true

    if (result === PermissionResult.GrantedCurrent) {
      if (settings.theme.monetColor) {
        settings.theme.monetColor = false
        ElMessage.warning(i18next.t('settings:background.warning.monetDisabled'))
      }
      // 如果只授予了当前地址权限，则无法安全使用在线壁纸缓存。
      // 如果用户之前启用了缓存，则自动关闭并清理缓存，同时给出提示说明原因。
      if (settings.background.online.cache.enabled) {
        settings.background.online.cache.enabled = false
        await clearAllOnlineWallpaperCache()
        ElMessage.warning(i18next.t('settings:background.warning.cacheDisabled'))
      }
      return true
    }

    if (result === PermissionResult.DeniedByBrowser || result === PermissionResult.DeniedByUser) {
      ElMessage.error(i18next.t('settings:background.warning.notGranted'))
    }

    return false
  }

  const changeOnlineBg = async (e: Event) => {
    if (isShowingPermissionDialog) return
    const _url = (e.target as HTMLInputElement).value
    if (!_url) {
      settings.background.bgType = BgType.None
      settings.background.online.url = ''
      tempOnlineUrl.value = ''
      return
    }
    let url: URL
    try {
      url = new URL(_url)
      if (url.protocol !== 'http:' && url.protocol !== 'https:')
        throw new TypeError('Unsupported URL')
    } catch {
      tempOnlineUrl.value = settings.background.online.url
      ElMessage.error(i18next.t('settings:background.warning.invalidUrl'))
      return
    }
    const { hostname } = url

    // MV2的Firefox不需要检查权限，直接设置在线壁纸URL即可。MV3才需要检查权限。
    if (import.meta.env.MANIFEST_VERSION === 2 && !settings.theme.monetColor) {
      await clearAllOnlineWallpaperCache()
      settings.background.online.url = _url
      await offerEnableOnlineWallpaperCache(hostname)
      return
    }

    isShowingPermissionDialog = true
    try {
      if (await handlePermissions(_url, hostname)) {
        await clearAllOnlineWallpaperCache()
        settings.background.online.url = _url
        await offerEnableOnlineWallpaperCache(hostname)
      } else {
        settings.background.bgType = BgType.None
        tempOnlineUrl.value = ''
      }
    } finally {
      isShowingPermissionDialog = false
    }
  }

  tempOnlineUrl.value = settings.background.online.url
  return { tempOnlineUrl, changeOnlineBg, onlineImageWarn }
}
