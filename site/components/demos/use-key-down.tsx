import { useState } from 'react'
import { useKeyDown } from 'react-callback-hooks'
import Card from './card'

const keys = ['Q', 'W', 'E', 'A', 'S', 'D'] as const

type Key = (typeof keys)[number]

export default function UseKeyDownDemo() {
  const [activeKey, setActiveKey] = useState<Key | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useKeyDown(keys, (_event, key) => {
    setActiveKey(key)
    setTimeout(() => setActiveKey(null), 1000)
  })

  useKeyDown('CtrlOrCmd+B', (e) => {
    e.preventDefault()
    setSidebarOpen(!sidebarOpen)
  })

  return (
    <Card className="p-4 overflow-hidden">
      <div
        data-open={sidebarOpen ? '' : undefined}
        className="bg-foreground/7 left-2 absolute inset-y-2 rounded-2xl w-40 opacity-0 -translate-x-full transition-[opacity,translate] data-open:translate-x-0 data-open:opacity-100"
      />
      <div className="gap-2 items-center pt-10 text-lg mx-auto w-fit font-mono font-semibold [&>div]:flex [&>div]:gap-2 space-y-2">
        <div>
          <Key k="Q" activeKey={activeKey} />
          <Key k="W" activeKey={activeKey} />
          <Key k="E" activeKey={activeKey} />
        </div>
        <div className="pl-5">
          <Key k="A" activeKey={activeKey} />
          <Key k="S" activeKey={activeKey} />
          <Key k="D" activeKey={activeKey} />
        </div>
      </div>
      <div className="text-sm! mt-5 mb-3 text-center opacity-50 font-medium">
        {activeKey ? activeKey : 'Press an arrow key'}
        <br />
        Sidebar is {sidebarOpen ? 'open' : 'closed'} (CtrlOrCmd+B)
      </div>
    </Card>
  )
}

function Key({ k, activeKey }: { k: Key; activeKey: Key | null }) {
  return (
    <div
      data-active={activeKey === k ? '' : undefined}
      className="bg-foreground/10 size-14 grid place-content-center rounded-lg transition-all duration-150 select-none data-active:bg-foreground data-active:text-background"
    >
      {k}
    </div>
  )
}
