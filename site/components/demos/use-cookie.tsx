import { useCookie } from 'react-callback-hooks'
import Card from './card'

export default function UseCookieDemo() {
  const [cookieValue, setCookieValue, removeCookie, removeAllCookies] =
    useCookie<string>('demo_user_pref', (value) => {
      console.log('cookie changed:', value)
    })

  return (
    <Card className="p-4 space-y-3">
      <div className="space-y-3">
        <label className="text-sm opacity-60">
          Cookie Value (demo_user_pref)
        </label>
        <input
          type="text"
          className="w-full bg-foreground/5 rounded-xl px-3 py-2 outline-none border border-foreground/10 focus:border-foreground/25 transition-colors placeholder:opacity-60 text-sm"
          placeholder="Type a cookie value..."
          value={cookieValue ?? ''}
          onChange={(e) => setCookieValue(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <span className="text-sm opacity-40">
          document.cookie:{' '}
          {cookieValue ? `demo_user_pref=${cookieValue}` : '(empty)'}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => removeCookie()}
            disabled={!cookieValue}
            className="px-3 py-1 text-sm rounded-full border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-all disabled:opacity-20 disabled:pointer-events-none"
          >
            Delete Cookie
          </button>
          <button
            onClick={() => removeAllCookies()}
            className="px-3 py-1 text-sm rounded-full border transition-all"
          >
            Remove All
          </button>
        </div>
      </div>
    </Card>
  )
}
