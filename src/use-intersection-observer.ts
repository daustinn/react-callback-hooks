import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type IntersectionCallback = (entry: IntersectionObserverEntry) => void

/** Props for the object form of `useIntersectionObserver`. */
type UseIntersectionObserverProps = {
  /** Called when the element enters the viewport. */
  onEnter?: IntersectionCallback
  /** Called when the element leaves the viewport. */
  onLeave?: IntersectionCallback
  /** Intersection ratio threshold(s) that trigger the observer. @default 0 */
  threshold?: number | number[]
  /** Margin around the root. @default '0px' */
  rootMargin?: string
  /** Custom scroll container. @default null (viewport) */
  root?: Element | Document | null
  /** If `true`, the observer disconnects after the first intersection. @default false */
  once?: boolean
}

/**
 * Return tuple: `[ref, isIntersecting]`
 * - `ref` — attach to the element you want to observe.
 * - `isIntersecting` — `true` when the element is inside the viewport/root.
 */
type UseIntersectionObserverReturn<T extends HTMLElement> = [
  ref: React.RefObject<T>,
  isIntersecting: boolean
]

/**
 * Shorthand form — fires a single callback on every intersection change.
 * @param callback Called on every intersection change with the `IntersectionObserverEntry`.
 * @returns `[ref, isIntersecting]`
 */
function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  callback: IntersectionCallback
): UseIntersectionObserverReturn<T>

/**
 * Object form — separate `onEnter`/`onLeave` callbacks with full IntersectionObserver options.
 * @param props `UseIntersectionObserverProps`
 * @returns `[ref, isIntersecting]`
 */
function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  props: UseIntersectionObserverProps
): UseIntersectionObserverReturn<T>

function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  arg: IntersectionCallback | UseIntersectionObserverProps
): UseIntersectionObserverReturn<T> {
  const isCallback = typeof arg === 'function'

  const threshold = isCallback ? 0 : (arg.threshold ?? 0)
  const rootMargin = isCallback ? '0px' : (arg.rootMargin ?? '0px')
  const once = isCallback ? false : (arg.once ?? false)

  const ref = useRef<T>(null)
  const rootRef = useRef(isCallback ? null : (arg.root ?? null))
  const [isIntersecting, setIsIntersecting] = useState(false)

  const callbacksRef = useRef({
    onEnter: isCallback
      ? (arg as IntersectionCallback)
      : (arg as UseIntersectionObserverProps).onEnter,
    onLeave: isCallback
      ? undefined
      : (arg as UseIntersectionObserverProps).onLeave
  })

  useLayoutEffect(() => {
    callbacksRef.current = {
      onEnter: isCallback
        ? (arg as IntersectionCallback)
        : (arg as UseIntersectionObserverProps).onEnter,
      onLeave: isCallback
        ? undefined
        : (arg as UseIntersectionObserverProps).onLeave
    }
    if (!isCallback) {
      rootRef.current = (arg as UseIntersectionObserverProps).root ?? null
    }
  })

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        setIsIntersecting(entry.isIntersecting)

        if (isCallback) {
          callbacksRef.current.onEnter?.(entry)
        } else if (entry.isIntersecting) {
          callbacksRef.current.onEnter?.(entry)
          if (once) observer.disconnect()
        } else {
          callbacksRef.current.onLeave?.(entry)
        }
      },
      {
        threshold,
        rootMargin,
        root: rootRef.current
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once, isCallback])

  return [ref, isIntersecting]
}

export type { UseIntersectionObserverProps, UseIntersectionObserverReturn }
export default useIntersectionObserver
