vi.mock('services/tracker', () => {
  return {
    Tracker: {
      initialize: vi.fn(),
      sendInteraction: vi.fn(),
      sendInteractionGTAG: vi.fn(),
      sendViewChange: vi.fn(),
      setSuperProperties: vi.fn(),
      setUserProperties: vi.fn(),
      identifyExistingUser: vi.fn(),
      registerNewUser: vi.fn(),
      logout: vi.fn(),
      getUserInfo: vi.fn().mockReturnValue({
        sessionId: '1752140949624',
        deviceId: '731dee7b-83dd-4cdd-8d54-947e43501adaR',
        userId: '1ee523a2-f9ed-4309-9124-5f6c5961ffcc',
      }),
      waitForSession: (callback) => callback(),
      getDeviceId: () => 'device-id',
    },
  }
})

window.gtag = vi.fn()
