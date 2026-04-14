import { isIE } from 'app/shared/ie-blocker'

const BLOCK_SCROLL_CLASS = 'scroll--block'

export const createScrollBlocker = (blockScrollClass = BLOCK_SCROLL_CLASS) => {
  const body = document.querySelector('body')

  let shouldKeepScrollBlocked = false

  return {
    block() {
      if (body.classList.contains(blockScrollClass)) {
        shouldKeepScrollBlocked = true
      }

      body.classList.add(blockScrollClass)
    },

    unBlock() {
      if (shouldKeepScrollBlocked || isIE()) {
        return
      }

      body.classList.remove(blockScrollClass)
      shouldKeepScrollBlocked = false
    },
  }
}
