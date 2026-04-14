const MOBILE_OS = {
  GENERIC: 'Generic',
  IOS: 'iOS',
  ANDROID: 'Android',
}

function getMobileOperatingSystem() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  if (/android/i.test(userAgent)) {
    return MOBILE_OS.ANDROID
  }

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return MOBILE_OS.IOS
  }

  return MOBILE_OS.GENERIC
}

const MobileDetector = {
  getMobileOperatingSystem,
}

export { MobileDetector, MOBILE_OS }
