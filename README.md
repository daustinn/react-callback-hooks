# react-callback-hooks

A collection of lightweight, type-safe React hooks focused on event handling, side-effects, and callback-driven patterns.

[![npm version](https://img.shields.io/npm/v/react-callback-hooks.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/react-callback-hooks)
[![license](https://img.shields.io/npm/l/react-callback-hooks.svg?style=flat-square&color=green)](https://github.com/daustinn/react-callback-hooks/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-callback-hooks?style=flat-square&color=orange)](https://bundlephobia.com/package/react-callback-hooks)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## Features

- **Lightweight & Tree-shakeable**: Import only what you need.
- **Strictly Typed**: Written in TypeScript with complete type definitions.
- **SSR & Modern React**: Compatible with React 18+ and React 19.
- **Callback-Driven**: Ergonomic APIs designed around explicit callback triggers and lifecycle control.

## Installation

```bash
# npm
npm install react-callback-hooks

# pnpm
pnpm add react-callback-hooks

# yarn
yarn add react-callback-hooks

# bun
bun add react-callback-hooks
```

## Demos

### 1. `useDebounce`

Debounce user input or asynchronous operations with immediate state feedback and debounced execution.

```tsx
import React from 'react'
import { useDebounce } from 'react-callback-hooks'

export function SearchComponent() {
  const [debouncedQuery, setQuery, immediateQuery] = useDebounce<string>(
    (value) => {
      console.log('Fetching search results for:', value)
    },
    500
  )

  return (
    <div>
      <input
        type="text"
        placeholder="Type to search..."
        value={immediateQuery ?? ''}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p>Immediate: {immediateQuery}</p>
      <p>Debounced: {debouncedQuery}</p>
    </div>
  )
}
```

### 2. `useClickOutside`

Trigger a callback when a click or touch event occurs outside the target element.

```tsx
import React, { useState } from 'react'
import { useClickOutside } from 'react-callback-hooks'

export function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useClickOutside<HTMLDivElement>(() => {
    setIsOpen(false)
  })

  return (
    <div>
      <button onClick={() => setIsOpen((prev) => !prev)}>
        Toggle Menu
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            marginTop: '0.5rem'
          }}
        >
          <p>Dropdown Content</p>
          <p>Click anywhere outside this box to close.</p>
        </div>
      )}
    </div>
  )
}
```

## Available Hooks

| Hook | Description |
| :--- | :--- |
| `useDebounce` | Debounces value changes and invokes a callback after delay |
| `useClickOutside` | Detects clicks and touches outside a referenced element |
| `useKeyDown` | Listens for specific key combinations and keyboard events |
| `useKeyUp` | Handles keyboard key release events |
| `useLocalStorage` | Synchronizes state with browser `localStorage` and storage events |
| `useCookie` | Synchronizes state with browser cookies with add, update, remove, and removeAll methods |
| `useMediaQuery` | Subscribes to responsive CSS media queries |
| `useIntersectionObserver` | Observes element visibility and viewport intersection |
| `useNetworkState` | Monitors online/offline network connectivity status |
| `useBattery` | Tracks battery status and charging level via Web Battery API |
| `useIdle` | Detects user inactivity after a specified duration |
| `useWindowSize` | Tracks window dimensions and resize events |
| `useCache` | In-memory key-value cache with invalidation hooks |
| `useQuery` | Async data fetching lifecycle with status callbacks |
| `useMutation` | Async mutation execution with success/error handlers |
| `useWebSocket` | WebSocket connection management with event dispatching |

## License

[MIT](LICENSE)
