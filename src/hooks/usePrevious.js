import { useEffect, useRef } from 'react'

export const usePrevious = (value) => {
  const valueRef = useRef()

  useEffect(() => {
    valueRef.current = value
  }, [value])

  return valueRef.current
}
