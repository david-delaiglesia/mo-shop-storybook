import { withNavigationHandler } from '../withNavigationHandler'
import { vi } from 'vitest'

import { PATHS } from 'pages/paths'
import { interpolatePath } from 'pages/routing'

const TestComponent = () => <div>test</div>
const ComponentWithHoc = withNavigationHandler(TestComponent)

const createInstance = (overrideProps = {}) => {
  const props = {
    location: {
      pathname: '',
      search: '?query=test',
      ...(overrideProps.location || {}),
    },
    history: {
      push: vi.fn(),
      replace: vi.fn(),
      ...(overrideProps.history || {}),
    },
    ...overrideProps,
  }
  const instance = new ComponentWithHoc(props)
  instance.props = props
  return { instance }
}

describe('<withNavigationHandler HOC />', () => {
  it('should render correctly', () => {
    const { instance } = createInstance()
    expect(instance.render()).toBeDefined()
  })

  describe('locationChanged method', () => {
    it('should return true if the path is changed', () => {
      const { instance } = createInstance()
      const newPath = 'new-path'

      const isChanged = instance.locationChanged(newPath)

      expect(isChanged).toBeTruthy()
    })

    it('should return false if the path is the same', () => {
      const { instance } = createInstance()
      const newPath = ''

      const isChanged = instance.locationChanged(newPath)

      expect(isChanged).toBeFalsy()
    })
  })

  describe('onChange method', () => {
    it('should not do something if search query is lower than minimum on non search page', () => {
      const { instance } = createInstance()
      instance.redirectToSearch = vi.fn()
      instance.redirectBack = vi.fn()
      instance.replaceLocation = vi.fn()
      const query = 'to'

      instance.onChange(query)

      expect(instance.redirectToSearch).not.toHaveBeenCalled()
      expect(instance.redirectBack).not.toHaveBeenCalled()
      expect(instance.replaceLocation).not.toHaveBeenCalled()
    })

    it('should call redirectToSearch if search query is greater than minimum', () => {
      const { instance } = createInstance()
      const spy = vi.spyOn(instance, 'redirectToSearch')
      const query = 'tomato'

      instance.onChange(query)

      expect(spy).toHaveBeenCalled()
    })

    it('should call redirectBack if value is empty', () => {
      const { instance } = createInstance({
        location: { pathname: PATHS.SEARCH_RESULTS },
      })
      const spy = vi.spyOn(instance, 'redirectBack')

      instance.onChange()

      expect(spy).toHaveBeenCalled()
    })

    it('should not call redirectBack if value is greater than minimum', () => {
      const { instance } = createInstance()
      const spy = vi.spyOn(instance, 'redirectBack')
      const query = 'tomato'

      instance.onChange(query)

      expect(spy).not.toHaveBeenCalled()
    })

    it('should call replaceLocation if query is not empty and is search page', () => {
      const { instance } = createInstance({
        location: { pathname: PATHS.SEARCH_RESULTS },
      })
      const spy = vi.spyOn(instance, 'replaceLocation')
      const query = 'tomato'

      instance.onChange(query)

      expect(spy).toHaveBeenCalled()
    })

    it('should not call replaceLocation if query is not empty and is not search page', () => {
      const { instance } = createInstance()
      const spy = vi.spyOn(instance, 'replaceLocation')
      const query = 'tomato'

      instance.onChange(query)

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('replaceLocation method', () => {
    it('should call props.history replace if query is not empty', () => {
      const { instance } = createInstance()
      const query = 'tomato'

      instance.replaceLocation(query)

      expect(instance.props.history.replace).toHaveBeenCalled()
    })

    it('should preserve existing query params when updating query (e.g. campaign)', () => {
      const { instance } = createInstance({
        location: {
          pathname: PATHS.SEARCH_RESULTS,
          search: '?query=jam&campaign=verano',
        },
      })

      instance.replaceLocation('tomato')

      const [[replaceArg]] = instance.props.history.replace.mock.calls
      const params = new URLSearchParams(replaceArg.search)

      expect(params.get('query')).toBe('tomato')
      expect(params.get('campaign')).toBe('verano')
    })

    it('should not call props.history replace if query is empty', () => {
      const { instance } = createInstance()

      instance.replaceLocation()

      expect(instance.props.history.replace).not.toHaveBeenCalled()
    })
  })

  describe('redirectBack method', () => {
    it('should call props.history push', () => {
      const { instance } = createInstance()
      instance.backUrl = '/'

      instance.redirectBack()

      expect(instance.props.history.push).toHaveBeenCalled()
    })
  })

  describe('storeBackUrl method', () => {
    it('should set the path in backUrl if the path is a navigable page', () => {
      const { instance } = createInstance()
      const path = interpolatePath(PATHS.CATEGORY, { id: 123 })

      instance.storeBackUrl(path)

      expect(instance.backUrl).toEqual(path)
    })

    it('should set the path in backUrl if the path is not a search page', () => {
      const { instance } = createInstance()
      const path = '/'

      instance.storeBackUrl(path)

      expect(instance.backUrl).toEqual(path)
    })
  })

  describe('redirectToSearch method', () => {
    it('should not call history.push if is search page', () => {
      const { instance } = createInstance({
        location: { pathname: PATHS.SEARCH_RESULTS },
      })

      instance.redirectToSearch()

      expect(instance.props.history.push).not.toHaveBeenCalled()
    })

    it('should call history.push with search path if is not search page', () => {
      const { instance } = createInstance()
      const location = { pathname: PATHS.SEARCH_RESULTS }

      instance.redirectToSearch()

      expect(instance.props.history.push).toHaveBeenCalledWith(location)
    })
  })

  describe('redirectToHome method', () => {
    it('should call history.push with home path', () => {
      const { instance } = createInstance()
      const location = { pathname: '/' }

      instance.redirectToHome()

      expect(instance.props.history.push).toHaveBeenCalledWith(location)
    })
  })
})
