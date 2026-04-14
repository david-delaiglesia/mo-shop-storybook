import { createPortal } from 'react-dom'

interface AriaLiveLogProps {
  children: React.ReactNode
}

export const AriaLiveLog = ({ children }: AriaLiveLogProps) => {
  const ariaLiveElement = (
    <div role="log" aria-live="polite" className="sr-only">
      {children}
    </div>
  )

  const targetContainer = document.getElementById('aria-live-portal')

  return targetContainer
    ? createPortal(ariaLiveElement, targetContainer)
    : ariaLiveElement
}
