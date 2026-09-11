import type { PluginFunc } from 'dayjs/esm'
import dayjs from 'dayjs/esm'
import localizedFormat from 'dayjs/esm/plugin/localizedFormat'
import i18next from 'i18next'

import { getLang } from '@/shared/i18n'

const dayjsLocales = import.meta.glob('/node_modules/dayjs/esm/locale/zh*.js', {
  eager: false,
}) as Record<string, () => Promise<{ default: ILocale }>>

dayjs.extend(localizedFormat)

let lunarTask: Promise<void> | undefined
let languageVersion = 0
export const dayjsLanguage = ref('')

export function ensureLunarPlugin(): Promise<void> {
  return (lunarTask ??= import('dayjs-plugin-lunar')
    .then(({ PluginLunar }) => {
      dayjs.extend(PluginLunar as PluginFunc<{ traditional?: boolean }>)
    })
    .catch((error) => {
      lunarTask = undefined
      throw error
    }))
}

const changeLanguage = async (lng: string) => {
  const version = ++languageVersion
  const language = lng.toLowerCase()
  let mod: { default?: ILocale } | undefined
  if (lng?.startsWith('zh')) {
    const loader = dayjsLocales[`/node_modules/dayjs/esm/locale/${language}.js`]
    const fallback = dayjsLocales['/node_modules/dayjs/esm/locale/zh-cn.js']
    mod = await (loader || fallback)?.()
  }
  if (version !== languageVersion) return
  const localeData = mod?.default
  if (localeData?.name) {
    dayjs.locale(localeData.name, localeData, true)
    dayjs.locale(localeData.name)
  } else if (!lng?.startsWith('zh')) {
    // 使用已加载语言时不再需要两次设置 locale
    dayjs.locale('en')
  }
  dayjsLanguage.value = lng
}

const onLanguageChanged = (lng: string) => {
  void changeLanguage(lng).catch((error) => {
    console.error('[clock] Failed to load date language:', error)
  })
}

export const initDayjs = async () => {
  const lang = getLang()
  await changeLanguage(lang)

  // 当语言切换时，同步 dayjs 语言
  i18next.off('languageChanged', onLanguageChanged)
  i18next.on('languageChanged', onLanguageChanged)
}
