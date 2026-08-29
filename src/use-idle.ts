import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'

const DEFAULT_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'wheel',
  'pointermove'
]

/** Props for the object form of `useIdle`. */
type UseIdleProps = {
  /** Called when the user becomes idle (no activity for `timeout` ms). */
  onIdle?: () => void
  /** Called when the user resumes activity after being idle. */
  onActive?: () => void
  /** DOM events considered as user activity. @default ['mousemove','mousedown','keydown','touchstart','wheel','pointermove'] */
  events?: string[]
}

/**
 * Shorthand form — pass timeout and an optional idle callback.
 * @param timeout Inactivity duration in ms before the user is considered idle.
 * @param callback Fired when the user goes idle.
 * @returns `true` when idle, `false` when active.
 */
function useIdle(timeout: number, callback?: () => void): boolean
/**
 * Object form — configure idle/active callbacks and custom activity events.
 * @param timeout Inactivity duration in ms before the user is considered idle.
 * @param props `UseIdleProps`
 * @returns `true` when idle, `false` when active.
 */
function useIdle(timeout: number, props: UseIdleProps): boolean

function useIdle(timeout: number, arg?: (() => void) | UseIdleProps): boolean {
  const isCallback = typeof arg === 'function'

  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const callbacksRef = useRef({
    onIdle: isCallback ? arg : arg?.onIdle,
    onActive: isCallback ? undefined : arg?.onActive
  })

  useLayoutEffect(() => {
    callbacksRef.current = {
      onIdle: isCallback ? (arg as () => void) : (arg as UseIdleProps)?.onIdle,
      onActive: isCallback ? undefined : (arg as UseIdleProps)?.onActive
    }
  })

  const startTimer = useCallback(() => {
    if (timerRef.current != null) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsIdle(true)
      callbacksRef.current.onIdle?.()
    }, timeout)
  }, [timeout])

  useEffect(() => {
    const eventsToListen =
      (!isCallback && (arg as UseIdleProps)?.events) || DEFAULT_EVENTS

    const handleActivity = () => {
      setIsIdle((prev) => {
        if (prev) callbacksRef.current.onActive?.()
        return false
      })
      startTimer()
    }

    eventsToListen.forEach((e) =>
      window.addEventListener(e, handleActivity, { passive: true })
    )
    startTimer()

    return () => {
      eventsToListen.forEach((e) =>
        window.removeEventListener(e, handleActivity)
      )
      if (timerRef.current != null) clearTimeout(timerRef.current)
    }
  }, [startTimer]) // eslint-disable-line react-hooks/exhaustive-deps

  return isIdle
}

export type { UseIdleProps }
export default useIdle
