import { useState } from 'react'
import { useWebSocket } from 'react-callback-hooks'
import Card from './card'

const READY_STATE_LABEL: Record<number, string> = {
  0: 'Connecting',
  1: 'Open',
  2: 'Closing',
  3: 'Closed'
}

const READY_STATE_COLOR: Record<number, string> = {
  0: 'bg-amber-400',
  1: 'bg-green-400',
  2: 'bg-amber-400',
  3: 'bg-red-400'
}

type Message = { from: 'sent' | 'received'; text: string }

export default function UseWebSocketDemo() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const { send, disconnect, readyState } = useWebSocket({
    url: 'wss://echo.websocket.org',
    reconnect: true,
    reconnectDelay: 2000,
    onMessage: (event) => {
      if (event.data === 'echo.websocket.events sponsored by Lob.com') return
      setMessages((prev) => [...prev, { from: 'received', text: event.data }])
    },
    onOpen: () => console.log('ws connected'),
    onClose: () => console.log('ws disconnected')
  })

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || readyState !== 1) return
    send(trimmed)
    setMessages((prev) => [...prev, { from: 'sent', text: trimmed }])
    setInput('')
  }

  return (
    <Card>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${READY_STATE_COLOR[readyState]}`}
          />
          <span className="font-medium">{READY_STATE_LABEL[readyState]}</span>
          <span className="ml-auto opacity-50">echo.websocket.events</span>
          {readyState === 1 && (
            <button
              onClick={disconnect}
              className="px-3 py-2 rounded-full border border-foreground/10 hover:bg-foreground/5 transition-all"
            >
              Disconnect
            </button>
          )}
        </div>

        <div className="bg-foreground/5 rounded-xl p-3 h-40 overflow-y-auto flex flex-col gap-1.5">
          {messages.length === 0 ? (
            <span className="opacity-40 m-auto">
              Send a message to see the echo
            </span>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === 'sent' ? 'justify-end' : 'justify-start'}`}
              >
                <span
                  className={`px-3 py-1.5 rounded-xl max-w-[80%] break-all ${
                    msg.from === 'sent'
                      ? 'bg-foreground text-background'
                      : 'bg-foreground/10'
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 bg-foreground/5 rounded-2xl px-3 py-2 outline-none border border-foreground/10 focus:border-foreground/25 transition-colors placeholder:opacity-60 disabled:opacity-60"
            placeholder="Type a message..."
            value={input}
            disabled={readyState !== 1}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={readyState !== 1 || !input.trim()}
            className="px-4 py-2 rounded-full bg-foreground text-background font-medium disabled:opacity-25 disabled:pointer-events-none hover:opacity-80 transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </Card>
  )
}
