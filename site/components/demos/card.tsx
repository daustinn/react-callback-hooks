import cn from '#/lib/cn'
import type { ComponentProps } from 'react'

export default function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'outline-4 blockcode outline-offset-0 group outline-border/40! bg-neutral-100 dark:bg-black/50 text-sm relative rounded-3xl',
        className
      )}
      {...props}
    />
  )
}
