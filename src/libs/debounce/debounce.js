export function debounce(wrappedFunction, wait, interval) {
  return (...args) => {
    clearTimeout(interval)
    interval = setTimeout(() => wrappedFunction(...args), wait)
  }
}
