import { useEffect, useState } from 'react'

import { useCountdown } from './useCountdown'

export const useCountdownTime = (seconds: number) => {
  const [targetTime, setTargetTime] = useState(() => {
    const now = Date.now()
    return now + seconds * 1000
  })

  useEffect(() => {
    // This effect is to update the targetTime if seconds change
    setTargetTime(Date.now() + seconds * 1000)
  }, [seconds])

  return useCountdown(targetTime)
}
