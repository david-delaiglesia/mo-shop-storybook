import withEnterKeyPress from '../withEnterKeyPress'
import { vi } from 'vitest'

const TestComponent = () => <p className="test">Hi</p>
const ComponentWithEnterKeyPress = withEnterKeyPress(TestComponent)

const createInstance = (overrideProps = {}) => {
  const props = {
    shouldPerformKeyPress: false,
    ...overrideProps,
  }
  const instance = new ComponentWithEnterKeyPress(props)
  return { instance }
}

describe('withEnterKeyPress', () => {
  it('should render correctly', () => {
    const { instance } = createInstance()
    expect(instance.render()).toBeDefined()
  })

  describe('hasPressedAKey method', () => {
    it('should return TRUE if event type is "keypress"', () => {
      const { instance } = createInstance()
      const hasPressedAKey = instance.hasPressedAKey('keypress')

      expect(hasPressedAKey).toBeTruthy()
    })

    it('should return FALSE if event type is NOT "keypress"', () => {
      const { instance } = createInstance()
      const hasPressedAKey = instance.hasPressedAKey('fake event type')

      expect(hasPressedAKey).toBeFalsy()
    })
  })

  describe('isEnterKey method', () => {
    it('should return TRUE if event key is "Enter"', () => {
      const { instance } = createInstance()
      const isEnterKey = instance.isEnterKey('Enter')

      expect(isEnterKey).toBeTruthy()
    })

    it('should return FALSE if event key is NOT "Enter"', () => {
      const { instance } = createInstance()
      const isEnterKey = instance.isEnterKey('fake event key')

      expect(isEnterKey).toBeFalsy()
    })
  })

  describe('onEnterKeyPress method', () => {
    it('should return undefined if has pressed a key but it is NOT "Enter"', () => {
      const { instance } = createInstance()
      const event = {
        type: 'keypress',
        key: 'not Enter key',
      }

      expect(instance.onEnterKeyPress(event)).toBeUndefined()
    })

    it('should return and call event.preventDefault if shouldPerformKeyPress prop is FALSE', () => {
      const { instance } = createInstance()
      const event = {
        type: 'keypress',
        key: 'Enter',
        preventDefault: vi.fn(),
      }

      instance.onEnterKeyPress(event)

      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should call the provided onEnterKeyPress callback when allowed', () => {
      const onEnterKeyPress = vi.fn()
      const { instance } = createInstance({
        shouldPerformKeyPress: true,
        onEnterKeyPress,
      })
      const event = {
        type: 'keypress',
        key: 'Enter',
        preventDefault: vi.fn(),
        target: {
          blur: vi.fn(),
        },
      }

      instance.onEnterKeyPress(event)

      expect(onEnterKeyPress).toHaveBeenCalled()
    })
  })
})
