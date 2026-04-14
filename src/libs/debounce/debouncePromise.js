export function debouncePromise(wrappedFunction, wait, interval) {
  return (...args) =>
    new Promise((resolve, reject) => {
      clearTimeout(interval)
      interval = setTimeout(() => {
        wrappedFunction(...args)
          .then(resolve)
          .catch(reject)
      }, wait)
    })
}
