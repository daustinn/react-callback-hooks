import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type MediaQueryCallback<Q extends string> = (
  event: MediaQueryListEvent,
  query: Q
) => void

/** `boolean` — matches single-query form. */
type SingleReturn = boolean

/** `Record<Q, boolean>` — matches multi-query form, keyed by each query string. */
type MultiReturn<Q extends string> = Record<Q, boolean>

/**
 * Single-query form — returns a `boolean` that is `true` when the query matches.
 * @param query A CSS media query string, e.g. `'(max-width: 768px)'`.
 * @param callback Optional. Called whenever the query match state changes.
 * @returns `true` when the query matches, `false` otherwise.
 */
function useMediaQuery<Q extends string>(
  query: Q,
  callback?: MediaQueryCallback<Q>
): SingleReturn

/**
 * Multi-query form — returns a `Record<Q, boolean>` keyed by each query string.
 * @param queries An array of CSS media query strings.
 * @param callback Optional. Called whenever any query match state changes.
 * @returns An object mapping each query string to its current match state.
 */
function useMediaQuery<const Q extends string>(
  queries: readonly Q[],
  callback?: MediaQueryCallback<Q>
): MultiReturn<Q>

function useMediaQuery<const Q extends string>(
  queryOrQueries: Q | readonly Q[],
  callback?: MediaQueryCallback<Q>
): SingleReturn | MultiReturn<Q> {
  const isArray = Array.isArray(queryOrQueries)

  const getInitialState = (): boolean | Record<string, boolean> => {
    if (typeof window === 'undefined') {
      return isArray
        ? Object.fromEntries(
            (queryOrQueries as readonly Q[]).map((q) => [q, false])
          )
        : false
    }

    if (isArray) {
      return Object.fromEntries(
        (queryOrQueries as readonly Q[]).map((q) => [
          q,
          window.matchMedia(q).matches
        ])
      )
    }

    return window.matchMedia(queryOrQueries as Q).matches
  }

  const [state, setState] = useState<boolean | Record<string, boolean>>(
    getInitialState
  )

  const callbackRef = useRef(callback)
  const queryRef = useRef(queryOrQueries)

  useLayoutEffect(() => {
    callbackRef.current = callback
    queryRef.current = queryOrQueries
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const queries: readonly Q[] = Array.isArray(queryRef.current)
      ? (queryRef.current as readonly Q[])
      : ([queryRef.current] as readonly Q[])

    const mqls = queries.map((q) => window.matchMedia(q))

    const handlers = mqls.map((mql, index) => {
      const query = queries[index]

      const handler = (event: MediaQueryListEvent) => {
        if (Array.isArray(queryRef.current)) {
          setState((prev) => ({
            ...(prev as Record<string, boolean>),
            [query]: event.matches
          }))
        } else {
          setState(event.matches)
        }

        if (event.matches) {
          callbackRef.current?.(event, query)
        }
      }

      mql.addEventListener('change', handler)
      return handler
    })

    return () => {
      mqls.forEach((mql, i) => mql.removeEventListener('change', handlers[i]))
    }
  }, [])

  return state as SingleReturn | MultiReturn<Q>
}

export default useMediaQuery
