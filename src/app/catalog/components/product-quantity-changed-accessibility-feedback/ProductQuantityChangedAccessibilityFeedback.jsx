import { useEffect, useState } from 'react'

import { number, string } from 'prop-types'

import { AriaLive } from 'app/accessibility'

export const ProductQuantityChangedAccessibilityFeedback = ({
  text,
  quantity,
}) => {
  const [updatedText, setUpdatedText] = useState(text)
  const [timesChanged, setTimesChanged] = useState(1)

  useEffect(() => {
    setTimesChanged(timesChanged + 1)

    if (timesChanged % 2 === 0) {
      setUpdatedText(text)
      return
    }

    setUpdatedText(text.toUpperCase())
    // should run only when quantity changed to change aria label casing for screen reader to detect a change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity])

  return <AriaLive text={updatedText} />
}

ProductQuantityChangedAccessibilityFeedback.propTypes = {
  text: string,
  quantity: number,
}
