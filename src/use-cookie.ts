import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'

/** Custom serializer for non-JSON values stored in cookies. */
type Serializer<T> = {
  /** Deserializes the raw string from cookie into `T`. */
  read: (raw: string) => T
  /** Serializes the value into a string for cookie storage. */
  write: (value: T) => string
}

const defaultSerializer: Serializer<unknown> = {
  read: (raw: string) => {
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  },
  write: (value: unknown) => {
    return typeof value === 'string' ? value : JSON.stringify(value)
  }
}

type CookieSameSite = 'strict' | 'lax' | 'none' | 'Strict' | 'Lax' | 'None'

/** Attributes and options for configuring a cookie. */
type CookieAttributes = {
  /** Cookie expiration date (Date object), number of days (number), or date string. */
  expires?: Date | number | string
  /** Max age in seconds. */
  maxAge?: number
  /** Cookie path. @default '/' */
  path?: string
  /** Cookie domain. */
  domain?: string
  /** Secure flag (HTTPS only). */
  secure?: boolean
  /** SameSite policy ('strict' | 'lax' | 'none'). */
  sameSite?: CookieSameSite
  /** Partitioned cookie (CHIPS). */
  partitioned?: boolean
}

type OnChange<T> = (value: T | null) => void

/** Props for the object form of `useCookie`. */
type UseCookieProps<T> = CookieAttributes & {
  /** The cookie name. */
  name?: string
  /** Alias for `name`. */
  key?: string
  /** Value returned when the cookie does not exist. @default null */
  defaultValue?: T
  /** Custom serializer. @default JSON.parse / JSON.stringify fallback */
  serializer?: Serializer<T>
  /** Called on every value change or update. */
  onChange?: OnChange<T>
  /** Called when this cookie is removed via `remove()`. */
  onRemove?: () => void
  /** Called when all cookies are removed via `removeAll()`. */
  onRemoveAll?: () => void
}

/**
 * Return tuple: `[value, set, remove, removeAll]`
 * - `value` — current stored cookie value, or `null` when absent.
 * - `set(value, options)` — sets or updates the cookie, updates state, and fires `onChange`.
 * - `remove(options)` — deletes the cookie, resets to `defaultValue`, and fires `onRemove` and `onChange(null)`.
 * - `removeAll(options)` — deletes all accessible cookies, resets to `defaultValue`, and fires `onRemoveAll` and `onChange(null)`.
 */
type UseCookieReturn<T> = [
  value: T | null,
  set: (value: T, options?: CookieAttributes) => void,
  remove: (options?: CookieAttributes) => void,
  removeAll: (options?: CookieAttributes) => void
]

function getCookie<T = string>(
  name: string,
  serializer: Serializer<T> = defaultSerializer as Serializer<T>
): T | null {
  if (typeof document === 'undefined' || !name) return null
  const cookies = document.cookie ? document.cookie.split(';') : []
  const prefix = `${encodeURIComponent(name)}=`
  for (const cookie of cookies) {
    const trimmed = cookie.trim()
    if (trimmed.startsWith(prefix)) {
      const raw = decodeURIComponent(trimmed.slice(prefix.length))
      try {
        return serializer.read(raw)
      } catch {
        return raw as unknown as T
      }
    }
  }
  return null
}

function getAllCookieNames(): string[] {
  if (typeof document === 'undefined') return []
  const cookies = document.cookie ? document.cookie.split(';') : []
  const names: string[] = []
  for (const cookie of cookies) {
    const trimmed = cookie.trim()
    if (!trimmed) continue
    const eqIndex = trimmed.indexOf('=')
    const rawName = eqIndex === -1 ? trimmed : trimmed.slice(0, eqIndex)
    try {
      names.push(decodeURIComponent(rawName))
    } catch {
      names.push(rawName)
    }
  }
  return names
}

