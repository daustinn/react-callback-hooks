import { useState } from 'react'
import { useWindowSize } from 'react-callback-hooks'
import Card from './card'

export default function UseWindowSizeDemo() {
  const [windowLog, setWindowLog] = useState<string | null>(null)
  const [boxLog, setBoxLog] = useState<string | null>(null)

  const [windowSize] = useWindowSize((size) => {
    setWindowLog(`${Math.round(size.width)} x ${Math.round(size.height)}`)
    setTimeout(() => setWindowLog(null), 1500)
  })

  const [boxSize, boxRef] = useWindowSize<HTMLDivElement>((size) => {
    setBoxLog(`${Math.round(size.width)} x ${Math.round(size.height)}`)
    setTimeout(() => setBoxLog(null), 1500)
  })

  return (
    <Card>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="opacity-50">Window Size</span>
            <span className="opacity-40">
              {windowLog ? `Resized: ${windowLog}` : 'Resize browser window'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-foreground/5 rounded-xl p-2.5 text-center">
              <span className="opacity-50 block">Width</span>
              <span className="text-base font-semibold">
                {Math.round(windowSize.width)}
              </span>
              <span className="opacity-40 ml-1">px</span>
            </div>
            <div className="bg-foreground/5 rounded-xl p-2.5 text-center">
              <span className="opacity-50 block">Height</span>
              <span className="text-base font-semibold">
                {Math.round(windowSize.height)}
              </span>
              <span className="opacity-40 ml-1">px</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-foreground/10!">
          <div className="flex items-center justify-between">
            <span className="opacity-50">Element Size (via Ref)</span>
            <span className="opacity-40">
              {boxLog ? `Resized: ${boxLog}` : 'Drag corner to resize'}
            </span>
          </div>
          <div
            ref={boxRef}
            className="w-full h-24 overflow-auto resize border border-dashed border-foreground/20 rounded-xl p-3 flex flex-col items-center justify-center bg-foreground/3"
          >
            <span className="font-medium">
              {Math.round(boxSize.width)}px × {Math.round(boxSize.height)}px
            </span>
            <span className="text-[10px] opacity-30 mt-0.5">
              Resizable container
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
