import { useState } from 'react'

import { useTimeout } from './useTimeout'

/**
 * TODO: remove this when update to React 18
 * @see https://react.dev/reference/react/useDeferredValue
 */
export const useDeferredValue = <ValueType>(
  value: ValueType,
  initialValue = value,
): ValueType => {
  const [deferredValue, setDeferredValue] = useState<ValueType>(initialValue)

  useTimeout(() => {
    setDeferredValue(value)
  }, 300)

  return deferredValue
}
