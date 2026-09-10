import { storage } from '#imports'
import { browser } from 'wxt/browser'

export type ExtensionUpdateNoticeType = 'prompt' | 'toast' | null

type ExtensionUpdateNotice = {
  version: string
  promptShown: boolean
}

export type ExtensionUpdateMessage = { type: 'extension-update:consume-notice' }

const extensionUpdateNoticeStorage = storage.defineItem<ExtensionUpdateNotice | null>(
  'session:extensionUpdateNotice',
  { fallback: null },
)

export async function markExtensionUpdateAvailable(version: string): Promise<void> {
  await extensionUpdateNoticeStorage.setValue({ version, promptShown: false })
}

export async function consumeExtensionUpdateNotice(): Promise<'prompt' | 'toast' | null> {
  const notice = await extensionUpdateNoticeStorage.getValue()
  if (!notice) return null

  if (!notice.promptShown) {
    await extensionUpdateNoticeStorage.setValue({ ...notice, promptShown: true })
    return 'prompt'
  }

  return 'toast'
}

export function isExtensionUpdateMessage(message: unknown): message is ExtensionUpdateMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'extension-update:consume-notice'
  )
}

export function requestExtensionUpdateNotice(): Promise<ExtensionUpdateNoticeType> {
  return browser.runtime.sendMessage({
    type: 'extension-update:consume-notice',
  } satisfies ExtensionUpdateMessage)
}
