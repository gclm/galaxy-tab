import { storage } from '#imports'

export const searchHistoriesStorage = storage.defineItem<string[]>('local:searchHistories', {
  fallback: [],
})

export function normalizeSearchHistories(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')

  if (!value || typeof value !== 'object') return []
  const { items } = value as { items?: unknown }
  if (!Array.isArray(items)) return []

  return items.flatMap((item) => {
    if (typeof item === 'string') return item
    if (item && typeof item === 'object' && typeof (item as { text?: unknown }).text === 'string') {
      return (item as { text: string }).text
    }
    return []
  })
}

export async function getSearchHistories(): Promise<string[]> {
  const raw = await storage.getItem<unknown>(searchHistoriesStorage.key)
  const histories = normalizeSearchHistories(raw)
  if (!Array.isArray(raw)) await searchHistoriesStorage.setValue(histories)
  return histories
}
