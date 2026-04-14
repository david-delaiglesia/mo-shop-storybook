import { createRef } from 'react'
import React from 'react'

import 'core-js/features/string/trim-start'
import { vi } from 'vitest'

import { cookies } from 'app/cookie/__scenarios__/cookies'
import 'app/i18n/__tests__/i18n.mock'
import 'libs/debounce/__tests__/debounce.mock'
import { IntersectionObserverMock } from 'pages/__tests__/IntersectionObserverMock'
import 'pages/search/__tests__/algolia.mock'
import { createChatSocketMock } from 'services/chat-socket/__tests__/ChatSocket.mock'
import 'services/http/__tests__/Http.mock'
import 'services/support/__tests__/support.mock'
import 'services/tracker/__tests__/Tracker.mock'
import ScriptLoader from 'utils/script-loader'
import MockScriptLoader from 'utils/test-utils/mockScripLoader'
import { windowGoogleMock } from 'utils/window/tests/google-maps-mock'

vi.mock('moment-timezone', async () => {
  const moment = await vi.importActual('moment-timezone')
  moment.tz.setDefault('UTC')
  moment.tz.setDefault = vi.fn()
  return moment
})

Object.defineProperty(window.navigator, 'appName', {
  value: 'Netscape',
  writable: true,
})

delete global.window.google
global.window.google = windowGoogleMock.google
global.window.indexedDB = {}

delete global.document.execCommand
global.document.execCommand = vi.fn()

window.matchMedia = (query) => {
  return {
    matches: true,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }
}

delete global.window.crypto
global.window.crypto = {
  getRandomValues: () => [244],
  randomUUID: () => '10000000-1000-4000-8000-100000000000',
}

import.meta.env.VITE_APP_VERSION = 'v0'
import.meta.env.VITE_ALGOLIA_NAME = 'products_test'

ScriptLoader.loadScript = MockScriptLoader.loadScript

HTMLFormElement.prototype.submit = vi.fn()
HTMLElement.prototype.scrollIntoView = vi.fn()
HTMLElement.prototype.scrollTo = vi.fn()
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn().mockResolvedValue(),
})
Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn(),
})
Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: vi.fn(),
})

Object.defineProperty(window, 'scrollTo', { value: () => null, writable: true })

window.devicePixelRatio = 2
window.outerWidth = 1200
vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200)

Object.defineProperty(window.screen, 'height', {
  value: 800,
  writable: true,
})
Object.defineProperty(window.screen, 'width', {
  value: 1200,
  writable: true,
})

React.createRef = () => ({
  current: {
    focus: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    reset: vi.fn(),
    target: 'testTarget',
    contains: (node) => node === createRef().current.target,
    getBoundingClientRect: () => ({ height: 2000, width: 992 }),
    executeAsync: vi.fn().mockResolvedValue('recaptcha_v2_token'),
  },
})

vi.mock('monitoring', async () => {
  return {
    monitoring: {
      init: vi.fn(),
      captureError: vi.fn(),
      sendMessage: vi.fn(),
      identify: vi.fn(),
      anonymize: vi.fn(),
    },
  }
})

vi.mock('services/feature-flags', async (importOriginal) => {
  const originalModule = await importOriginal() // type is inferred
  return {
    ...originalModule,
    // eslint-disable-next-line react/prop-types
    FeatureFlagsProvider: ({ children }) => <>{children}</>,
    FeatureFlagFetchByRoute: () => null,
    // eslint-disable-next-line react/prop-types
    FlagsDeferredRenderer: ({ children }) => <>{children}</>,
    useFlag: vi.fn(),
    useVariant: vi.fn(),
  }
})

vi.mock('services/feature-flags/useFlags', () => ({
  useFlags: vi.fn().mockImplementation(() => []),
}))

vi.mock('services/chat-socket', () => createChatSocketMock())
global.IntersectionObserver = IntersectionObserverMock

vi.mock('@mercadona/mo.library.web-services/cookies', () => ({
  Cookie: {
    get: vi.fn((cookie) => {
      return cookies[cookie]
    }),
    save: vi.fn(),
    getAll: vi.fn(),
    remove: vi.fn(),
  },
}))
