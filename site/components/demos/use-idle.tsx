import { useState } from 'react'
import { useIdle } from 'react-callback-hooks'
import Card from './card'

export default function UseIdleDemo() {
  const [log, setLog] = useState<string[]>([])

  const push = (msg: string) =>
    setLog((prev) =>
      [`${new Date().toLocaleTimeString()} ${msg}`, ...prev].slice(0, 4)
    )

  const isIdle = useIdle(3000, {
    onIdle: () => push('went idle'),
    onActive: () => push('became active')
  })

  return (
    <Card>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span
            className={`size-2.5 rounded-full transition-colors ${isIdle ? 'bg-amber-400' : 'bg-green-400'}`}
          />
          <span className="font-medium">{isIdle ? 'Idle' : 'Active'}</span>
          <span className="ml-auto opacity-30">3s inactivity threshold</span>
        </div>

        <div className="bg-foreground/5 rounded-xl space-y-2 p-3 min-h-20">
          {log.length === 0 ? (
            <span className="opacity-30">
              Move your mouse or press a key...
            </span>
          ) : (
            log.map((entry, i) => (
              <div
                key={i}
                className={`transition-opacity ${i === 0 ? 'opacity-80' : 'opacity-30'}`}
              >
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
