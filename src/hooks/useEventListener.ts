import { useEffect, useRef } from 'react'

export function useEventListener<EventName extends keyof WindowEventMap>(
  eventName: EventName,
  handler: (event: WindowEventMap[EventName]) => void,
): void

export function useEventListener<
  EventName extends keyof HTMLElementEventMap,
  HTMLElementType extends HTMLElement = HTMLDivElement,
>(
  eventName: EventName,
  handler: (event: HTMLElementEventMap[EventName]) => void,
  element: HTMLElementType | null,
): void

export function useEventListener<
  WindowEventName extends keyof WindowEventMap,
  HTMLElementEventName extends keyof HTMLElementEventMap,
  HTMLElementType extends HTMLElement | void = void,
>(
  eventName: WindowEventName | HTMLElementEventName,
  handler: (
    event:
      | WindowEventMap[WindowEventName]
      | HTMLElementEventMap[HTMLElementEventName]
      | Event,
  ) => void,
  element?: HTMLElementType | null,
): void {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const targetElement: HTMLElementType | Window = element ?? window
    if (!(targetElement && targetElement.addEventListener)) {
      return
    }

    const eventListener: typeof handler = (event) => handlerRef.current(event)

    targetElement.addEventListener(eventName, eventListener)

    return () => {
      targetElement.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}