function setCookie<T = unknown>(
  name: string,
  value: T,
  options: CookieAttributes = {},
  serializer: Serializer<T> = defaultSerializer as Serializer<T>
): void {
  if (typeof document === 'undefined' || !name) return

  const serialized = serializer.write(value)
  let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(serialized)}`

  const path = options.path !== undefined ? options.path : '/'
  cookieStr += `; Path=${path}`

  if (options.domain) {
    cookieStr += `; Domain=${options.domain}`
  }

  if (options.maxAge !== undefined) {
    cookieStr += `; Max-Age=${options.maxAge}`
  } else if (options.expires !== undefined) {
    let expiresDate: Date
    if (options.expires instanceof Date) {
      expiresDate = options.expires
    } else if (typeof options.expires === 'number') {
      expiresDate =
        options.expires > 1e10
          ? new Date(options.expires)
          : new Date(Date.now() + options.expires * 864e5)
    } else {
      expiresDate = new Date(options.expires)
    }
    cookieStr += `; Expires=${expiresDate.toUTCString()}`
  }

  if (options.sameSite) {
    const s = options.sameSite.toLowerCase()
    const formattedSameSite =
      s === 'lax'
        ? 'Lax'
        : s === 'strict'
          ? 'Strict'
          : s === 'none'
            ? 'None'
            : options.sameSite
    cookieStr += `; SameSite=${formattedSameSite}`
  }

  if (options.secure || options.sameSite?.toLowerCase() === 'none') {
    cookieStr += '; Secure'
  }

  if (options.partitioned) {
    cookieStr += '; Partitioned'
  }

  document.cookie = cookieStr
}

function removeCookie(name: string, options: CookieAttributes = {}): void {
  if (typeof document === 'undefined' || !name) return
  setCookie(name, '', {
    ...options,
    expires: new Date(0),
    maxAge: 0
  })
}

function removeAllCookies(options: CookieAttributes = {}): void {
  if (typeof document === 'undefined') return
  const names = getAllCookieNames()
  for (const name of names) {
    removeCookie(name, options)
  }
}

/**
 * Shorthand form — cookie name + optional change callback.
 * @param name The cookie name.
 * @param onChange Called whenever the cookie value changes.
 * @returns `[value, set, remove, removeAll]`
 */
function useCookie<T = string>(
  name: string,
  onChange?: OnChange<T>
): UseCookieReturn<T>

/**
 * Object form — full configuration with default value, serializer, cookie attributes, and callbacks.
 * @param props `UseCookieProps<T>`
 * @returns `[value, set, remove, removeAll]`
 */
function useCookie<T = string>(props: UseCookieProps<T>): UseCookieReturn<T>

function useCookie<T = string>(
  arg: string | UseCookieProps<T>,
  callbackArg?: OnChange<T>
): UseCookieReturn<T> {
  const isShorthand = typeof arg === 'string'

  const name = isShorthand ? arg : (arg.name ?? arg.key ?? '')
  const defaultValue: T | null = isShorthand ? null : (arg.defaultValue ?? null)
  const serializer: Serializer<T> = isShorthand
    ? (defaultSerializer as Serializer<T>)
    : ((arg.serializer ?? defaultSerializer) as Serializer<T>)

  const defaultOptions: CookieAttributes = isShorthand
    ? { path: '/' }
    : {
        path: arg.path ?? '/',
        domain: arg.domain,
        expires: arg.expires,
        maxAge: arg.maxAge,
        secure: arg.secure,
        sameSite: arg.sameSite,
        partitioned: arg.partitioned
      }

  const [value, setValue] = useState<T | null>(() => {
    const initial = getCookie<T>(name, serializer)
    return initial !== null ? initial : defaultValue
  })

  const optionsRef = useRef(defaultOptions)

  const callbacksRef = useRef({
    onChange: isShorthand ? callbackArg : arg.onChange,
    onRemove: isShorthand ? undefined : arg.onRemove,
    onRemoveAll: isShorthand ? undefined : arg.onRemoveAll
  })

  useLayoutEffect(() => {
    optionsRef.current = defaultOptions
    callbacksRef.current = {
      onChange: isShorthand ? callbackArg : (arg as UseCookieProps<T>).onChange,
      onRemove: isShorthand ? undefined : (arg as UseCookieProps<T>).onRemove,
      onRemoveAll: isShorthand
        ? undefined
        : (arg as UseCookieProps<T>).onRemoveAll
    }
  })

  useEffect(() => {
    if (typeof document === 'undefined' || !name) return

    const stored = getCookie<T>(name, serializer)
    if (stored !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(stored)
    }

    const checkCookie = () => {
      const current = getCookie<T>(name, serializer)
      const nextValue = current !== null ? current : defaultValue
      setValue((prev) => {
        if (prev !== nextValue) {
          callbacksRef.current.onChange?.(nextValue)
          return nextValue
        }
        return prev
      })
    }

    window.addEventListener('focus', checkCookie)
    document.addEventListener('visibilitychange', checkCookie)

    return () => {
      window.removeEventListener('focus', checkCookie)
      document.removeEventListener('visibilitychange', checkCookie)
    }
  }, [name, defaultValue, serializer])

  const set = useCallback(
    (newValue: T, options?: CookieAttributes) => {
      try {
        const mergedOptions = { ...optionsRef.current, ...options }
        setCookie<T>(name, newValue, mergedOptions, serializer)
        setValue(newValue)
        callbacksRef.current.onChange?.(newValue)
        // eslint-disable-next-line no-empty
      } catch {}
    },
    [name, serializer]
  )

  const remove = useCallback(
    (options?: CookieAttributes) => {
      try {
        const mergedOptions = { ...optionsRef.current, ...options }
        removeCookie(name, mergedOptions)
        setValue(defaultValue)
        callbacksRef.current.onRemove?.()
        callbacksRef.current.onChange?.(null)
        // eslint-disable-next-line no-empty
      } catch {}
    },
    [name, defaultValue]
  )

  const removeAll = useCallback(
    (options?: CookieAttributes) => {
      try {
        const mergedOptions = { ...optionsRef.current, ...options }
        removeAllCookies(mergedOptions)
        setValue(defaultValue)
        callbacksRef.current.onRemoveAll?.()
        callbacksRef.current.onChange?.(null)
        // eslint-disable-next-line no-empty
      } catch {}
    },
    [defaultValue]
  )

  return [value, set, remove, removeAll]
}

export type {
  CookieAttributes,
  CookieSameSite,
  UseCookieProps,
  UseCookieReturn,
  Serializer
}
export { getCookie, setCookie, removeCookie, removeAllCookies }
export default useCookie
