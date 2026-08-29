import { useState } from 'react'
import { useNetworkState } from 'react-callback-hooks'
import Card from './card'

export default function UseNetworkStateDemo() {
  const [log, setLog] = useState<string | null>(null)

  const state = useNetworkState({
    onOnline: () => {
      setLog('back online')
      setTimeout(() => setLog(null), 2000)
    },
    onOffline: () => {
      setLog('went offline')
      setTimeout(() => setLog(null), 2000)
    }
  })

  const rows: {
    label: string
    value: string | number | boolean | undefined
  }[] = [
    { label: 'online', value: state.online },
    { label: 'effectiveType', value: state.effectiveType },
    {
      label: 'downlink',
      value: state.downlink !== undefined ? `${state.downlink} Mbps` : undefined
    },
    {
      label: 'rtt',
      value: state.rtt !== undefined ? `${state.rtt} ms` : undefined
    },
    { label: 'saveData', value: state.saveData }
  ]

  return (
    <Card>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${state.online ? 'bg-green-400' : 'bg-red-400'}`}
          />
          <span className="font-semibold">
            {state.online ? 'Online' : 'Offline'}
          </span>
          <span className="ml-auto text-sm opacity-30">
            {log ?? 'Toggle network in DevTools to test callbacks'}
          </span>
        </div>

        <div className="bg-foreground/5 rounded-xl overflow-hidden">
          {rows.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between px-3 py-3 border-b border-foreground/15! last:border-0"
            >
              <span className="opacity-70 font-semibold">{label}</span>
              <span className="text-sm font-medium">
                {value === undefined ? (
                  <span className="opacity-25">—</span>
                ) : typeof value === 'boolean' ? (
                  value ? (
                    'true'
                  ) : (
                    'false'
                  )
                ) : (
                  String(value)
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
