import { useEffect } from 'react'

export const useTimeout = (callback: () => void, delay: number) => {
  useEffect(() => {
    const handler = setTimeout(() => {
      callback()
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [callback, delay])
}
