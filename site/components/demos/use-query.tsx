import { useState } from 'react'
import { useQuery } from 'react-callback-hooks'
import Card from './card'

type Pokemon = {
  name: string
  sprites: { front_default: string }
  types: { type: { name: string } }[]
  weight: number
  height: number
}

const options = [
  'bulbasaur',
  'charmander',
  'squirtle',
  'pikachu',
  'eevee',
  'snorlax'
]

export default function UseQueryDemo() {
  const [selected, setSelected] = useState('pikachu')

  const [{ data, loading, error }] = useQuery<Pokemon>(
    ['pokemon', selected],
    () =>
      fetch(`https://pokeapi.co/api/v2/pokemon/${selected}`).then((r) =>
        r.json()
      ),
    {
      onSuccess: (data) => console.log('fetched', data.name),
      onError: (err) => console.error(err)
    }
  )

  return (
    <Card className="p-4">
      <div className="flex flex-wrap gap-1.5">
        {options.map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={`px-4 py-2 rounded-full border capitalize transition-all ${
              selected === name
                ? 'bg-foreground text-background border-foreground!'
                : 'bg-foreground/5 border-foreground/10 hover:bg-foreground/10'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 min-h-20">
        {loading && <div className="opacity-40 animate-pulse">Loading...</div>}
        {error && <div className="text-red-400">{error.message}</div>}
        {!loading && data && (
          <>
            <img
              src={data.sprites.front_default}
              alt={data.name}
              width={80}
              height={80}
            />
            <div className="space-y-1">
              <p className="font-semibold capitalize text-sm">{data.name}</p>
              <div className="flex gap-1">
                {data.types.map(({ type }) => (
                  <span
                    key={type.name}
                    className="px-2 py-0.5 rounded-full bg-foreground/8 border border-foreground/10 capitalize"
                  >
                    {type.name}
                  </span>
                ))}
              </div>
              <p className="opacity-40">
                {data.weight / 10} kg · {data.height / 10} m
              </p>
            </div>
          </>
        )}
      </div>
      <div className="opacity-25">
        Switching back to a cached pokemon loads instantly.
      </div>
    </Card>
  )
}
