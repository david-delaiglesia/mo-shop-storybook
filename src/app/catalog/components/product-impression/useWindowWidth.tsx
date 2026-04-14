import { useEffect, useRef, useState } from 'react'

export const useWindowWidth = () => {
  const [width, setWidth] = useState<number>(window?.innerWidth)
  const widthRef = useRef(window?.innerWidth)

  useEffect(() => {
    let animationFrameId = 0

    const handleResize = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      animationFrameId = requestAnimationFrame(() => {
        setWidth(window.innerWidth)
        widthRef.current = window.innerWidth
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return { width, widthRef }
}
