import { useEffect } from 'react'
import { useLocation } from 'react-router'

export const useDelayedHashNavigation = (
  hashKey: string,
  delay: number = 500,
) => {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash === `#${hashKey}`) {
      setTimeout(() => {
        document.getElementById(hashKey)?.scrollIntoView({ behavior: 'smooth' })
      }, delay)
    }
  }, [hash, hashKey])
}
