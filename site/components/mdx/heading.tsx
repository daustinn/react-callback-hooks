import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import getText from '#/utils/get-text-by-children'
import { slugify } from 'slugtree'

export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export type HeadingProps<T extends HeadingTag = HeadingTag> = {
  as?: T
  children?: ReactNode
} & ComponentPropsWithoutRef<T>

export default function Heading<T extends HeadingTag = 'h2'>({
  as,
  children,
  ...props
}: HeadingProps<T>) {
  const Tag = (as ?? 'h2') as HeadingTag
  const childrenText = getText(children)

  const id = slugify(childrenText)

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag {...(props as any)} id={id}>
      <a
        href={`#${id}`}
        aria-label={`Link to section: ${childrenText}`}
        className="group font-neuton prose__heading inline-flex items-center gap-2 relative no-underline hover:no-underline"
      >
        {childrenText}
      </a>
    </Tag>
  )
}
