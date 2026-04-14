import { MOBILE_OS, MobileDetector } from 'libs/mobile-detector'

describe('getMobileOperatingSystem system method', () => {
  it('should return GENERIC if userAgent is neither IOS or ANDROID ', () => {
    navigator.__defineGetter__('userAgent', () => undefined)
    navigator.__defineGetter__('vendor', () => undefined)
    window.opera = 'juanito'

    const result = MobileDetector.getMobileOperatingSystem()

    expect(result).toBe(MOBILE_OS.GENERIC)
  })

  it('should return android if userAgent is Android ', () => {
    navigator.__defineGetter__('userAgent', () => 'android')

    const result = MobileDetector.getMobileOperatingSystem()

    expect(result).toBe(MOBILE_OS.ANDROID)
  })

  it('should return IOS if userAgent is IOS ', () => {
    navigator.__defineGetter__('userAgent', () => 'iPad')

    const result = MobileDetector.getMobileOperatingSystem()

    expect(result).toBe(MOBILE_OS.IOS)
  })
})
