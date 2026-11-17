/**
 * Wrapper mínimo sobre IndexedDB (sem dependências externas).
 *
 * Stores:
 *  - cache:  chave/valor com os dados de consulta guardados para uso offline
 *  - outbox: fila de operações feitas offline, aguardando sincronização
 */

const DB_NAME = 'cobeb-offline'
const DB_VERSION = 1

export const STORES = {
  cache: 'cache',
  outbox: 'outbox',
} as const

type StoreName = (typeof STORES)[keyof typeof STORES]

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB indisponível'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORES.cache)) {
        db.createObjectStore(STORES.cache)
      }
      if (!db.objectStoreNames.contains(STORES.outbox)) {
        db.createObjectStore(STORES.outbox, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      dbPromise = null
      reject(request.error)
    }
  })

  return dbPromise
}

async function run<T>(
  store: StoreName,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb()

  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(store, mode)
    const req = fn(tx.objectStore(store))
    let result: T

    req.onsuccess = () => {
      result = req.result
    }
    tx.oncomplete = () => resolve(result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

// ---------------------------------------------------------------- cache (kv)

export interface CacheEntry<T = unknown> {
  value: T
  savedAt: number
}

export async function cacheGet<T>(key: string): Promise<CacheEntry<T> | undefined> {
  try {
    return await run<CacheEntry<T> | undefined>(STORES.cache, 'readonly', (s) => s.get(key))
  } catch (e) {
    console.error('[offline] falha ao ler cache', e)
    return undefined
  }
}

export async function cacheSet<T>(key: string, value: T): Promise<void> {
  try {
    await run(STORES.cache, 'readwrite', (s) =>
      s.put({ value, savedAt: Date.now() } satisfies CacheEntry<T>, key)
    )
  } catch (e) {
    console.error('[offline] falha ao gravar cache', e)
  }
}

export async function cacheClear(): Promise<void> {
  try {
    await run(STORES.cache, 'readwrite', (s) => s.clear())
  } catch (e) {
    console.error('[offline] falha ao limpar cache', e)
  }
}

// -------------------------------------------------------------------- outbox

export async function outboxAll<T extends { id: string; createdAt: number }>(): Promise<T[]> {
  try {
    const all = await run<T[]>(STORES.outbox, 'readonly', (s) => s.getAll())
    return all.sort((a, b) => a.createdAt - b.createdAt)
  } catch (e) {
    console.error('[offline] falha ao ler fila', e)
    return []
  }
}

export async function outboxPut<T extends { id: string }>(item: T): Promise<void> {
  await run(STORES.outbox, 'readwrite', (s) => s.put(item))
}

export async function outboxDelete(id: string): Promise<void> {
  await run(STORES.outbox, 'readwrite', (s) => s.delete(id))
}
