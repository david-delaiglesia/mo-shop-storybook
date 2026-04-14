import { useEffect, useState } from 'react'

import moment from 'moment'

const addExtraZero = (n: number): string => (n < 10 ? `0${n}` : `${n}`)

const zeroCounter = {
  hours: '00',
  minutes: '00',
  seconds: '00',
}

const getDuration = (date: Date | string | number) => {
  const currentTime = moment().valueOf()
  const endTime = moment(date).valueOf()

  return endTime - currentTime
}

const getRemainingTime = (date: Date | string | number) => {
  const distance = getDuration(date)

  if (distance < 0) {
    return zeroCounter
  }

  const minutes = Math.floor(distance / 60_000)
  const remainingMilliseconds = distance % 60_000
  const seconds = Math.floor(remainingMilliseconds / 1000)

  return {
    hours: addExtraZero(Math.floor(minutes / 60)),
    minutes: addExtraZero(minutes % 60),
    seconds: addExtraZero(seconds),
  }
}

const ONE_SECOND_MS = 1_000

export const useCountdown = (date: Date | string | number) => {
  const [state, setState] = useState(() => getRemainingTime(date))

  const updateCountdown = () => {
    const remainingTime = getRemainingTime(date)
    setState(remainingTime)
  }

  useEffect(() => {
    const distance = getDuration(date)
    if (distance < 0) return

    updateCountdown()

    const intervalId = setInterval(() => updateCountdown(), ONE_SECOND_MS)

    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  return state
}
