import { useState } from 'react'

export const useAccessibleTooltip = (tooltipText: string) => {
  const [timesShownTooltip, setTimesShownTooltip] = useState(0)
  const [tooltipTextAriaLive, setTooltipTextAriaLive] = useState('')

  const readTooltipAgain = () => {
    const ariaLiveSwitch = timesShownTooltip % 2 === 0 ? '.' : ''

    setTimesShownTooltip(timesShownTooltip + 1)

    const newText = `${tooltipText}${ariaLiveSwitch}`

    setTooltipTextAriaLive(newText)
  }

  const readTooltip = (event: { key: string }) => {
    if (event.key === 'Enter') {
      readTooltipAgain()
    }
  }

  return {
    tooltipTextAriaLive,
    readTooltip,
  }
}
