import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'

const DEFAULT_DELAY = 500
const DEFAULT_ON_DEBOUNCED = () => {}
const DEFAULT_ON_CHANGE = () => {}
const DEFAULT_DEFAULT_VALUE = undefined

type Callback<T> = (value: T) => void

/** Props for the object form of `useDebounce`. */
type UseDebounceProps<T> = {
  /** Debounce delay in milliseconds. @default 500 */
  delay?: number
  /** Called once the debounce delay elapses without a new value. */
  onDebounced?: Callback<T>
  /** Called immediately on every `setValue` call, before debouncing. */
  onChange?: Callback<T>
  /** Initial value for both the immediate and debounced state. @default undefined */
  defaultValue?: T
}

/**
 * Return tuple: `[debouncedValue, setValue, immediateValue]`
 * - `debouncedValue` — updated only after the delay expires.
 * - `setValue` — call this to update the value and restart the timer.
 * - `immediateValue` — the raw, un-debounced value (useful for controlled inputs).
 */
type UseDebounceReturn<T> = [
  T | undefined,
  setValue: (e: T) => void,
  value: T | undefined
]

/**
 * Shorthand form — pass a callback and optional delay.
 * @param callback Fired after `delay` ms with no new value.
 * @param delay Debounce delay in ms. @default 500
 * @returns `[debouncedValue, setValue, immediateValue]`
 */
function useDebounce<T = string>(
  callback?: Callback<T>,
  delay?: number
): UseDebounceReturn<T>

/**
 * Object form — full configuration.
 * @param props `UseDebounceProps<T>`
 * @returns `[debouncedValue, setValue, immediateValue]`
 */
function useDebounce<T = string>(
  props?: UseDebounceProps<T>
): UseDebounceReturn<T>

function useDebounce<T = string>(
  arg1?: Callback<T> | UseDebounceProps<T>,
  arg2?: number
): UseDebounceReturn<T> {
  const isCallback = typeof arg1 === 'function'

  const delay = isCallback
    ? (arg2 ?? DEFAULT_DELAY)
    : (arg1?.delay ?? DEFAULT_DELAY)

  const onDebounced = isCallback
    ? arg1
    : (arg1?.onDebounced ?? DEFAULT_ON_DEBOUNCED)

  const onChange = isCallback
    ? DEFAULT_ON_CHANGE
    : (arg1?.onChange ?? DEFAULT_ON_CHANGE)

  const defaultValue = isCallback
    ? DEFAULT_DEFAULT_VALUE
    : (arg1?.defaultValue ?? DEFAULT_DEFAULT_VALUE)

  const [value, setValue] = useState<T | undefined>(defaultValue)

  const [debouncedValue, setDebouncedValue] = useState<T | undefined>(
    defaultValue
  )

  const callbacksRef = useRef({ onDebounced, onChange })

  useLayoutEffect(() => {
    callbacksRef.current = { onDebounced, onChange }
  })

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const didMount = useRef(false)

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (value !== undefined) {
      timeoutRef.current = setTimeout(() => {
        callbacksRef.current.onDebounced?.(value)
        setDebouncedValue(value)
      }, delay)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [value, delay])

  const setValueCallback = useCallback((value: T) => {
    setValue(value)
    callbacksRef.current.onChange?.(value)
  }, [])

  return [debouncedValue, setValueCallback, value]
}

export default useDebounce
