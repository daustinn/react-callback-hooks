import { useEffect } from 'react'
import { hydrateDemos } from './index'

export default function Hydrator() {
  useEffect(() => {
    hydrateDemos()
  }, [])

  return null
}
