import { monitoring } from 'monitoring'

const twentyFourHours = 24 * 60 * 60 * 1000
let initialTime

async function clearAndReload() {
  await clear()

  window.location.reload(true)
}

function shouldReload() {
  const currentTime = Date.now()
  const timeOutOfShop = currentTime - initialTime
  const timeFrameHasEnded = timeOutOfShop >= twentyFourHours

  return timeFrameHasEnded
}

async function reloadPageIfTimeIsOut() {
  if (shouldReload()) {
    return clearAndReload()
  }
}

async function reloadOnWindowFocus() {
  initialTime = Date.now()
  window.addEventListener('focus', reloadPageIfTimeIsOut)
}

async function clear() {
  if (!window.caches) return

  try {
    const keys = await window.caches.keys()
    if (!keys.length) return
    await Promise.all(keys.map((key) => window.caches.delete(key)))
  } catch (error) {
    monitoring.sendMessage(`Failed to clear cache: ${error}`)
  }
}

export const Cache = {
  reloadOnWindowFocus,
  clear,
  clearAndReload,
}
