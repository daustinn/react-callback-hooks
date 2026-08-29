import { useCallback, useLayoutEffect, useRef, useState } from 'react'

/** Lifecycle callbacks for `useCache`. */
type CacheCallbacks<K extends string, V> = {
  /** Called after a key is written via `set()`. */
  onSet?: (key: K, value: V) => void
  /** Called after a key expires due to `ttl`. */
  onExpire?: (key: K) => void
  /** Called after a key is removed via `delete()`. */
  onDelete?: (key: K) => void
}

/** Props for the object form of `useCache`. */
type UseCacheProps<K extends string, V> = CacheCallbacks<K, V> & {
  /** Time-to-live in milliseconds. Entries are auto-deleted after this duration. */
  ttl?: number
}

/** The cache object returned by `useCache`. */
type CacheInstance<K extends string, V> = {
  /** Returns the value for `key`, or `undefined` if absent or expired. */
  get: (key: K) => V | undefined
  /** Writes `value` for `key`, resets its TTL timer, and fires `onSet`. */
  set: (key: K, value: V) => void
  /** Removes `key` and fires `onDelete`. */
  delete: (key: K) => void
  /** Removes all entries and clears all TTL timers. */
  clear: () => void
  /** Returns `true` if `key` exists and has not yet expired. */
  has: (key: K) => boolean
  /** Current number of entries in the cache. */
  readonly size: number
  /** Read-only view of the underlying `Map`. */
  readonly entries: ReadonlyMap<K, V>
}

/**
 * Shorthand form — pass only an `onSet` callback.
 * @param onSet Called whenever a key is written.
 * @returns `CacheInstance<K, V>`
 */
function useCache<K extends string = string, V = unknown>(
  onSet?: (key: K, value: V) => void
): CacheInstance<K, V>

/**
 * Object form — full configuration with TTL and lifecycle callbacks.
 * @param props `UseCacheProps<K, V>`
 * @returns `CacheInstance<K, V>`
 */
function useCache<K extends string = string, V = unknown>(
  props: UseCacheProps<K, V>
): CacheInstance<K, V>

function useCache<K extends string = string, V = unknown>(
  arg?: ((key: K, value: V) => void) | UseCacheProps<K, V>
): CacheInstance<K, V> {
  const isCallback = typeof arg === 'function'
  const ttl = isCallback ? undefined : arg?.ttl

  const store = useRef(new Map<K, V>())
  const timers = useRef(new Map<K, ReturnType<typeof setTimeout>>())
  const [, rerender] = useState(0)

  const callbacksRef = useRef<CacheCallbacks<K, V>>({
    onSet: isCallback ? arg : arg?.onSet,
    onExpire: isCallback ? undefined : arg?.onExpire,
    onDelete: isCallback ? undefined : arg?.onDelete
  })

  useLayoutEffect(() => {
    callbacksRef.current = {
      onSet: isCallback
        ? (arg as (key: K, value: V) => void)
        : (arg as UseCacheProps<K, V>)?.onSet,
      onExpire: isCallback ? undefined : (arg as UseCacheProps<K, V>)?.onExpire,
      onDelete: isCallback ? undefined : (arg as UseCacheProps<K, V>)?.onDelete
    }
  })

  const expire = useCallback((key: K) => {
    store.current.delete(key)
    timers.current.delete(key)
    callbacksRef.current.onExpire?.(key)
    rerender((n) => n + 1)
  }, [])

  const set = useCallback(
    (key: K, value: V) => {
      const existing = timers.current.get(key)
      if (existing != null) {
        clearTimeout(existing)
        timers.current.delete(key)
      }
      store.current.set(key, value)
      if (ttl != null) {
        timers.current.set(
          key,
          setTimeout(() => expire(key), ttl)
        )
      }
      callbacksRef.current.onSet?.(key, value)
      rerender((n) => n + 1)
    },
    [ttl, expire]
  )

  const del = useCallback((key: K) => {
    const timer = timers.current.get(key)
    if (timer != null) {
      clearTimeout(timer)
      timers.current.delete(key)
    }
    store.current.delete(key)
    callbacksRef.current.onDelete?.(key)
    rerender((n) => n + 1)
  }, [])

  const clear = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current.clear()
    store.current.clear()
    rerender((n) => n + 1)
  }, [])

  const get = useCallback((key: K) => store.current.get(key), [])
  const has = useCallback((key: K) => store.current.has(key), [])

  return {
    get,
    set,
    delete: del,
    clear,
    has,
    get size() {
      return store.current.size
    },
    get entries() {
      return store.current as ReadonlyMap<K, V>
    }
  }
}

export type { UseCacheProps, CacheInstance, CacheCallbacks }
export default useCache
