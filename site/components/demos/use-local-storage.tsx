import { useLocalStorage } from 'react-callback-hooks'
import Card from './card'

export default function UseLocalStorageDemo() {
  const [note, setNote, clearNote] = useLocalStorage<string>(
    'demo:note',
    (value) => {
      console.log('note changed', value)
    }
  )

  return (
    <Card className="p-4 space-y-2">
      <textarea
        className="w-full bg-foreground/5 rounded-2xl px-3 py-2 resize-none outline-none border border-foreground/10 focus:border-foreground/25 transition-colors placeholder:opacity-60"
        rows={4}
        placeholder="Type something — it persists across reloads..."
        value={note ?? ''}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <span className="opacity-30">localStorage["demo:note"]</span>
        <button
          onClick={clearNote}
          disabled={!note}
          className="px-2.5 py-1 rounded-full border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-all disabled:opacity-20 disabled:pointer-events-none"
        >
          Clear
        </button>
      </div>
    </Card>
  )
}
