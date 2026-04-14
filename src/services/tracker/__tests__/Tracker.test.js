import { waitFor } from '@testing-library/react'

import Amplitude from 'amplitude-js'
import { vi } from 'vitest'

const { Tracker } = await vi.importActual('services/tracker')

it('should retry if there is no session id', async () => {
  const init = vi.fn()
  let numberOfCalls = 0
  vi.spyOn(Amplitude, 'getInstance').mockImplementation(() => {
    return {
      init,
      setVersionName: () => null,
      logEvent: () => null,
      getSessionId: () => {
        if (numberOfCalls === 0) {
          numberOfCalls = numberOfCalls + 1
          return null
        }

        return 1234
      },
    }
  })
  Amplitude.getInstance()
  const sendEvent = vi.fn()

  Tracker.waitForSession(sendEvent)
  await waitFor(() => expect(sendEvent).toHaveBeenCalled())
})

it('should get the device id', async () => {
  vi.spyOn(Amplitude, 'getInstance').mockImplementation(() => {
    return {
      options: {
        deviceId: 'device-id',
      },
      init: () => null,
      setVersionName: () => null,
      logEvent: () => null,
    }
  })

  const deviceId = Tracker.getDeviceId()

  expect(deviceId).toBe('device-id')
})

it('should initialize Amplitude when it is not initialized', () => {
  const init = vi.fn()
  vi.spyOn(Amplitude, 'getInstance').mockImplementation(() => {
    return {
      init,
      setVersionName: () => null,
      logEvent: () => null,
    }
  })

  Tracker.initialize()
  Tracker.sendInteraction('event')

  expect(init).toHaveBeenCalledTimes(1)
})

it('should send a metric when initialize the app', () => {
  const logEvent = vi.fn()
  vi.spyOn(Amplitude, 'getInstance').mockImplementation(() => {
    return {
      init: () => null,
      setVersionName: () => null,
      logEvent,
    }
  })

  Tracker.initialize()

  expect(logEvent).toHaveBeenCalledWith('app_initialized')
})

it('should return the user info', () => {
  vi.spyOn(Amplitude, 'getInstance').mockImplementation(() => {
    return {
      init: () => null,
      setVersionName: () => null,
      logEvent: () => null,
      getSessionId: () => '1752140949624',
      options: {
        deviceId: '731dee7b-83dd-4cdd-8d54-947e43501adaR',
        userId: '1ee523a2-f9ed-4309-9124-5f6c5961ffcc',
      },
    }
  })

  Tracker.initialize()
  const userInfo = Tracker.getUserInfo()

  expect(userInfo).toStrictEqual({
    sessionId: '1752140949624',
    deviceId: '731dee7b-83dd-4cdd-8d54-947e43501adaR',
    userId: '1ee523a2-f9ed-4309-9124-5f6c5961ffcc',
  })
})
