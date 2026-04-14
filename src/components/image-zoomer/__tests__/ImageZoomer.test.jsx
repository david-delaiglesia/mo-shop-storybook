import { render, screen } from '@testing-library/react'

import { ImageZoomer } from '../../image-zoomer'
import { vi } from 'vitest'

import createMockRaf from 'utils/window/tests/raf-mock.js'

describe('<ImageZoomer />', () => {
  const mockRaf = createMockRaf()
  window.cancelAnimationFrame = mockRaf.cancel
  window.requestAnimationFrame = mockRaf.raf

  const eventMap = {}
  window.addEventListener = (event, cb) => {
    eventMap[event] = cb
  }

  const props = {
    selectedImage: 'test image src',
    displayName: 'Aguacate',
    alt: 'test alt',
    position: 0,
    selectImage: vi.fn(),
    t: vi.fn().mockImplementation((key) => key),
  }

  it('should remove event listener on unmount', () => {
    const spy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = render(<ImageZoomer {...props} />)

    unmount()

    expect(spy).toHaveBeenCalled()
  })

  describe('if the user modifies the page zoom', () => {
    it('zoom image rectangle bounds should be updated', async () => {
      render(<ImageZoomer {...props} />)
      const mockedResize = { target: { innerWidth: 1154, innerHeight: 820 } }
      const imageZoomerContainer = await screen.findByTestId(
        'image-zoomer-overlay-image',
      )
      expect(imageZoomerContainer).toBeInTheDocument()
      imageZoomerContainer.getBoundingClientRect = vi.fn()
      eventMap.resize(mockedResize)
      expect(imageZoomerContainer.getBoundingClientRect).toHaveBeenCalled()
    })
  })
})
