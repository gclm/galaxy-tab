function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', () => resolve(request.result), { once: true })
    request.addEventListener('error', () => reject(request.error), { once: true })
  })
}

function transactionToPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('complete', resolve, { once: true })
    transaction.addEventListener('abort', () => reject(transaction.error), { once: true })
    transaction.addEventListener('error', () => reject(transaction.error), { once: true })
  })
}

function deleteDatabase(name) {
  return requestToPromise(indexedDB.deleteDatabase(name))
}

export async function runBrowserTests() {
  const databaseName = `extension-browser-debugging-${crypto.randomUUID()}`
  const openRequest = indexedDB.open(databaseName, 1)
  openRequest.addEventListener(
    'upgradeneeded',
    () => openRequest.result.createObjectStore('values'),
    { once: true },
  )

  const database = await requestToPromise(openRequest)
  try {
    const writeTransaction = database.transaction('values', 'readwrite')
    writeTransaction.objectStore('values').put({ source: 'real-indexeddb' }, 'sample')
    await transactionToPromise(writeTransaction)

    const readTransaction = database.transaction('values', 'readonly')
    const value = await requestToPromise(readTransaction.objectStore('values').get('sample'))
    await transactionToPromise(readTransaction)
    if (value?.source !== 'real-indexeddb') throw new Error('IndexedDB read/write failed')

    return ['IndexedDB read/write and cleanup']
  } finally {
    database.close()
    await deleteDatabase(databaseName)
  }
}
