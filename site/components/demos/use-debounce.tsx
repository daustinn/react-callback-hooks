import { useState } from 'react'
import { useDebounce } from 'react-callback-hooks'
import Card from './card'

type Data = {
  id: number
  title: string
  thumbnail: string
}

const URL = 'https://dummyjson.com/products/search'

export default function UseDebounce() {
  const [data, setData] = useState<Data[]>([])

  const [debouncedValue, setValue] = useDebounce((value) => {
    fetch(`${URL}?q=${value}&limit=3`)
      .then((res) => res.json())
      .then((data) => setData(data.products))
  }, 500)

  return (
    <Card>
      <div className="p-4">
        <input
          className="p-2 w-full bg-border/10 py-2 border rounded-2xl px-3"
          placeholder="Search..."
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="text pl-1 pt-1 opacity-50">
          Search products e.g. "iphone"
        </div>
      </div>
      <div className="max-h-80 p-4 pt-0 overflow-y-auto">
        {data.length > 0 ? (
          data.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <img src={item.thumbnail} width={50} alt={item.title} />
              <span>{item.title}</span>
            </div>
          ))
        ) : (
          <div className="text-center pb-3">
            {debouncedValue ? 'No results' : 'Type to search...'}
          </div>
        )}
      </div>
    </Card>
  )
}
