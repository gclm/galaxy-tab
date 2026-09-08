import { idbClear, idbDelete, idbGet, idbSet } from '@/shared/storage/idb'

/** 创建与 idb API 兼容的 store 包装 */
function createWallpaperStore(storeName: 'wallpaperBing') {
  return {
    getItem: async <T = Blob>(_key: string): Promise<T | null> =>
      ((await idbGet(storeName, _key)) as T | undefined) ?? null,
    setItem: <T = Blob>(_key: string, value: T) => idbSet(storeName, _key, value as Blob),
    removeItem: (key: string) => idbDelete(storeName, key),
    clear: () => idbClear(storeName),
  }
}

export const useBingWallpaperStorge = createWallpaperStore('wallpaperBing')
