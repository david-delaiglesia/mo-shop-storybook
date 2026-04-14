import createMockRaf from '../../../utils/window/tests/raf-mock.js'
import { ImageZoomer } from '../index.js'
import { vi } from 'vitest'

const mockRaf = createMockRaf()
window.cancelAnimationFrame = mockRaf.cancel
window.requestAnimationFrame = mockRaf.raf

const mockedBoundingRect = {
  top: 300,
  left: 300,
  bottom: 600,
  right: 600,
  width: 100,
  height: 100,
}

const baseProps = {
  selectedImage: 'test image src',
  selectedZoom: 'test image src zoom',
  displayName: 'Aguacate',
  alt: 'test alt',
  position: 1,
  selectImage: vi.fn(),
}

const wrapSetState = (instance) => {
  instance.setState = (update) => {
    const newState =
      typeof update === 'function'
        ? update(instance.state, instance.props)
        : update
    instance.state = { ...instance.state, ...newState }
  }
}

const createInstance = () => {
  const instance = new ImageZoomer(baseProps)
  wrapSetState(instance)
  instance.containerBoundingRect = { ...mockedBoundingRect }
  instance.imageBoundingRect = { ...mockedBoundingRect }
  instance.setBoundingRect = vi.fn()
  return instance
}

describe('<ImageZoomer />', () => {
  let imageZoomerInstance

  beforeEach(() => {
    imageZoomerInstance = createInstance()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('resetZoom should hide zoomed image', () => {
    imageZoomerInstance.isZoomEnabled = true
    imageZoomerInstance.isInside = false

    imageZoomerInstance.resetZoom()

    const expectedState = {
      cursorClass: imageZoomerInstance.DEFAULT_CURSOR,
      zoomedImageStyle: { display: 'none' },
    }
    expect(imageZoomerInstance.isZoomEnabled).toBeFalsy()
    expect(imageZoomerInstance.isInside).toBeFalsy()
    expect(imageZoomerInstance.state).toEqual(expectedState)
  })

  it('setZoomedImageStyle should setState with zoomed image style', () => {
    const backgroundPosition = '-200px, -200px'

    imageZoomerInstance.setZoomedImageStyle(backgroundPosition)

    expect(
      imageZoomerInstance.state.zoomedImageStyle.backgroundPosition,
    ).toEqual(backgroundPosition)
    expect(imageZoomerInstance.state.zoomedImageStyle.display).toEqual('block')
  })

  describe('onEnableZoomClick method', () => {
    const mockedEvent = { clientX: 400, clientY: 500 }

    beforeEach(() => {
      imageZoomerInstance.isZoomEnabled = false
      imageZoomerInstance.containerBoundingRect.width = 100
      imageZoomerInstance.imageBoundingRect.width = 100
    })

    it('should call applyZoomAnimation', () => {
      const event = { clientX: 200, clientY: 200 }
      vi.spyOn(imageZoomerInstance, 'applyZoomAnimation')

      imageZoomerInstance.onEnableZoomClick(event)

      expect(imageZoomerInstance.applyZoomAnimation).toHaveBeenCalled()
    })

    it('should call setInitialStyleValues', () => {
      const spy = vi.spyOn(imageZoomerInstance, 'setInitialStyleValues')

      imageZoomerInstance.onEnableZoomClick(mockedEvent)

      expect(spy).toHaveBeenCalled()
    })

    it('should call setCursorPosition', () => {
      const spy = vi.spyOn(imageZoomerInstance, 'setCursorPosition')

      imageZoomerInstance.onEnableZoomClick(mockedEvent)

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('onDisableZoomClick method', () => {
    beforeEach(() => {
      imageZoomerInstance.isZoomEnabled = true
    })

    it('should call resetZoom', () => {
      const spy = vi.spyOn(imageZoomerInstance, 'resetZoom')

      imageZoomerInstance.onDisableZoomClick()

      expect(spy).toHaveBeenCalled()
    })

    it('should call setCursorStyle', () => {
      const spy = vi.spyOn(imageZoomerInstance, 'setCursorStyle')

      imageZoomerInstance.onDisableZoomClick()

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('onMouseMoveHandle method', () => {
    describe('onMouseEnter', () => {
      const mockedEvent = {
        clientX: 400,
        clientY: 400,
      }

      it('should call setCursorStyle', () => {
        const spy = vi.spyOn(imageZoomerInstance, 'setCursorStyle')

        imageZoomerInstance.onMouseMoveHandle(mockedEvent)

        expect(spy).toHaveBeenCalled()
      })

      it('should set isInside to true', () => {
        const expectedIsInside = true

        imageZoomerInstance.onMouseMoveHandle(mockedEvent)

        expect(imageZoomerInstance.isInside).toBe(expectedIsInside)
      })
    })

    describe('onMouseLeave', () => {
      const mockedEvent = {
        clientX: 700,
        clientY: 700,
      }

      it('should call resetZoom', () => {
        const spy = vi.spyOn(imageZoomerInstance, 'resetZoom')

        imageZoomerInstance.onMouseMoveHandle(mockedEvent)

        expect(spy).toHaveBeenCalled()
      })

      it('should apply initial style values', () => {
        const expectedZoomerImageStyle = { display: 'none' }
        const expectedCursorClass = imageZoomerInstance.DEFAULT_CURSOR

        imageZoomerInstance.onMouseMoveHandle(mockedEvent)

        expect(imageZoomerInstance.state.zoomedImageStyle).toEqual(
          expectedZoomerImageStyle,
        )
        expect(imageZoomerInstance.state.cursorClass).toEqual(
          expectedCursorClass,
        )
      })
    })

    describe('onMouseMove', () => {
      const mockedEvent = {
        clientX: 400,
        clientY: 400,
      }

      it('should call all', () => {
        const setOffsetSpy = vi.spyOn(imageZoomerInstance, 'setOffset')
        const setCursorPositionSpy = vi.spyOn(
          imageZoomerInstance,
          'setCursorPosition',
        )
        const applyZoomAnimationSpy = vi.spyOn(
          imageZoomerInstance,
          'applyZoomAnimation',
        )

        imageZoomerInstance.isInside = true
        imageZoomerInstance.isZoomEnabled = true

        imageZoomerInstance.onMouseMoveHandle(mockedEvent)

        expect(setOffsetSpy).toHaveBeenCalled()
        expect(setCursorPositionSpy).toHaveBeenCalled()
        expect(applyZoomAnimationSpy).toHaveBeenCalled()
      })
    })

    describe('onMouseMoveAnimationFrame method', () => {
      const mockedEvent = {
        clientX: 200,
        clientY: 300,
      }

      it('should call onMouseMoveHandle', () => {
        const spy = vi.spyOn(imageZoomerInstance, 'onMouseMoveHandle')

        imageZoomerInstance.onMouseMoveAnimationFrame(mockedEvent)
        mockRaf.step()

        expect(spy).toHaveBeenCalled()
      })
    })

    describe('setOffset method', () => {
      it('should set 0 offset if there is not element', () => {
        const expectedOffset = { top: 0, left: 0 }
        imageZoomerInstance.imageBoundingRect = null
        imageZoomerInstance.containerBoundingRect = null

        imageZoomerInstance.setOffset()

        expect(imageZoomerInstance.offset).toEqual(expectedOffset)
      })
    })
  })
})
