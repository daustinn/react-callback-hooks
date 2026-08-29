import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type EffectiveType = '2g' | '3g' | '4g' | 'slow-2g'

type NetworkConnection = {
  effectiveType?: EffectiveType
  downlink?: number
  rtt?: number
  saveData?: boolean
  addEventListener: (type: string, listener: () => void) => void
  removeEventListener: (type: string, listener: () => void) => void
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkConnection
}

/** Current network state snapshot. */
type NetworkState = {
  /** `true` when the browser reports being online. */
  online: boolean
  /** Effective connection type reported by the Network Information API. */
  effectiveType?: EffectiveType
  /** Estimated downlink bandwidth in Mb/s. */
  downlink?: number
  /** Estimated round-trip time in ms. */
  rtt?: number
  /** `true` when the user has requested reduced data usage. */
  saveData?: boolean
}

/** Props for the object form of `useNetworkState`. */
type UseNetworkStateProps = {
  /** Called whenever the network state changes (online/offline or connection quality). */
  onChange?: (state: NetworkState) => void
  /** Called when the browser goes online. */
  onOnline?: (state: NetworkState) => void
  /** Called when the browser goes offline. */
  onOffline?: (state: NetworkState) => void
}

function readNetworkState(): NetworkState {
  if (typeof navigator === 'undefined') return { online: true }
  const connection = (navigator as NavigatorWithConnection).connection
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
    saveData: connection?.saveData
  }
}

function useNetworkState(callback?: (state: NetworkState) => void): NetworkState

function useNetworkState(props: UseNetworkStateProps): NetworkState

function useNetworkState(
  arg?: ((state: NetworkState) => void) | UseNetworkStateProps
): NetworkState {
  const isCallback = typeof arg === 'function'

  const [state, setState] = useState<NetworkState>(readNetworkState)

  const callbacksRef = useRef({
    onChange: isCallback ? arg : arg?.onChange,
    onOnline: isCallback ? undefined : arg?.onOnline,
    onOffline: isCallback ? undefined : arg?.onOffline
  })

  useLayoutEffect(() => {
    callbacksRef.current = {
      onChange: isCallback
        ? (arg as (state: NetworkState) => void)
        : (arg as UseNetworkStateProps)?.onChange,
      onOnline: isCallback
        ? undefined
        : (arg as UseNetworkStateProps)?.onOnline,
      onOffline: isCallback
        ? undefined
        : (arg as UseNetworkStateProps)?.onOffline
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const update = (online: boolean) => {
      const next = readNetworkState()
      setState(next)
      callbacksRef.current.onChange?.(next)
      if (online) {
        callbacksRef.current.onOnline?.(next)
      } else {
        callbacksRef.current.onOffline?.(next)
      }
    }

    const handleOnline = () => update(true)
    const handleOffline = () => update(false)
    const handleConnectionChange = () => update(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const connection = (navigator as NavigatorWithConnection).connection
    connection?.addEventListener('change', handleConnectionChange)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      connection?.removeEventListener('change', handleConnectionChange)
    }
  }, [])

  return state
}

export type { NetworkState, UseNetworkStateProps, EffectiveType }
export default useNetworkState
