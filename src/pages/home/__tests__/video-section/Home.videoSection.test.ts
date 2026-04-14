import { screen, waitFor, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import { monitoring } from 'monitoring'
import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { cartWithSources } from 'app/cart/__scenarios__/cart'
import {
  homeWithVideoSection,
  homeWithVideoSectionWithManyProducts,
  homeWithVideoSectionWithThreeProducts,
} from 'app/catalog/__scenarios__/home'
import { knownFeatureFlags } from 'services/feature-flags/constants'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Video Section', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let getContextSpy: any
  let drawImageMock = vi.fn()

  beforeEach(() => {
    //STRIKE 1 Mock Canvas globally
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(
        () =>
          ({
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            scale: vi.fn(),
            drawImage: drawImageMock,
          }) as unknown as CanvasRenderingContext2D,
      )
    Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
      set: () => {},
    })
  })

  afterEach(() => {
    history.push('/')
    localStorage.clear()
    Storage.clear()
    vi.clearAllMocks()
    getContextSpy.mockRestore()
  })

  it('should render the section header with title and subtitle when FF is ON', async () => {
    activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithVideoSection },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Recetas de verano')

    expect(screen.getByText('Recetas de verano')).toBeInTheDocument()
    expect(
      screen.getByText('Descubre nuestros productos de temporada'),
    ).toBeInTheDocument()
  })

  it('should render the video with the correct source and autoplay configuration', async () => {
    activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithVideoSection },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Recetas de verano')

    const video = document.querySelector('video')
    expect(video).toHaveAttribute(
      'src',
      'https://cdn.example.com/summer-recipes.mp4',
    )
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveAttribute('loop')
  })

  it('should render the products in the video section', async () => {
    activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithVideoSection },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Recetas de verano')

    expect(
      screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
    ).toBeInTheDocument()
  })

  it('should send add_product_click with complete payload when adding a product', async () => {
    activeFeatureFlags([
      knownFeatureFlags.WEB_VIDEO_SECTION,
      knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD,
    ])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithVideoSection },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

    const [firstAddToCart] = screen.getAllByText('Add to cart')
    userEvent.click(firstAddToCart)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'add_product_click',
      expect.objectContaining({
        layout: 'video',
        page: 'home',
        section: 'summer-recipes',
        position: 0,
        section_position: 0,
      }),
    )
  })

  it('should NOT include page, section, position and section_position in add_product_click when WEB_ADD_PRODUCT_CLICK_PAYLOAD is OFF', async () => {
    activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithVideoSection },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

    const [firstAddToCart] = screen.getAllByText('Add to cart')
    userEvent.click(firstAddToCart)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'add_product_click',
      expect.not.objectContaining({
        page: expect.anything(),
        section: expect.anything(),
        position: expect.anything(),
        section_position: expect.anything(),
      }),
    )
  })

  it('should send decrease_product_click with complete payload when WEB_ADD_PRODUCT_CLICK_PAYLOAD is ON', async () => {
    activeFeatureFlags([
      knownFeatureFlags.WEB_VIDEO_SECTION,
      knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD,
    ])
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithVideoSection },
        { path: '/customers/1/cart/', responseBody: cartWithSources },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

    const videoSectionCard = screen.getByTestId('video-section-product-card')
    userEvent.click(
      within(videoSectionCard).getByLabelText(/Remove .*? from cart/),
    )

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      expect.objectContaining({
        layout: 'video',
        page: 'home',
        section: 'summer-recipes',
        position: 0,
        section_position: 0,
      }),
    )
  })

  it('should NOT include page, section, position and section_position in decrease_product_click when WEB_ADD_PRODUCT_CLICK_PAYLOAD is OFF', async () => {
    activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithVideoSection },
        { path: '/customers/1/cart/', responseBody: cartWithSources },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

    const videoSectionCard = screen.getByTestId('video-section-product-card')
    userEvent.click(
      within(videoSectionCard).getByLabelText(/Remove .*? from cart/),
    )

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      expect.not.objectContaining({
        page: expect.anything(),
        section: expect.anything(),
        position: expect.anything(),
        section_position: expect.anything(),
      }),
    )
  })

  it('should navigate and send metric when clicking the video', async () => {
    activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
    wrap(App)
      .atPath('/')
      .withNetwork([{ path: '/home/', responseBody: homeWithVideoSection }])
      .mount()

    await screen.findByText('Recetas de verano')

    const video = document.querySelector('video')
    userEvent.click(video!)

    expect(history.location.pathname).toBe('/home/seasons/summer-recipes/')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'video_section_video_click',
      {
        second: 0,
        source: 'summer-recipes',
      },
    )
  })

  it('should render a decorative mirror canvas with aria-hidden for the background effect', async () => {
    activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
    wrap(App)
      .atPath('/')
      .withNetwork([{ path: '/home/', responseBody: homeWithVideoSection }])
      .mount()

    await screen.findByText('Recetas de verano')

    const mirrorCanvas = document.querySelector('canvas[aria-hidden="true"]')
    expect(mirrorCanvas).toBeInTheDocument()
  })

  describe('viewport visibility', () => {
    let triggerIntersection: (isIntersecting: boolean) => void
    let originalIntersectionObserver: typeof IntersectionObserver

    beforeEach(() => {
      const intersectionCallbacks: IntersectionObserverCallback[] = []
      originalIntersectionObserver = global.IntersectionObserver
      global.IntersectionObserver = class {
        constructor(callback: IntersectionObserverCallback) {
          intersectionCallbacks.push(callback)
          triggerIntersection = (isIntersecting: boolean) => {
            intersectionCallbacks.forEach((cb) =>
              cb(
                [{ isIntersecting } as IntersectionObserverEntry],
                this as unknown as IntersectionObserver,
              ),
            )
          }
        }
        observe = vi.fn()
        disconnect = vi.fn()
      } as unknown as typeof IntersectionObserver
    })

    afterEach(() => {
      global.IntersectionObserver = originalIntersectionObserver
    })

    it('should pause the video when it leaves the viewport', async () => {
      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      wrap(App)
        .atPath('/')
        .withNetwork([{ path: '/home/', responseBody: homeWithVideoSection }])
        .mount()

      await screen.findByText('Recetas de verano')

      const video = document.querySelector(
        'video:not([aria-hidden])',
      ) as HTMLVideoElement
      const pauseSpy = vi.spyOn(video, 'pause').mockImplementation(() => {})

      triggerIntersection(false)

      expect(pauseSpy).toHaveBeenCalled()
    })

    it('should resume the video when it re-enters the viewport', async () => {
      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      wrap(App)
        .atPath('/')
        .withNetwork([{ path: '/home/', responseBody: homeWithVideoSection }])
        .mount()

      await screen.findByText('Recetas de verano')

      const video = document.querySelector(
        'video:not([aria-hidden])',
      ) as HTMLVideoElement
      const playSpy = vi.spyOn(video, 'play').mockResolvedValue(undefined)

      triggerIntersection(false)
      triggerIntersection(true)

      expect(playSpy).toHaveBeenCalled()
    })

    it('should stop the canvas animation loop when leaving the viewport', async () => {
      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      wrap(App)
        .atPath('/')
        .withNetwork([{ path: '/home/', responseBody: homeWithVideoSection }])
        .mount()

      await screen.findByText('Recetas de verano')

      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')

      triggerIntersection(false)

      expect(cancelSpy).toHaveBeenCalled()
    })

    it('should restart the canvas animation loop when re-entering the viewport', async () => {
      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      wrap(App)
        .atPath('/')
        .withNetwork([{ path: '/home/', responseBody: homeWithVideoSection }])
        .mount()

      await screen.findByText('Recetas de verano')

      triggerIntersection(false)

      const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

      triggerIntersection(true)

      expect(rafSpy).toHaveBeenCalled()
    })

    it('should call drawImage when video readyState is 2', async () => {
      const VIDEO_STATUS_READY = 2
      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      wrap(App)
        .atPath('/')
        .withNetwork([{ path: '/home/', responseBody: homeWithVideoSection }])
        .mount()

      await screen.findByText('Recetas de verano')

      const video = document.querySelector(
        'video:not([aria-hidden])',
      ) as HTMLVideoElement
      Object.defineProperty(video, 'readyState', {
        value: VIDEO_STATUS_READY,
        configurable: true,
      })

      triggerIntersection(true)

      await waitFor(() => {
        expect(drawImageMock).toHaveBeenCalled()
      })
    })

    it('should not call drawImage when video readyState is 1', async () => {
      const VIDEO_STATUS_NO_READY = 1
      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      wrap(App)
        .atPath('/')
        .withNetwork([{ path: '/home/', responseBody: homeWithVideoSection }])
        .mount()

      await screen.findByText('Recetas de verano')

      const video = document.querySelector(
        'video:not([aria-hidden])',
      ) as HTMLVideoElement
      Object.defineProperty(video, 'readyState', {
        value: VIDEO_STATUS_NO_READY,
        configurable: true,
      })

      let drawCallback: FrameRequestCallback | undefined
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        drawCallback = cb
        return 1
      })

      triggerIntersection(true)
      drawCallback!(0)

      expect(drawImageMock).not.toHaveBeenCalled()
    })

    it('should send video_section_view_without_load metric when section becomes visible and video is not loaded', async () => {
      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      wrap(App)
        .atPath('/')
        .withNetwork([
          { path: '/customers/1/home/', responseBody: homeWithVideoSection },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Recetas de verano')

      triggerIntersection(true)

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'video_section_view_without_load',
        {
          source: 'summer-recipes',
          layout: 'video',
        },
      )
    })

    it('should not send video_section_view_without_load metric when video has loaded before section becomes visible', async () => {
      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      wrap(App)
        .atPath('/')
        .withNetwork([
          { path: '/customers/1/home/', responseBody: homeWithVideoSection },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Recetas de verano')

      const video = document.querySelector(
        'video:not([aria-hidden])',
      ) as HTMLVideoElement
      video.dispatchEvent(new Event('loadstart'))
      video.dispatchEvent(new Event('canplay'))

      triggerIntersection(true)

      expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
        'video_section_view_without_load',
        expect.anything(),
      )
    })

    it('should send video_section_view_without_load metric each time section becomes visible while video is not loaded', async () => {
      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      wrap(App)
        .atPath('/')
        .withNetwork([
          { path: '/customers/1/home/', responseBody: homeWithVideoSection },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Recetas de verano')

      triggerIntersection(true)
      triggerIntersection(false)
      triggerIntersection(true)

      expect(Tracker.sendInteraction).toHaveBeenCalledTimes(2)
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'video_section_view_without_load',
        { source: 'summer-recipes', layout: 'video' },
      )
    })

    it('should send error to monitoring when play fails for an unexpected reason', async () => {
      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      wrap(App)
        .atPath('/')
        .withNetwork([
          { path: '/customers/1/home/', responseBody: homeWithVideoSection },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Recetas de verano')

      const video = document.querySelector(
        'video:not([aria-hidden])',
      ) as HTMLVideoElement
      const error = new DOMException(
        'The element has no supported sources',
        'NotSupportedError',
      )
      vi.spyOn(video, 'play').mockRejectedValue(error)

      triggerIntersection(true)

      await waitFor(() =>
        expect(monitoring.captureError).toHaveBeenCalledWith(
          expect.objectContaining({ message: '[VideoSection] play() failed' }),
        ),
      )
    })
  })

  it('should send video_section_load_time metric when video can play after loading from server', async () => {
    activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithVideoSection },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Recetas de verano')

    const video = document.querySelector(
      'video:not([aria-hidden])',
    ) as HTMLVideoElement
    video.dispatchEvent(new Event('loadstart'))
    video.dispatchEvent(new Event('canplay'))

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'video_section_load_time',
      {
        source: 'summer-recipes',
        duration_ms: expect.any(Number),
        layout: 'video',
      },
    )
  })

  it('should send error to monitoring when video fails to load', async () => {
    activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithVideoSection },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Recetas de verano')

    const video = document.querySelector(
      'video:not([aria-hidden])',
    ) as HTMLVideoElement
    video.dispatchEvent(new Event('error'))

    expect(monitoring.captureError).toHaveBeenCalledWith(
      expect.objectContaining({ message: '[VideoSection] video load failed' }),
    )
  })

  it('should render at most 3 products even when more are provided', async () => {
    activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithVideoSectionWithManyProducts,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

    expect(screen.getByText('Producto 2 video section')).toBeInTheDocument()
    expect(screen.getByText('Producto 3 video section')).toBeInTheDocument()
    expect(
      screen.queryByText('Producto 4 video section'),
    ).not.toBeInTheDocument()
  })

  it('should NOT render the video section when FF is OFF', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithVideoSection },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    expect(screen.queryByText('Recetas de verano')).not.toBeInTheDocument()
  })

  describe('see all products link', () => {
    it('should not render link when no more than 3 products on screen >= 1200px', async () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200)

      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      const responses = [
        {
          path: '/customers/1/home/',
          responseBody: homeWithVideoSectionWithThreeProducts,
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      await screen.findByText(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )

      expect(
        screen.queryByRole('link', { name: /Ver todos los productos/ }),
      ).not.toBeInTheDocument()
    })

    it('should not render link with exactly 3 products at the 1200px boundary', async () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200)

      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      const responses = [
        {
          path: '/customers/1/home/',
          responseBody: homeWithVideoSectionWithManyProducts,
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      await screen.findByText(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )

      expect(
        screen.getByRole('link', { name: /Ver todos los productos/ }),
      ).toHaveAttribute(
        'href',
        '/home/seasons/summer-recipes/?home_section_type=video_section',
      )
    })

    it('should render link when 3 or more products on screen < 1200px', async () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1199)

      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      const responses = [
        {
          path: '/customers/1/home/',
          responseBody: homeWithVideoSectionWithThreeProducts,
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      await screen.findByText(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )

      expect(
        screen.getByRole('link', { name: /Ver todos los productos/ }),
      ).toBeInTheDocument()
    })

    it('should send home_section_click metric when clicking the link', async () => {
      activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])
      const responses = [
        {
          path: '/customers/1/home/',
          responseBody: homeWithVideoSectionWithManyProducts,
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      await screen.findByText('Recetas de verano')

      userEvent.click(
        screen.getByRole('link', { name: /Ver todos los productos/ }),
      )

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'home_section_click',
        {
          id: undefined,
          title: 'Recetas de verano',
          campaign_id: 'summer-recipes',
          home_section_type: 'video_section',
        },
      )
    })
  })
})
