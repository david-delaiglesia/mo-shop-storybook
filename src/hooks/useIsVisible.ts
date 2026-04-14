import { useEffect, useMemo, useState } from 'react'

export const useIsVisible = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [elementObserved, setElementObserved] = useState<Element | null>(null)
  const observer = useMemo(
    () =>
      new IntersectionObserver(
        ([entry]) => setIsVisible(entry.intersectionRatio >= 0.5),
        { threshold: 0.5 },
      ),
    [],
  )
  useEffect(() => {
    if (elementObserved) observer.observe(elementObserved)
    return () => {
      observer.disconnect()
    }
  }, [elementObserved, observer])
  return { isVisible, setElementObserved }
}
