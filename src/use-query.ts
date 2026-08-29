import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'

type CacheEntry<T> = {
  data: T
  timestamp: number
}

const queryStore = new Map<string, CacheEntry<unknown>>()

/** Current state of an async query. */
type QueryState<T> = {
  /** Resolved data, or `null` while loading or on error. */
  data: T | null
  /** `true` while a fetch is in flight. */
  loading: boolean
  /** Last error, or `null` if the last fetch succeeded. */
  error: Error | null
}

/** Lifecycle callbacks for `useQuery`. */
type QueryCallbacks<T> = {
  /** Called with the resolved data after a successful fetch. */
  onSuccess?: (data: T) => void
  /** Called with the error when a fetch rejects. */
  onError?: (error: Error) => void
}

/** Props for the object form of `useQuery`. */
type UseQueryProps<T> = QueryCallbacks<T> & {
  /** Cache key. Use an array to have the query re-fetch when any element changes. */
  key: string | string[]
  /** Async function that resolves the data. */
  queryFn: () => Promise<T>
  /** Ms before a cached result is considered stale and re-fetched. @default undefined (never stale) */
  staleTime?: number
  /** Set to `false` to skip fetching until a condition is met. @default true */
  enabled?: boolean
}

/**
 * Return tuple: `[state, refetch]`
 * - `state.data` — resolved data.
 * - `state.loading` — `true` while in flight.
 * - `state.error` — last error or `null`.
 * - `refetch()` — forces a new fetch, bypassing the cache.
 */
type UseQueryReturn<T> = [state: QueryState<T>, refetch: () => void]

/**
 * Shorthand form — key + fetcher + optional callbacks.
 * @param key Cache key (string or array; array keys are joined and re-fetched when any part changes).
 * @param queryFn Async function `() => Promise<T>`.
 * @param options Optional `onSuccess` / `onError` callbacks.
 * @returns `[state, refetch]`
 */
function useQuery<T>(
  key: string | string[],
  queryFn: () => Promise<T>,
  options?: QueryCallbacks<T>
): UseQueryReturn<T>

/**
 * Object form — full configuration with staleTime, enabled flag, and callbacks.
 * @param props `UseQueryProps<T>`
 * @returns `[state, refetch]`
 */
function useQuery<T>(props: UseQueryProps<T>): UseQueryReturn<T>

function useQuery<T>(
  arg: string | string[] | UseQueryProps<T>,
  queryFnArg?: () => Promise<T>,
  optionsArg?: QueryCallbacks<T>
): UseQueryReturn<T> {
  const isShorthand = typeof arg === 'string' || Array.isArray(arg)

  const key = isShorthand
    ? (arg as string | string[])
    : (arg as UseQueryProps<T>).key
  const queryFn = isShorthand ? queryFnArg! : (arg as UseQueryProps<T>).queryFn
  const staleTime = isShorthand
    ? undefined
    : (arg as UseQueryProps<T>).staleTime
  const enabled = isShorthand
    ? true
    : ((arg as UseQueryProps<T>).enabled ?? true)
  const callbacks: QueryCallbacks<T> | undefined = isShorthand
    ? optionsArg
    : {
        onSuccess: (arg as UseQueryProps<T>).onSuccess,
        onError: (arg as UseQueryProps<T>).onError
      }

  const serializedKey = Array.isArray(key) ? key.join(':') : key

  const getInitialState = (): QueryState<T> => {
    const entry = queryStore.get(serializedKey)
    if (entry) {
      const isStale =
        staleTime != null && Date.now() - entry.timestamp > staleTime
      if (!isStale)
        return { data: entry.data as T, loading: false, error: null }
    }
    return { data: null, loading: enabled, error: null }
  }

  const [state, setState] = useState<QueryState<T>>(getInitialState)

  const callbacksRef = useRef(callbacks)
  const queryFnRef = useRef(queryFn)

  useLayoutEffect(() => {
    callbacksRef.current = callbacks
    queryFnRef.current = queryFn
  })

  const execute = useCallback(
    async (force = false) => {
      if (!enabled && !force) return

      const entry = queryStore.get(serializedKey)
      if (!force && entry) {
        const isStale =
          staleTime != null && Date.now() - entry.timestamp > staleTime
        if (!isStale) {
          setState({ data: entry.data as T, loading: false, error: null })
          return
        }
      }

      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const data = await queryFnRef.current()
        queryStore.set(serializedKey, { data, timestamp: Date.now() })
        setState({ data, loading: false, error: null })
        callbacksRef.current?.onSuccess?.(data)
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setState((prev) => ({ ...prev, loading: false, error }))
        callbacksRef.current?.onError?.(error)
      }
    },
    [serializedKey, staleTime, enabled]
  )

  const refetch = useCallback(() => execute(true), [execute])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    execute(false)
  }, [execute])

  return [state, refetch]
}

export type { UseQueryProps, UseQueryReturn, QueryState, QueryCallbacks }
export default useQuery
