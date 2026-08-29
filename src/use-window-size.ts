import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/** Width and height in pixels. */
type WindowSize = {
  /** Current width in pixels. */
  width: number
  /** Current height in pixels. */
  height: number
}

type WindowSizeCallback = (size: WindowSize) => void

/** Props for the object form of `useWindowSize`. */
type UseWindowSizeProps = {
  /** Called whenever the window (or observed element) is resized. Alias: `onResize`. */
  onChange?: WindowSizeCallback
  /** Alias for `onChange`. */
  onResize?: WindowSizeCallback
}

/**
 * Return tuple: `[size, ref]`
 * - `size` — `{ width, height }` in pixels.
 * - `ref` — optional ref to observe a specific element; if unattached, tracks `window`.
 */
type UseWindowSizeReturn<T extends HTMLElement> = [
  size: WindowSize,
  ref: React.RefObject<T>
]

function getWindowSize(): WindowSize {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

/**
 * Shorthand form — optional callback fired on resize.
 * @param callback Called with `{ width, height }` on every resize.
 * @returns `[size, ref]`
 */
function useWindowSize<T extends HTMLElement = HTMLElement>(
  callback?: WindowSizeCallback
): UseWindowSizeReturn<T>

/**
 * Object form — configure `onChange` / `onResize` callback.
 * @param props `UseWindowSizeProps`
 * @returns `[size, ref]`
 */
function useWindowSize<T extends HTMLElement = HTMLElement>(
  props: UseWindowSizeProps
): UseWindowSizeReturn<T>

function useWindowSize<T extends HTMLElement = HTMLElement>(
  arg?: WindowSizeCallback | UseWindowSizeProps
): UseWindowSizeReturn<T> {
  const isCallback = typeof arg === 'function'

  const ref = useRef<T>(null)
  const [size, setSize] = useState<WindowSize>(getWindowSize)

  const callbacksRef = useRef({
    onChange: isCallback ? arg : (arg?.onChange ?? arg?.onResize)
  })

  useLayoutEffect(() => {
    callbacksRef.current = {
      onChange: isCallback
        ? (arg as WindowSizeCallback)
        : ((arg as UseWindowSizeProps)?.onChange ??
          (arg as UseWindowSizeProps)?.onResize)
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const element = ref.current

    if (element && typeof ResizeObserver !== 'undefined') {
      const rect = element.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })

      const observer = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (!entry) return
        const nextSize = {
          width: entry.contentRect.width,
          height: entry.contentRect.height
        }
        setSize(nextSize)
        callbacksRef.current.onChange?.(nextSize)
      })

      observer.observe(element)
      return () => observer.disconnect()
    }

    const handleResize = () => {
      const nextSize = getWindowSize()
      setSize(nextSize)
      callbacksRef.current.onChange?.(nextSize)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return [size, ref]
}

export type {
  WindowSize,
  WindowSizeCallback,
  UseWindowSizeProps,
  UseWindowSizeReturn
}
export default useWindowSize
