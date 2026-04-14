import { useRef } from 'react'

let id = 0
function generateId() {
  return ++id
}

/**
 * React Hook for generating unique IDs that can be passed to accessibility attributes
 * TODO: remove this when update to React 18
 * @see https://react.dev/reference/react/useId
 */
export const useId = (): string => {
  return useRef(`ui-id__${generateId()}`).current
}
