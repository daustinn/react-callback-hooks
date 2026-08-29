import { Children, isValidElement, type ReactNode } from 'react'

export default function getText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child)
      }

      if (isValidElement<{ children?: ReactNode }>(child)) {
        return getText(child.props.children)
      }

      return ''
    })
    .join('')
}
