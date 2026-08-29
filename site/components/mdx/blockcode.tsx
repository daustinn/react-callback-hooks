import { createHighlighter } from 'shiki'
import cn from '#/lib/cn'
import type { ComponentProps, ReactNode } from 'react'

const highlighter = await createHighlighter({
  themes: ['vesper', 'gruvbox-light-soft'],
  langs: [
    'javascript',
    'typescript',
    'jsx',
    'tsx',
    'json',
    'bash',
    'sh',
    'markdown',
    'md',
    'mdx'
  ]
})

export interface BlockCodeProps extends Omit<
  ComponentProps<'div'>,
  'children' | 'dangerouslySetInnerHTML'
> {
  lang?: string
  copy?: boolean
  lineNumbers?: boolean
  children?: ReactNode
}

export default function BlockCode({
  children,
  lang = 'text',
  className,
  copy = true,
  lineNumbers = true,
  ...props
}: BlockCodeProps) {
  const codeContent =
    typeof children === 'string'
      ? children.trimEnd()
      : Array.isArray(children)
        ? children.join('').trimEnd()
        : String(children || '').trimEnd()

  let html: string
  try {
    const loadedLangs = highlighter.getLoadedLanguages()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetLang = loadedLangs.includes(lang as any) ? lang : 'text'

    html = highlighter.codeToHtml(codeContent, {
      lang: targetLang,
      themes: {
        light: 'vesper',
        dark: 'vesper'
      }
    })
  } catch {
    html = `<pre><code>${codeContent}</code></pre>`
  }

  return (
    <div
      className={cn(
        'outline-4 blockcode outline-offset-0 group outline-border/40! bg-neutral-900 dark:bg-black/50 text-sm relative rounded-2xl overflow-auto',
        className
      )}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
    >
      <div className="overflow-auto max-h-100 z-0 group-aria-expanded:max-h-full">
        <div
          className={cn('[&>_pre]:bg-transparent! p-3', {
            lineNumbers: !!lineNumbers
          })}
          dangerouslySetInnerHTML={{ __html: String(html) }}
        />
        {copy && (
          <div className="absolute opacity-0 group-hover:opacity-100 z-10 top-2.5 right-3">
            <button
              data-code={codeContent}
              title="Copy code"
              className="flex font-semibold blockcode__button opacity-60 hover:opacity-100 p-0.5 text-xs"
            >
              Copy
            </button>
          </div>
        )}
      </div>
      <div className="absolute to-background/0 flex justify-center pointer-events-none inset-x-0 bottom-3">
        <button
          style={{ display: 'none' }}
          className="bg-foreground blockcode__expandButton text-background rounded-full p-1 pointer-events-auto px-5 font-semibold"
        >
          <span className="group-aria-expanded:hidden">Expand</span>
          <span className="group-aria-expanded:block hidden">Collapse</span>
        </button>
      </div>
    </div>
  )
}
