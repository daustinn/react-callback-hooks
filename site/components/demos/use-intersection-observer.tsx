import { useState } from 'react'
import { useIntersectionObserver } from 'react-callback-hooks'
import Card from './card'

export default function UseIntersectionObserverDemo() {
  const [count, setCount] = useState(0)

  const [targetRef, isIntersecting] = useIntersectionObserver<HTMLDivElement>({
    onEnter: () => setCount((n) => n + 1),
    threshold: 0.5
  })

  return (
    <Card>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="opacity-50">Scroll down inside the box</span>
          <span
            className={`px-3 py-1 rounded-full border font-medium transition-colors ${
              isIntersecting
                ? 'bg-foreground text-background border-foreground!'
                : 'bg-foreground/5 border-foreground/10 opacity-50'
            }`}
          >
            {isIntersecting ? 'visible' : 'hidden'}
          </span>
        </div>

        <div className="h-60 overflow-y-auto border border-foreground/10! rounded-2xl">
          <div className="h-60 flex items-center justify-center opacity-40">
            scroll down
          </div>
          <div
            ref={targetRef}
            className={`mx-4 mb-4 h-25 rounded-xl border flex items-center justify-center font-medium transition-all duration-300 ${
              isIntersecting
                ? 'bg-foreground text-background border-foreground!'
                : 'bg-foreground/5 border-foreground/10 opacity-40'
            }`}
          >
            target · entered {count}x
          </div>
          <div className="mt-3 h-60 grid place-content-center text-sm opacity-30">
            {isIntersecting ? 'target is visible' : 'target is hidden'}
          </div>
        </div>
      </div>
    </Card>
  )
}
