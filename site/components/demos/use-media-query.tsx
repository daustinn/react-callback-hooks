import { useState } from 'react'
import { useMediaQuery } from 'react-callback-hooks'
import Card from './card'

const queries = [
  '(max-width: 768px)',
  '(prefers-color-scheme: dark)',
  '(prefers-reduced-motion: reduce)'
] as const

type Q = (typeof queries)[number]

const labels: Record<Q, string> = {
  '(max-width: 768px)': 'Mobile',
  '(prefers-color-scheme: dark)': 'Dark mode',
  '(prefers-reduced-motion: reduce)': 'Reduced motion'
}

export default function UseMediaQueryDemo() {
  const [log, setLog] = useState<string | null>(null)

  const mq = useMediaQuery(queries, (_event, query) => {
    setLog(`"${query}" matched`)
    setTimeout(() => setLog(null), 2000)
  })

  return (
    <Card>
      <div className="p-4 space-y-2">
        {queries.map((q) => (
          <div key={q} className="flex items-center justify-between gap-4">
            <span className="opacity-70">{labels[q]}</span>
            <span
              className={`font-medium px-2 py-0.5 rounded-full border transition-colors ${
                mq[q]
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-foreground/5 border-foreground/10 opacity-40'
              }`}
            >
              {mq[q] ? 'true' : 'false'}
            </span>
          </div>
        ))}
        <div className="opacity-40 min-h-4">{log ?? 'No matches'}</div>
      </div>
    </Card>
  )
}
