import { useState } from 'react'
import { useCache } from 'react-callback-hooks'
import Card from './card'

const ITEMS = ['session', 'token', 'user', 'locale', 'theme'] as const
type Item = (typeof ITEMS)[number]

export default function UseCacheDemo() {
  const [log, setLog] = useState<string | null>(null)

  const cache = useCache<Item, string>({
    ttl: 5000,
    onSet: (key, value) => console.log('set', key, value),
    onExpire: (key) => {
      setLog(`"${key}" expired`)
      setTimeout(() => setLog(null), 1500)
    },
    onDelete: (key) => console.log('deleted', key)
  })

  return (
    <Card>
      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {ITEMS.map((key) => (
            <button
              key={key}
              onClick={() => cache.set(key, `${key}_value`)}
              className={`px-4 font-semibold capitalize py-1.5 rounded-full border ${
                cache.has(key)
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-foreground/5 border-foreground/10 hover:bg-foreground/10'
              }`}
            >
              {key}
            </button>
          ))}
          <button
            onClick={() => cache.clear()}
            disabled={cache.size === 0}
            className="ml-auto px-3 py-1 rounded-full border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-all disabled:opacity-20 disabled:pointer-events-none"
          >
            Clear
          </button>
        </div>

        <div className="bg-foreground/5 rounded-lg px-3 py-2 min-h-9 flex flex-wrap gap-x-3 gap-y-1 items-center">
          {cache.size === 0 ? (
            <span className="opacity-30">empty</span>
          ) : (
            Array.from(cache.entries).map(([k, v]) => (
              <span key={k} className="opacity-70">
                <span className="opacity-50">{k}:</span> {v}
              </span>
            ))
          )}
        </div>

        <div className="text-sm opacity-30 min-h-4">
          {log ?? 'Click a key to cache it — entries expire after 5s.'}
        </div>
      </div>
    </Card>
  )
}
