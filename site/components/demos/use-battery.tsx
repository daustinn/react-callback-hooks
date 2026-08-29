import { useState } from 'react'
import { useBattery } from 'react-callback-hooks'
import Card from './card'

export default function UseBattery() {
  const [log, setLog] = useState<string | null>(null)

  const battery = useBattery({
    onChargingChange: (charging) => {
      setLog(charging ? 'Charger connected' : 'Charger disconnected')
      setTimeout(() => setLog(null), 3000)
    },
    onLevelChange: (level) => {
      setLog(`Battery level: ${Math.round(level)}%`)
      setTimeout(() => setLog(null), 3000)
    }
  })

  if (battery.loading) {
    return (
      <Card className="min-h-30 grid place-content-center">
        <div className="p-4 opacity-50">Detecting battery status...</div>
      </Card>
    )
  }

  if (!battery.supported) {
    return (
      <Card className="min-h-30">
        <div className="p-4 space-y-1">
          <div className="flex items-center gap-2 font-medium">
            <span className="size-2 rounded-full bg-amber-400" />
            Battery API not supported
          </div>
          <div className="pt-6 opacity-50">
            The Battery Status API is only available in supported browsers (e.g.
            Chrome, Edge, Opera).
          </div>
        </div>
      </Card>
    )
  }

  const rows = [
    { label: 'level', value: `${Math.round(battery.level)}%` },
    { label: 'charging', value: battery.charging ? 'true' : 'false' },
    {
      label: 'chargingTime',
      value:
        battery.chargingTime === Infinity
          ? 'Infinity'
          : `${battery.chargingTime}s`
    },
    {
      label: 'dischargingTime',
      value:
        battery.dischargingTime === Infinity
          ? 'Infinity'
          : `${battery.dischargingTime}s`
    }
  ]

  return (
    <Card className="min-h-30">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${battery.charging ? 'bg-green-400' : 'bg-blue-400'}`}
          />
          <span className="text-sm font-medium">
            {battery.charging ? 'Charging' : 'On Battery'} (
            {Math.round(battery.level)}%)
          </span>
          <span className="ml-auto text-sm opacity-40">
            {log ?? 'Battery Status API'}
          </span>
        </div>

        <div className="bg-foreground/5 rounded-xl overflow-hidden">
          {rows.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between px-3 py-3 border-b border-foreground/9! last:border-0"
            >
              <span className="opacity-60 font-semibold">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
