import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'

/** Custom serializer for non-JSON values stored in `localStorage`. */
type Serializer<T> = {
  /** Deserializes the raw string from storage into `T`. */
  read: (raw: string) => T
  /** Serializes the value into a string for storage. */
  write: (value: T) => string
}

const defaultSerializer: Serializer<unknown> = {
  read: (raw) => JSON.parse(raw),
  write: (value) => JSON.stringify(value)
}

type OnChange<T> = (value: T | null) => void

/** Props for the object form of `useLocalStorage`. */
type UseLocalStorageProps<T> = {
  /** The `localStorage` key. */
  key: string
  /** Value returned when the key does not exist in storage. @default null */
  defaultValue?: T
  /** Custom serializer. @default JSON.parse / JSON.stringify */
  serializer?: Serializer<T>
  /** Called on every value change, including cross-tab syncs via the `storage` event. */
  onChange?: OnChange<T>
  /** Called when the key is removed via `remove()` or `localStorage.clear()`. */
  onRemove?: () => void
}

/**
 * Return tuple: `[value, set, remove]`
 * - `value` — current stored value, or `null` when absent.
 * - `set(value)` — writes to `localStorage`, updates state, fires `onChange`.
 * - `remove()` — deletes the key, resets to `defaultValue`, fires `onRemove` and `onChange(null)`.
 */
type UseLocalStorageReturn<T> = [
  value: T | null,
  set: (value: T) => void,
  remove: () => void
]

function readFromStorage<T>(key: string, serializer: Serializer<T>): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw !== null ? serializer.read(raw) : null
  } catch {
    return null
  }
}

/**
 * Shorthand form — key + optional change callback.
 * @param key The `localStorage` key.
 * @param onChange Called whenever the value changes (including cross-tab).
 * @returns `[value, set, remove]`
 */
function useLocalStorage<T>(
  key: string,
  onChange?: OnChange<T>
): UseLocalStorageReturn<T>

function useLocalStorage<T>(
  props: UseLocalStorageProps<T>
): UseLocalStorageReturn<T>

function useLocalStorage<T>(
  arg: string | UseLocalStorageProps<T>,
  callbackArg?: OnChange<T>
): UseLocalStorageReturn<T> {
  const isShorthand = typeof arg === 'string'

  const key = isShorthand ? arg : arg.key
  const defaultValue: T | null = isShorthand ? null : (arg.defaultValue ?? null)
  const serializer: Serializer<T> = isShorthand
    ? (defaultSerializer as Serializer<T>)
    : ((arg.serializer ?? defaultSerializer) as Serializer<T>)

  const [value, setValue] = useState<T | null>(defaultValue)

  const callbacksRef = useRef({
    onChange: isShorthand ? callbackArg : arg.onChange,
    onRemove: isShorthand ? undefined : arg.onRemove
  })

  useLayoutEffect(() => {
    callbacksRef.current = {
      onChange: isShorthand
        ? callbackArg
        : (arg as UseLocalStorageProps<T>).onChange,
      onRemove: isShorthand
        ? undefined
        : (arg as UseLocalStorageProps<T>).onRemove
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = readFromStorage(key, serializer)
    if (stored !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(stored)
    }

    const handler = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return
      if (event.key !== key && event.key !== null) return

      if (event.key === null || event.newValue === null) {
        setValue(defaultValue)
        callbacksRef.current.onRemove?.()
        callbacksRef.current.onChange?.(null)
        return
      }

      try {
        const parsed = serializer.read(event.newValue)
        setValue(parsed)
        callbacksRef.current.onChange?.(parsed)
      } catch {
        setValue(null)
        callbacksRef.current.onChange?.(null)
      }
    }

    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = useCallback(
    (newValue: T) => {
      try {
        window.localStorage.setItem(key, serializer.write(newValue))
        setValue(newValue)
        callbacksRef.current.onChange?.(newValue)
        // eslint-disable-next-line no-empty
      } catch {}
    },
    [key, serializer]
  )

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setValue(defaultValue)
      callbacksRef.current.onRemove?.()
      callbacksRef.current.onChange?.(null)
      // eslint-disable-next-line no-empty
    } catch {}
  }, [key, defaultValue])

  return [value, set, remove]
}

export type { UseLocalStorageProps, UseLocalStorageReturn, Serializer }
export default useLocalStorage
