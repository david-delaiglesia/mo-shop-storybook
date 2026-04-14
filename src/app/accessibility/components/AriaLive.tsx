import { createPortal } from 'react-dom'

interface AriaLiveProps {
  text: string
}
export const AriaLive = ({ text }: AriaLiveProps) => {
  const ariaLiveElement = (
    <div aria-live="polite" className="sr-only">
      {text}
    </div>
  )

  const targetContainer = document.getElementById('aria-live-portal')

  return targetContainer
    ? createPortal(ariaLiveElement, targetContainer)
    : ariaLiveElement
}
