import { useState } from 'react'
import { useKeyUp } from 'react-callback-hooks'
import Card from './card'

const keys = ['Q', 'W', 'E', 'A', 'S', 'D'] as const

type Key = (typeof keys)[number]

export default function UseKeyUpDemo() {
  const [lastKey, setLastKey] = useState<Key | null>(null)

  useKeyUp(keys, (_event, key) => {
    setLastKey(key)
    setTimeout(() => setLastKey(null), 800)
  })

  return (
    <Card>
      <div className="gap-2 items-center pt-10 text-lg mx-auto w-fit font-mono font-semibold [&>div]:flex [&>div]:gap-2 space-y-2">
        <div>
          <Key k="Q" lastKey={lastKey} />
          <Key k="W" lastKey={lastKey} />
          <Key k="E" lastKey={lastKey} />
        </div>
        <div className="pl-5">
          <Key k="A" lastKey={lastKey} />
          <Key k="S" lastKey={lastKey} />
          <Key k="D" lastKey={lastKey} />
        </div>
      </div>
      <p className="text-sm! text-center opacity-50 font-medium py-4 pb-6">
        {lastKey ? `Released: ${lastKey}` : 'Press and release a key'}
      </p>
    </Card>
  )
}

function Key({ k, lastKey }: { k: Key; lastKey: Key | null }) {
  return (
    <div
      data-active={lastKey === k ? '' : undefined}
      className="bg-foreground/10 size-14 grid place-content-center rounded-lg transition-all duration-150 select-none data-active:bg-foreground/20 data-active:scale-95"
    >
      {k}
    </div>
  )
}
