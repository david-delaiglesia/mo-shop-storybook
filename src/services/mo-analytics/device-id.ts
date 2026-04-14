import { EVENTS_DEVICE_ID_LOCAL_STORAGE_KEY } from './constants'

let inMemoryDeviceId: string | null = null

export const DeviceId = {
  get(): string {
    if (inMemoryDeviceId) return inMemoryDeviceId

    try {
      const stored = localStorage.getItem(EVENTS_DEVICE_ID_LOCAL_STORAGE_KEY)
      if (stored) {
        inMemoryDeviceId = stored
        return stored
      }
    } catch {
      /* empty */
    }

    const newDeviceId = crypto.randomUUID()
    inMemoryDeviceId = newDeviceId

    try {
      localStorage.setItem(EVENTS_DEVICE_ID_LOCAL_STORAGE_KEY, newDeviceId)
    } catch {
      /* empty */
    }

    return newDeviceId
  },

  _reset() {
    inMemoryDeviceId = null
  },
}
