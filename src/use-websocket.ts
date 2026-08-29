import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'

/** WebSocket ready state: `0` = CONNECTING, `1` = OPEN, `2` = CLOSING, `3` = CLOSED. */
type ReadyState = 0 | 1 | 2 | 3

/** Props for the object form of `useWebSocket`. */
type UseWebSocketProps = {
  /** The WebSocket server URL. */
  url: string
  /** Called with the `MessageEvent` whenever a message is received. */
  onMessage?: (event: MessageEvent) => void
  /** Called when the connection opens. */
  onOpen?: (event: Event) => void
  /** Called when the connection closes. */
  onClose?: (event: CloseEvent) => void
  /** Called when a connection error occurs. */
  onError?: (event: Event) => void
  /** If `true`, the hook automatically reconnects after a close. @default false */
  reconnect?: boolean
  /** Delay in ms between reconnect attempts. @default 3000 */
  reconnectDelay?: number
}

/** Object returned by `useWebSocket`. */
type WebSocketReturn = {
  /** Sends data over the socket. No-ops if the connection is not open. */
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void
  /** Closes the connection and cancels any pending reconnect timer. */
  disconnect: () => void
  /** Current ready state: `0` CONNECTING, `1` OPEN, `2` CLOSING, `3` CLOSED. */
  readyState: ReadyState
  /** The most recently received `MessageEvent`, or `null`. */
  lastMessage: MessageEvent | null
}

/**
 * Shorthand form — URL + optional message callback.
 * @param url WebSocket server URL.
 * @param onMessage Called on every incoming message.
 * @returns `WebSocketReturn`
 */
function useWebSocket(
  url: string,
  onMessage?: (event: MessageEvent) => void
): WebSocketReturn

/**
 * Object form — full configuration with reconnect support and all lifecycle callbacks.
 * @param props `UseWebSocketProps`
 * @returns `WebSocketReturn`
 */
function useWebSocket(props: UseWebSocketProps): WebSocketReturn

function useWebSocket(
  arg: string | UseWebSocketProps,
  onMessageArg?: (event: MessageEvent) => void
): WebSocketReturn {
  const isShorthand = typeof arg === 'string'

  const url = isShorthand ? arg : (arg as UseWebSocketProps).url
  const reconnect = isShorthand
    ? false
    : ((arg as UseWebSocketProps).reconnect ?? false)
  const reconnectDelay = isShorthand
    ? 3000
    : ((arg as UseWebSocketProps).reconnectDelay ?? 3000)

  const [readyState, setReadyState] = useState<ReadyState>(0)
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const callbacksRef = useRef({
    onMessage: isShorthand
      ? onMessageArg
      : (arg as UseWebSocketProps).onMessage,
    onOpen: isShorthand ? undefined : (arg as UseWebSocketProps).onOpen,
    onClose: isShorthand ? undefined : (arg as UseWebSocketProps).onClose,
    onError: isShorthand ? undefined : (arg as UseWebSocketProps).onError
  })

  useLayoutEffect(() => {
    callbacksRef.current = {
      onMessage: isShorthand
        ? onMessageArg
        : (arg as UseWebSocketProps).onMessage,
      onOpen: isShorthand ? undefined : (arg as UseWebSocketProps).onOpen,
      onClose: isShorthand ? undefined : (arg as UseWebSocketProps).onClose,
      onError: isShorthand ? undefined : (arg as UseWebSocketProps).onError
    }
  })

  useEffect(() => {
    if (typeof WebSocket === 'undefined') return

    let active = true

    const doConnect = () => {
      if (!active) return

      const ws = new WebSocket(url)
      wsRef.current = ws
      setReadyState(0)

      ws.onopen = (event) => {
        if (!active) return
        setReadyState(1)
        callbacksRef.current.onOpen?.(event)
      }

      ws.onmessage = (event) => {
        if (!active) return
        setLastMessage(event)
        callbacksRef.current.onMessage?.(event)
      }

      ws.onclose = (event) => {
        if (!active) return
        setReadyState(3)
        callbacksRef.current.onClose?.(event)
        if (reconnect && active) {
          reconnectTimerRef.current = setTimeout(doConnect, reconnectDelay)
        }
      }

      ws.onerror = (event) => {
        if (!active) return
        setReadyState(ws.readyState as ReadyState)
        callbacksRef.current.onError?.(event)
      }
    }

    doConnect()

    return () => {
      active = false
      if (reconnectTimerRef.current != null) {
        clearTimeout(reconnectTimerRef.current)
      }
      wsRef.current?.close()
    }
  }, [url, reconnect, reconnectDelay])

  const send = useCallback(
    (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      if (wsRef.current?.readyState === 1) wsRef.current.send(data)
    },
    []
  )

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current != null) {
      clearTimeout(reconnectTimerRef.current)
    }
    wsRef.current?.close()
  }, [])

  return { send, disconnect, readyState, lastMessage }
}

export type { UseWebSocketProps, WebSocketReturn, ReadyState }
export default useWebSocket
