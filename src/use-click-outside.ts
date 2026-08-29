import { useEffect, useLayoutEffect, useRef } from 'react'

type ClickOutsideCallback = (event: MouseEvent | TouchEvent) => void

/** Props for the object form of `useClickOutside`. */
type UseClickOutsideProps = {
  /** Fired when a click or touch occurs outside the referenced element. */
  onClick: ClickOutsideCallback
  /** DOM events to listen for. @default ['mousedown', 'touchstart'] */
  events?: string[]
}

/**
 * Shorthand form — pass a callback directly.
 * @param callback Fired when a click/touch occurs outside the ref element.
 * @returns A `RefObject<T>` to attach to the element you want to monitor.
 */
function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  callback: ClickOutsideCallback
): React.RefObject<T>

/**
 * Object form — configure events and callback.
 * @param props `UseClickOutsideProps`
 * @returns A `RefObject<T>` to attach to the element you want to monitor.
 */
function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  props: UseClickOutsideProps
): React.RefObject<T>

function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  arg: ClickOutsideCallback | UseClickOutsideProps
): React.RefObject<T> {
  const isCallback = typeof arg === 'function'

  const ref = useRef<T>(null)

  const callbackRef = useRef<ClickOutsideCallback>(
    isCallback ? arg : arg.onClick
  )

  useLayoutEffect(() => {
    callbackRef.current = isCallback
      ? (arg as ClickOutsideCallback)
      : (arg as UseClickOutsideProps).onClick
  })

  useEffect(() => {
    const events = (!isCallback && (arg as UseClickOutsideProps).events) || [
      'mousedown',
      'touchstart'
    ]

    const handler = (event: Event) => {
      const el = ref.current
      if (!el || el.contains(event.target as Node)) return
      callbackRef.current(event as MouseEvent | TouchEvent)
    }

    events.forEach((e) => document.addEventListener(e, handler))
    return () => events.forEach((e) => document.removeEventListener(e, handler))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return ref
}

export type { UseClickOutsideProps, ClickOutsideCallback }
export default useClickOutside
