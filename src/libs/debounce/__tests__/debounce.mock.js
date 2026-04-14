import { vi } from 'vitest'

vi.mock('../../debounce', () => ({
  debouncePromise: (wrappedFunction) => {
    return (...args) => {
      return wrappedFunction(...args)
    }
  },
  debounce: (wrappedFunction) => {
    return (...args) => {
      return wrappedFunction(...args)
    }
  },
}))
