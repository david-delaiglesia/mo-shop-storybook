import { withClickOutside } from '../ClickOutHandler'
import { vi } from 'vitest'

const TestComponent = () => <div className="test">Test</div>
const ComponentWithHoc = withClickOutside(TestComponent)

const createInstance = (overrideProps = {}) => {
  const props = {
    handleClickOutside: vi.fn(),
    ...overrideProps,
  }
  const instance = new ComponentWithHoc(props)
  instance.contentRef.current = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    contains: vi.fn().mockReturnValue(false),
    ...((overrideProps.contentRef && overrideProps.contentRef.current) || {}),
  }
  return { instance }
}

describe('<ClickOutHandler />', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render correctly', () => {
    const { instance } = createInstance()
    expect(instance.render()).toBeDefined()
  })

  describe('componentDidMount', () => {
    it('should add listener to document', () => {
      const addEventSpy = vi.spyOn(document, 'addEventListener')
      const { instance } = createInstance()

      instance.componentDidMount()

      expect(addEventSpy).toHaveBeenCalledWith(
        'click',
        instance.handleClickOutside,
      )
    })

    it('should add listener to contentRef', () => {
      const { instance } = createInstance()

      instance.componentDidMount()

      expect(instance.contentRef.current.addEventListener).toHaveBeenCalledWith(
        'mousedown',
        instance.blockClick,
      )
    })
  })

  describe('componentWillUnmount', () => {
    it('should remove listeners', () => {
      const removeEventSpy = vi.spyOn(document, 'removeEventListener')
      const { instance } = createInstance()
      instance.componentDidMount()

      instance.componentWillUnmount()

      expect(removeEventSpy).toHaveBeenCalledWith(
        'click',
        instance.handleClickOutside,
      )
      expect(
        instance.contentRef.current.removeEventListener,
      ).toHaveBeenCalledWith('mousedown', instance.blockClick)
    })
  })

  it('blockClick should set isClickBlocked to true', () => {
    const { instance } = createInstance()
    expect(instance.isClickBlocked).toBeFalsy()

    instance.blockClick()

    expect(instance.isClickBlocked).toBeTruthy()
  })

  it('unBlockClick should set isClickBlocked to false', () => {
    const { instance } = createInstance()
    instance.isClickBlocked = true
    expect(instance.isClickBlocked).toBeTruthy()

    instance.unBlockClick()

    expect(instance.isClickBlocked).toBeFalsy()
  })

  describe('handleClickOutside method', () => {
    const mockedEvent = { target: { type: 'test' } }

    it('should call unBlockClick if isClickBlocked is true', () => {
      const { instance } = createInstance()
      instance.isClickBlocked = true
      instance.unBlockClick = vi.fn()

      instance.handleClickOutside(mockedEvent)

      expect(instance.unBlockClick).toHaveBeenCalled()
    })

    it('should call handleClickOutside prop when clicking outside', () => {
      const { instance } = createInstance()

      instance.handleClickOutside(mockedEvent)

      expect(instance.props.handleClickOutside).toHaveBeenCalled()
    })

    it('should not call handleClickOutside prop when event target is inside', () => {
      const { instance } = createInstance()
      instance.contentRef.current.contains = vi.fn().mockReturnValue(true)

      instance.handleClickOutside(mockedEvent)

      expect(instance.props.handleClickOutside).not.toHaveBeenCalled()
    })

    it('should return undefined if contentRef is undefined', () => {
      const { instance } = createInstance()
      instance.contentRef.current = undefined

      const response = instance.handleClickOutside(mockedEvent)

      expect(response).toBeUndefined()
    })
  })
})
