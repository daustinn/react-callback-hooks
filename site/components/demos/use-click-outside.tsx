import { useState } from 'react'
import { useClickOutside } from 'react-callback-hooks'
import Card from './card'

export default function UseClickOutsideDemo() {
  const [open, setOpen] = useState(false)

  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))

  return (
    <Card>
      <div className="p-6 flex flex-col items-center gap-4 min-h-36">
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="px-4 py-2 rounded-full border border-foreground/15 bg-foreground/5 hover:bg-foreground/10 transition-all font-medium"
          >
            {open ? 'Close menu' : 'Open menu'}
          </button>

          {open && (
            <div className="absolute top-full mt-1.5 left-0 w-44 rounded-xl border border-foreground/10 bg-background shadow-lg overflow-hidden z-10">
              {['Profile', 'Settings', 'Logout'].map((item) => (
                <button
                  key={item}
                  onClick={() => setOpen(false)}
                  className="w-full text-left px-4 py-2.5 hover:bg-foreground/5 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 text-sm opacity-30">
          {open ? 'Click outside the menu to close it' : 'Menu is closed'}
        </div>
      </div>
    </Card>
  )
}
