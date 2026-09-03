/* eslint-disable @typescript-eslint/no-explicit-any */
import { createElement, type ComponentType } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import UseDebounce from './use-debounce'
import UseBattery from './use-battery'
import UseKeyDown from './use-key-down'
import UseKeyUp from './use-key-up'
import UseMediaQuery from './use-media-query'
import UseLocalStorage from './use-local-storage'
import UseCookie from './use-cookie'
import UseCache from './use-cache'
import UseQuery from './use-query'
import UseMutation from './use-mutation'
import UseIntersectionObserver from './use-intersection-observer'
import UseNetworkState from './use-network-state'
import UseIdle from './use-idle'
import UseClickOutside from './use-click-outside'
import UseWebSocket from './use-websocket'
import UseWindowSize from './use-window-size'

export const demoComponents: Record<string, ComponentType<any>> = {
  UseDebounce,
  UseBattery,
  UseKeyDown,
  UseKeyUp,
  UseMediaQuery,
  UseLocalStorage,
  UseCookie,
  UseCache,
  UseQuery,
  UseMutation,
  UseIntersectionObserver,
  UseNetworkState,
  UseIdle,
  UseClickOutside,
  UseWebSocket,
  UseWindowSize,
}

export function createClientDemo<P extends object>(
  name: string,
  Component: ComponentType<P>
) {
  return function ClientDemo(props: P) {
    const propsJson =
      props && Object.keys(props).length > 0 ? JSON.stringify(props) : undefined

    return (
      <div data-demo={name} data-props={propsJson}>
        <Component {...props} />
      </div>
    )
  }
}

export function hydrateDemos() {
  if (typeof document === 'undefined') return

  const elements = document.querySelectorAll<HTMLElement>('[data-demo]')
  elements.forEach((el) => {
    if (el.dataset.hydrated) return
    const demoName = el.dataset.demo
    if (!demoName) return
    const Component = demoComponents[demoName]
    if (!Component) return

    let props = {}
    if (el.dataset.props) {
      try {
        props = JSON.parse(el.dataset.props)
      } catch {
        props = {}
      }
    }

    try {
      hydrateRoot(el, createElement(Component, props))
      el.dataset.hydrated = 'true'
    } catch {
      createRoot(el).render(createElement(Component, props))
      el.dataset.hydrated = 'true'
    }
  })
}

const demos: Record<string, ComponentType<any>> = Object.fromEntries(
  Object.entries(demoComponents).map(([name, Component]) => [
    name,
    createClientDemo(name, Component)
  ])
)

export default demos
