import { useCallback, useLayoutEffect, useRef, useState } from 'react'

/** Current state of a mutation. */
type MutationState<T> = {
  /** Resolved data, or `null` before the first successful call. */
  data: T | null
  /** `true` while an async mutation is in flight. */
  loading: boolean
  /** Last error, or `null` if the last call succeeded. */
  error: Error | null
}

/** Lifecycle callbacks for `useMutation`. */
type MutationCallbacks<T, V> = {
  /** Called with the resolved data and original variables after a successful mutation. */
  onSuccess?: (data: T, variables: V) => void
  /** Called with the error and original variables when the mutation rejects. */
  onError?: (error: Error, variables: V) => void
}

/** Props for the object form of `useMutation`. */
type UseMutationProps<T, V> = MutationCallbacks<T, V> & {
  /** Async function that performs the mutation. Receives `variables` and returns a `Promise<T>`. */
  mutationFn: (variables: V) => Promise<T>
}

/**
 * Return tuple: `[mutate, state]`
 * - `mutate(variables)` — triggers the mutation.
 * - `state.data` — resolved data.
 * - `state.loading` — `true` while in flight.
 * - `state.error` — last error or `null`.
 * - `state.reset()` — clears data, loading, and error back to initial state.
 */
type UseMutationReturn<T, V> = [
  mutate: (variables: V) => Promise<void>,
  state: MutationState<T> & { reset: () => void }
]

/**
 * Shorthand form — pass the async function and optional callbacks separately.
 * @param mutationFn Async function `(variables: V) => Promise<T>`.
 * @param callbacks Optional `onSuccess` / `onError` callbacks.
 * @returns `[mutate, state]`
 */
function useMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  callbacks?: MutationCallbacks<T, V>
): UseMutationReturn<T, V>

/**
 * Object form — bundle function and callbacks into a single props object.
 * @param props `UseMutationProps<T, V>`
 * @returns `[mutate, state]`
 */
function useMutation<T, V = void>(
  props: UseMutationProps<T, V>
): UseMutationReturn<T, V>

function useMutation<T, V = void>(
  arg: ((variables: V) => Promise<T>) | UseMutationProps<T, V>,
  callbacksArg?: MutationCallbacks<T, V>
): UseMutationReturn<T, V> {
  const isShorthand = typeof arg === 'function'

  const mutationFn = isShorthand
    ? arg
    : (arg as UseMutationProps<T, V>).mutationFn
  const callbacks: MutationCallbacks<T, V> | undefined = isShorthand
    ? callbacksArg
    : {
        onSuccess: (arg as UseMutationProps<T, V>).onSuccess,
        onError: (arg as UseMutationProps<T, V>).onError
      }

  const [state, setState] = useState<MutationState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const callbacksRef = useRef(callbacks)
  const mutationFnRef = useRef(mutationFn)

  useLayoutEffect(() => {
    callbacksRef.current = callbacks
    mutationFnRef.current = mutationFn
  })

  const mutate = useCallback(async (variables: V) => {
    setState({ data: null, loading: true, error: null })
    try {
      const data = await mutationFnRef.current(variables)
      setState({ data, loading: false, error: null })
      callbacksRef.current?.onSuccess?.(data, variables)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setState((prev) => ({ ...prev, loading: false, error }))
      callbacksRef.current?.onError?.(error, variables)
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return [mutate, { ...state, reset }]
}

export type {
  UseMutationProps,
  UseMutationReturn,
  MutationState,
  MutationCallbacks
}
export default useMutation
