import { ReactElement, RefCallback, cloneElement, isValidElement } from 'react'

import { TAB_INDEX } from 'utils/constants'

interface FocusedElementProps {
  children: ReactElement<HTMLElement>
  inner?: boolean
  innerRef?: RefCallback<HTMLElement>
}

export const FocusedElement = ({
  children,
  inner = false,
  innerRef,
}: FocusedElementProps) => {
  if (isValidElement(children)) {
    const focusableElement = cloneElement(children as ReactElement, {
      tabIndex: TAB_INDEX.ENABLED,
      ...(inner ? { innerRef } : { ref: innerRef }),
    })

    return focusableElement
  }

  return null
}
