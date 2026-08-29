import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type BatteryEventKeys =
  | 'chargingchange'
  | 'levelchange'
  | 'chargingtimechange'
  | 'dischargingtimechange'

type SharedValue = {
  charging: boolean
  level: number
  chargingTime: number
  dischargingTime: number
}

interface BatteryManager extends EventTarget, SharedValue {
  addEventListener: (
    type: BatteryEventKeys,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) => void
  removeEventListener: (
    type: BatteryEventKeys,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions
  ) => void
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>
}

/** Props for `useBattery`. All callbacks are optional. */
export type UseBatteryProps = {
  /** Called when the charging status changes. Receives `charging` boolean and current `level` (0–100). */
  onChargingChange?: (
    charging: boolean,
    battery: Pick<BatteryManager, 'level'>
  ) => void
  /** Called once when the Battery API support is determined. `supported` is `false` when the API is unavailable. */
  onSupported?: (supported: boolean) => void
  /** Called when the battery level changes. Receives `level` (0–100) and current `charging` state. */
  onLevelChange?: (
    level: number,
    battery: Pick<BatteryManager, 'charging'>
  ) => void
  /** Called when the estimated time to full charge changes, in seconds. */
  onChargingTimeChange?: (
    chargingTime: number,
    battery: Pick<BatteryManager, 'level' | 'charging' | 'dischargingTime'>
  ) => void
  /** Called when the estimated time until the battery is empty changes, in seconds. */
  onDischargingTimeChange?: (
    dischargingTime: number,
    battery: Pick<BatteryManager, 'level' | 'charging' | 'chargingTime'>
  ) => void
}

/**
 * Union state returned by `useBattery`:
 * - `{ loading: true }` — waiting for the Battery API to respond.
 * - `{ loading: false, supported: true, charging, level, chargingTime, dischargingTime }` — API available.
 * - `{ loading: false, supported: false }` — Battery API not supported by the browser.
 */
export type BatteryState =
  | {
      loading: true
    }
  | ({
      loading: false
      supported: true
    } & SharedValue)
  | {
      loading: false
      supported: false
    }

export type UseBatteryReturn = BatteryState

/**
 * Tracks the device battery status using the Battery Status API.
 *
 * @param props Optional callbacks for charging, level, and time changes.
 * @returns `BatteryState` — discriminated union with `loading`, `supported`, `charging`, `level`, `chargingTime`, `dischargingTime`.
 *
 * @example
 * const state = useBattery({ onLevelChange: (level) => console.log(level) })
 * if (!state.loading && state.supported) console.log(state.level)
 */
export default function useBattery(props?: UseBatteryProps): UseBatteryReturn {
  const [batteryState, setBatteryState] = useState<BatteryState>({
    loading: true
  })

  const callbacksRef = useRef(props)

  useLayoutEffect(() => {
    callbacksRef.current = props
  })

  useEffect(() => {
    const isSupported =
      typeof navigator !== 'undefined' &&
      'getBattery' in navigator &&
      typeof (navigator as NavigatorWithBattery).getBattery === 'function'

    if (!isSupported) {
      callbacksRef.current?.onSupported?.(false)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBatteryState({
        loading: false,
        supported: false
      })
      return
    }

    let isMounted = true
    let batteryManager: BatteryManager | null = null

    const updateState = (bm: BatteryManager) => {
      setBatteryState({
        loading: false,
        supported: true,
        charging: bm.charging,
        level: bm.level * 100,
        chargingTime: bm.chargingTime,
        dischargingTime: bm.dischargingTime
      })
    }

    const handleChargingChange = () => {
      if (!batteryManager || !isMounted) return
      updateState(batteryManager)
      callbacksRef.current?.onChargingChange?.(batteryManager.charging, {
        level: batteryManager.level * 100
      })
    }

    const handleLevelChange = () => {
      if (!batteryManager || !isMounted) return
      updateState(batteryManager)
      callbacksRef.current?.onLevelChange?.(batteryManager.level * 100, {
        charging: batteryManager.charging
      })
    }

    const handleChargingTimeChange = () => {
      if (!batteryManager || !isMounted) return
      updateState(batteryManager)
      callbacksRef.current?.onChargingTimeChange?.(
        batteryManager.chargingTime,
        {
          level: batteryManager.level * 100,
          charging: batteryManager.charging,
          dischargingTime: batteryManager.dischargingTime
        }
      )
    }

    const handleDischargingTimeChange = () => {
      if (!batteryManager || !isMounted) return
      updateState(batteryManager)
      callbacksRef.current?.onDischargingTimeChange?.(
        batteryManager.dischargingTime,
        {
          level: batteryManager.level * 100,
          charging: batteryManager.charging,
          chargingTime: batteryManager.chargingTime
        }
      )
    }

    ;(navigator as NavigatorWithBattery).getBattery!()
      .then((bm) => {
        if (!isMounted) return

        batteryManager = bm
        callbacksRef.current?.onSupported?.(true)
        callbacksRef.current?.onChargingChange?.(bm.charging, {
          level: bm.level * 100
        })
        callbacksRef.current?.onLevelChange?.(bm.level * 100, {
          charging: bm.charging
        })

        updateState(bm)

        bm.addEventListener('chargingchange', handleChargingChange)
        bm.addEventListener('levelchange', handleLevelChange)
        bm.addEventListener('chargingtimechange', handleChargingTimeChange)
        bm.addEventListener(
          'dischargingtimechange',
          handleDischargingTimeChange
        )
      })
      .catch(() => {
        if (!isMounted) return
        callbacksRef.current?.onSupported?.(false)
        setBatteryState({
          loading: false,
          supported: false
        })
      })

    return () => {
      isMounted = false
      if (batteryManager) {
        batteryManager.removeEventListener(
          'chargingchange',
          handleChargingChange
        )
        batteryManager.removeEventListener('levelchange', handleLevelChange)
        batteryManager.removeEventListener(
          'chargingtimechange',
          handleChargingTimeChange
        )
        batteryManager.removeEventListener(
          'dischargingtimechange',
          handleDischargingTimeChange
        )
      }
    }
  }, [])

  return batteryState
}
