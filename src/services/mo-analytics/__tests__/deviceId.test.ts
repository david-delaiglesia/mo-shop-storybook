import { DeviceId } from '../device-id'

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

beforeEach(() => {
  localStorage.clear()
  DeviceId._reset()
})

it('should generate a UUID v4 when localStorage is empty', () => {
  const deviceId = DeviceId.get()

  expect(deviceId).toMatch(UUID_V4_REGEX)
})

it('should read device ID from localStorage if it exists', () => {
  const existingId = '11111111-1111-4111-a111-111111111111'
  localStorage.setItem('MO-analytics_device_id', existingId)

  const deviceId = DeviceId.get()

  expect(deviceId).toBe(existingId)
})

it('should persist the generated device ID to localStorage', () => {
  const deviceId = DeviceId.get()

  expect(localStorage.getItem('MO-analytics_device_id')).toBe(deviceId)
})

it('should fallback to in-memory when localStorage throws on read', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('localStorage unavailable')
  })

  const deviceId = DeviceId.get()

  expect(deviceId).toMatch(UUID_V4_REGEX)
})

it('should fallback to in-memory when localStorage throws on write', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('QuotaExceededError')
  })

  const deviceId = DeviceId.get()

  expect(deviceId).toMatch(UUID_V4_REGEX)
})
