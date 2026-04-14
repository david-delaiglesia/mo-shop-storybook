import {
  RouteHandler,
  getLastContext,
  updateLastContext,
} from '../RouteHandler'
import { vi } from 'vitest'

import { PATHS } from 'pages/paths'

const baseProps = {
  location: {
    pathname: '',
    key: 'initial',
  },
  history: {
    listen: vi.fn(),
    push: vi.fn(),
  },
}

const createInstance = (overrideProps = {}) => {
  const props = {
    ...baseProps,
    ...overrideProps,
    location: {
      ...baseProps.location,
      ...(overrideProps.location || {}),
    },
    history: {
      ...baseProps.history,
      ...(overrideProps.history || {}),
    },
  }
  const instance = new RouteHandler(props)
  instance.props = props
  return { instance }
}

describe('RouteHandler', () => {
  let routeHandler

  beforeEach(() => {
    ;({ instance: routeHandler } = createInstance())
    vi.clearAllMocks()
    updateLastContext(null)
  })

  it('should render properly', () => {
    const routeHandler = createInstance()
    expect(routeHandler).toBeDefined()
  })

  describe('getLastLocation method', () => {
    it('should return undefined', () => {
      const { instance } = createInstance({ location: { pathname: undefined } })
      const lastLocation = instance.getLastLocation({})

      expect(lastLocation).not.toBeDefined()
    })

    it('should return last location', () => {
      const location = { pathname: 'a different pathname' }
      const expectedLastLocation = {
        ...routeHandler.props.location,
        state: { from: { pathname: location.pathname } },
      }

      const lastLocation = routeHandler.getLastLocation(location)

      expect(lastLocation).toEqual(expectedLastLocation)
    })
  })

  describe('setLastContext method', () => {
    const previousLastContext = PATHS.CATEGORY

    function setupLastContext(pathname) {
      const lastLocation = { pathname: 'a pathname' }
      routeHandler.getLastLocation = vi.fn().mockReturnValue(lastLocation)
      routeHandler.generateLastMatch = vi.fn().mockReturnValue({})
      routeHandler.props = {
        ...routeHandler.props,
        location: { pathname },
      }
      updateLastContext(previousLastContext)
    }

    it('should not set authenticate user pathname', () => {
      setupLastContext('/authenticate-user')

      routeHandler.setLastContext()
      const lastContext = getLastContext()

      expect(lastContext).toBe(previousLastContext)
    })

    it('should not set product detail pathname', () => {
      setupLastContext('/product/:id')

      routeHandler.setLastContext()
      const lastContext = getLastContext()

      expect(lastContext).toBe(previousLastContext)
    })

    it('should set last context', () => {
      setupLastContext(PATHS.SEARCH_RESULTS)

      routeHandler.setLastContext()
      const lastContext = getLastContext()

      expect(lastContext).not.toBe(previousLastContext)
    })
  })
})
