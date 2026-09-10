import i18next from 'i18next'

import { browser } from 'wxt/browser'

export async function openUrlInIncognitoWindow(url: string): Promise<void> {
  if (import.meta.env.FIREFOX && !(await browser.extension.isAllowedIncognitoAccess())) {
    await ElMessageBox.alert(
      i18next.t('settings:common.incognitoPermission.message'),
      i18next.t('settings:common.incognitoPermission.title'),
      { type: 'warning' },
    )
    return
  }

  await browser.windows.create({ incognito: true, url })
}
