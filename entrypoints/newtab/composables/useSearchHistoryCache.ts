import {
  getSearchHistories,
  normalizeSearchHistories,
  searchHistoriesStorage,
} from '@newtab/shared/storages/searchHistoriesStorage'

const historiesRef: Ref<string[]> = shallowRef([])
let loaded = false
let loadingPromise: Promise<void> | null = null
let activeConsumers = 0
let stopWatching: (() => void) | null = null
let revision = 0

async function loadFromStorage() {
  const version = revision
  const list = await getSearchHistories()
  if (version !== revision) return
  historiesRef.value = list
  loaded = true
}

async function ensureLoaded(force = false) {
  if (force) loaded = false
  if (loaded) return
  if (!loadingPromise) {
    loadingPromise = loadFromStorage().finally(() => {
      loadingPromise = null
    })
  }
  await loadingPromise
}

function retainWatcher() {
  activeConsumers += 1
  if (!stopWatching) {
    stopWatching = searchHistoriesStorage.watch((list) => {
      revision++
      historiesRef.value = normalizeSearchHistories(list)
      loaded = true
    })
  }
  return () => {
    activeConsumers = Math.max(0, activeConsumers - 1)
    if (activeConsumers > 0) return
    stopWatching?.()
    stopWatching = null
  }
}

async function updateStorage(list: string[]) {
  revision++
  historiesRef.value = list
  await searchHistoriesStorage.setValue(list)
  loaded = true
}

async function addHistory(text: string, limit = 15) {
  if (!text) return
  await ensureLoaded()
  const next = [text, ...historiesRef.value.filter((item) => item !== text)].slice(0, limit)
  await updateStorage(next)
}

async function clearHistories() {
  await ensureLoaded()
  if (historiesRef.value.length === 0) return
  await updateStorage([])
}

export function useSearchHistoryCache() {
  const releaseWatcher = retainWatcher()
  if (getCurrentScope()) onScopeDispose(releaseWatcher)
  return {
    histories: readonly(historiesRef),
    ensureLoaded,
    addHistory,
    clearHistories,
  }
}
