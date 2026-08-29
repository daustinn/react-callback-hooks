import { useState } from 'react'
import { useMutation } from 'react-callback-hooks'
import Card from './card'

type NewPost = { title: string; body: string }
type Post = NewPost & { id: number; userId: number }

export default function UseMutationDemo() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const [createPost, { data, loading, error, reset }] = useMutation<
    Post,
    NewPost
  >(
    (variables) =>
      fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...variables, userId: 1 })
      }).then((r) => r.json()),
    {
      onSuccess: (data) => console.log('created post', data.id),
      onError: (err) => console.error(err)
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    createPost({ title, body })
  }

  return (
    <Card>
      <div className="p-4 space-y-3">
        {data ? (
          <div className="space-y-2">
            <div className="bg-foreground/5 rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="opacity-40 font-mono">post #{data.id}</span>
              </div>
              <p className="font-semibold">{data.title}</p>
              {data.body && <p className="opacity-60">{data.body}</p>}
            </div>
            <button
              onClick={() => {
                reset()
                setTitle('')
                setBody('')
              }}
              className="px-3 py-2 mt-2 rounded-full border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-all"
            >
              Create another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              className="w-full bg-foreground/5 rounded-xl px-3 py-2.5 outline-none border border-foreground/10 focus:border-foreground/25 transition-colors placeholder:opacity-60"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full bg-foreground/5 rounded-xl px-3 py-2.5 resize-none outline-none border border-foreground/10 focus:border-foreground/25 transition-colors placeholder:opacity-60"
              placeholder="Body (optional)"
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            {error && <p className="text-red-400">{error.message}</p>}
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-1.5 mt-1 rounded-full bg-foreground text-background font-medium transition-all disabled:opacity-30 disabled:pointer-events-none hover:opacity-80"
            >
              {loading ? 'Creating...' : 'Create post'}
            </button>
          </form>
        )}
      </div>
    </Card>
  )
}
