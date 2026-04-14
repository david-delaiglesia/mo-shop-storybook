const onUpdate = (registration) => {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

export const serviceWorkerConfig = {
  onUpdate,
}
