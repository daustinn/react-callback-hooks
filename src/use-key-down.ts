import { useEffect, useLayoutEffect, useRef } from 'react'

type KeyDownCallback<K extends string = string> = (
  event: KeyboardEvent,
  key: K
) => void

/** Props for the object form of `useKeyDown`. */
type UseKeyDownObjectProps<K extends string = string> = {
  /** Called when a registered key combo is pressed. Receives the event and matched key string. */
  onKeyDown?: KeyDownCallback<K>
  /** If `true`, calls `event.preventDefault()` for matched combos. @default false */
  preventDefault?: boolean
}

const isMac =
  typeof navigator !== 'undefined' && /mac/i.test(navigator.userAgent)

type KeyCombo = {
  key: string
  ctrl: boolean
  shift: boolean
  alt: boolean
  meta: boolean
}

function parseKeyCombo(combo: string): KeyCombo {
  const parts = combo
    .toLowerCase()
    .split('+')
    .map((s) => s.trim())

  const keyCombo: KeyCombo = {
    key: '',
    ctrl: false,
    shift: false,
    alt: false,
    meta: false
  }

  for (const part of parts) {
    // Cross-platform aliases
    if (part === 'ctrlorcmd' || part === 'cmdorctrl') {
      if (isMac) keyCombo.meta = true
      else keyCombo.ctrl = true
    } else if (part === 'altorcmd' || part === 'cmdoralt') {
      if (isMac) keyCombo.meta = true
      else keyCombo.alt = true
    } else if (part === 'ctrloralt' || part === 'altorctrl') {
      if (isMac) keyCombo.ctrl = true
      else keyCombo.alt = true
    } else if (part === 'ctrl' || part === 'control') {
      keyCombo.ctrl = true
    } else if (part === 'shift') {
      keyCombo.shift = true
    } else if (part === 'alt' || part === 'opt' || part === 'option') {
      keyCombo.alt = true
    } else if (part === 'meta' || part === 'cmd' || part === 'command') {
      keyCombo.meta = true
    } else {
      keyCombo.key = part
    }
  }

  return keyCombo
}

function matchesKeyCombo(event: KeyboardEvent, combo: KeyCombo): boolean {
  const keyMatches =
    combo.key === ''
      ? true
      : combo.key === 'space'
        ? event.key === ' ' || event.code.toLowerCase() === 'space'
        : event.key.toLowerCase() === combo.key ||
          event.code.toLowerCase() === combo.key

  const modifiersMatch =
    event.ctrlKey === combo.ctrl &&
    event.shiftKey === combo.shift &&
    event.altKey === combo.alt &&
    event.metaKey === combo.meta

  return keyMatches && modifiersMatch
}

type Props<K extends string = string> =
  KeyDownCallback<K> | UseKeyDownObjectProps<K>

/**
 * Listens for `keydown` events matching the specified key combo(s).
 * Attach the returned `ref` to an element to scope listening to it; omit it to listen globally on `window`.
 *
 * Key combos support modifiers: `ctrl`, `shift`, `alt`, `meta`, `cmd`, `ctrlOrCmd`, `altOrCmd`.
 * Examples: `'s'`, `'ctrl+s'`, `'ctrlOrCmd+shift+k'`, `'space'`.
 *
 * @param keys A single key combo string or an array of combos (use `defineKeys` for type inference).
 * @param props A callback `(event, key) => void` or `UseKeyDownObjectProps`.
 * @returns A `RefObject<T>` — attach to an element to scope the listener, or leave unattached for window-level listening.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useKeyDown<const K extends string, T extends HTMLElement = any>(
  keys: K | readonly K[],
  props?: Props<K>
): React.RefObject<T> {
  const ref = useRef<T>(null)

  const propsRef = useRef(props)
  const keysRef = useRef(keys)

  useLayoutEffect(() => {
    propsRef.current = props
    keysRef.current = keys
  })

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const currentKeys = keysRef.current
      const currentProps = propsRef.current

      const keysArray: readonly string[] = Array.isArray(currentKeys)
        ? currentKeys
        : [currentKeys as string]

      const isFunction = typeof currentProps === 'function'
      const onKeyDown = isFunction ? currentProps : currentProps?.onKeyDown
      const shouldPreventDefault =
        !isFunction && (currentProps?.preventDefault ?? false)

      for (let i = 0; i < keysArray.length; i++) {
        const combo = parseKeyCombo(keysArray[i])
        const matched = matchesKeyCombo(event, combo)

        if (matched) {
          if (shouldPreventDefault) event.preventDefault()
          onKeyDown?.(event, keysArray[i] as K)
          break
        }
      }
    }

    const element = ref.current ?? window
    element.addEventListener('keydown', handler)
    return () => element.removeEventListener('keydown', handler)
  }, [])

  return ref
}

/**
 * Helper to define a typed tuple of key combos with full TypeScript inference.
 * @example const KEYS = defineKeys(['ctrl+s', 'ctrl+z'] as const)
 */
function defineKeys<const K extends string>(keys: readonly K[]): readonly K[] {
  return keys
}

export { defineKeys }
export default useKeyDown
