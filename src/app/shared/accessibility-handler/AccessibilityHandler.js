import { isIE } from 'app/shared/ie-blocker'
import { Tracker } from 'services/tracker'

const KEYBOARD_USER_CLASS = 'keyboard-user'
const EVENTS = {
  TAB_KEY: 'a11y_tab_key',
  VO_KEY: 'a11y_vo_key',
  SPACE_KEY: 'a11y_space_key',
  ENTER_KEY: 'a11y_enter_key',
}

const sendKeyboardEvents = (event) => {
  const isTabKey = event.key === 'Tab'
  const isCtrlKey = event.key === 'Control'
  const isAltKey = event.key === 'Alt'
  const isSpaceKey = event.key === 'Space'
  const isEnterKey = event.key === 'Enter'
  const isVOKey = event.altKey && event.ctrlKey

  if (isVOKey && !isCtrlKey && !isAltKey) {
    Tracker.sendInteraction(EVENTS.VO_KEY, { key: event.key })
  }

  if (isSpaceKey) {
    Tracker.sendInteraction(EVENTS.SPACE_KEY, {
      target: document.activeElement.textContent,
    })
  }

  if (isEnterKey) {
    Tracker.sendInteraction(EVENTS.ENTER_KEY, {
      target: document.activeElement.textContent,
    })
  }

  if (isTabKey) {
    Promise.resolve().then(() => {
      Tracker.sendInteraction(EVENTS.TAB_KEY, {
        target: document.activeElement.textContent,
      })
    })
  }
}

const AccessibilityHandler = () => {
  const setKeyboardUser = (event) => {
    sendKeyboardEvents(event)
    const isTabKey = event.key === 'Tab'

    if (!isTabKey) return

    if (document.body.classList.contains(KEYBOARD_USER_CLASS)) return

    document.body.classList.add(KEYBOARD_USER_CLASS)
  }

  const setMouseUser = () => {
    if (isIE()) return

    document.body.classList.remove(KEYBOARD_USER_CLASS)
  }

  document.addEventListener('keydown', setKeyboardUser)
  document.addEventListener('mousedown', setMouseUser)

  return null
}

export { AccessibilityHandler }
