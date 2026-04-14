import { screen } from '@testing-library/react'

import { changeLanguage, goToCarouselDetail } from './helpers'
import { NetworkResponses, configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import {
  englishHomeWithRecommendations,
  homeWithBanner,
  homeWithCarousel,
  homeWithGrid,
  homeWithRecommendations,
} from 'app/catalog/__scenarios__/home'
import { productBase } from 'app/catalog/__scenarios__/product'
import { newArrivals } from 'app/catalog/__scenarios__/sections'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { IntersectionObserverMock } from 'pages/__tests__/IntersectionObserverMock'
import { addProduct } from 'pages/helpers'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Sections', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    Cookie.get = vi.fn((cookie: string) => cookies[cookie]) as <
      CookieValueType,
    >(
      cookieName: string,
    ) => CookieValueType
    vi.useFakeTimers()
    global.IntersectionObserver =
      IntersectionObserverMock as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    Storage.clear()
    vi.useRealTimers()
  })

  it('should call home sections only once on load when is anonymous', async () => {
    const responses = [
      {
        path: '/home/',
        responseBody: homeWithBanner,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Para tu San Valentín')
    expect('/home/').toHaveBeenFetchedTimes(1)
  })

  it('should call home sections only once on load when is logged', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithBanner,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Para tu San Valentín')
    expect('/customers/1/home/').toHaveBeenFetchedTimes(1)
  })

  it('should update the content info when the language changes', async () => {
    const responses = [
      {
        path: '/customers/1/home/?lang=en&wh=vlc1',
        responseBody: englishHomeWithRecommendations,
        catchParams: true,
      },
      {
        path: '/customers/1/home/?lang=es&wh=vlc1',
        responseBody: homeWithRecommendations,
        catchParams: true,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Recommended for you')
    changeLanguage('Spanish')
    await screen.findByText('Recomendado para ti')

    const recommendationsSection = screen
      .getByText('Recomendado para ti')
      .closest('section')
    expect(recommendationsSection).toHaveTextContent(
      'Selección personal basada en tus preferencias',
    )
    expect(
      screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
    ).toBeInTheDocument()
  })

  it('should show the banner section', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithBanner },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Para tu San Valentín')

    const banner = screen.getByText('Para tu San Valentín').closest('a')
    expect(banner).toHaveAttribute(
      'href',
      '/home/seasons/99?home_section_type=hero_banner',
    )
    expect(banner).toHaveTextContent('Para tu San Valentín')
    expect(banner).toHaveTextContent('View products')
  })

  it('should show the grid section', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    const gridSection = screen.getByText('Novedades').closest('section')
    expect(gridSection).toBeInTheDocument()
    expect(gridSection).toHaveTextContent(
      'Productos recién añadidos o mejorados',
    )
    expect(
      screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
    ).toBeInTheDocument()
    expect(Tracker.sendViewChange).not.toHaveBeenCalledWith(
      'home_recommendations',
    )
  })

  it('should show the recommendations grid section', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithRecommendations },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Recomendado para ti')

    const recommendationsSection = screen
      .getByText('Recomendado para ti')
      .closest('section')
    expect(recommendationsSection).toBeInTheDocument()
    expect(recommendationsSection).toHaveTextContent(
      'Selección personal basada en tus preferencias',
    )
    expect(
      screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
    ).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('home_recommendations')
  })

  it('should allow to add products from the carousel section', async () => {
    const todayDate = new Date().toISOString().split('T')[0]
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithCarousel },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
          lines: [{ quantity: 1, product_id: '8731', sources: ['+NA'] }],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByText('Novedades')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      id: '8731',
      merca_code: '8731',
      display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
      selling_method: 'units',
      amount: 0,
      price: '0,85',
      order: 0,
      source: 'new-arrivals',
      first_product_added_at: expect.stringContaining(todayDate),
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      layout: 'carousel',
      requires_age_check: false,
      cart_mode: 'purchase',
      added_amount: 1,
      first_product: true,
    })
  })

  it('should show the carousel section', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithCarousel },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    const carouselSection = screen.getByText('Novedades').closest('section')
    expect(carouselSection).toBeInTheDocument()
    const carouselLink = screen.getByText('Ver todas las novedades')
    expect(carouselLink).toHaveAttribute(
      'href',
      '/home/new-arrivals/?home_section_type=aut_carrousel',
    )
    expect(carouselSection).toHaveTextContent(
      'Productos recién añadidos o mejorados',
    )
    expect(
      screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
    ).toBeInTheDocument()
  })

  it('should go to the carousel section detail', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithCarousel },
      { path: '/customers/1/home/new-arrivals/', responseBody: newArrivals },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    goToCarouselDetail()
    await screen.findByText('Novedades')

    const carouselLink = screen.queryByText('Ver todas las novedades')
    expect(carouselLink).not.toBeInTheDocument()
    expect(
      screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
    ).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('home_section_click', {
      title: 'Novedades',
      campaign_id: 'new-arrivals',
      home_section_type: 'aut_carrousel',
    })
  })

  it('should NOT show "view all the products" link if there are less than 7 products', async () => {
    activeFeatureFlags(['web-carousel-hide-all-products-link'])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithCarousel },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    const carouselLink = screen.queryByText('Ver todas las novedades')
    expect(carouselLink).not.toBeInTheDocument()
  })

  it('should SHOW "view all the products" link if there are more than 6 products and screen width >= 1440px', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    activeFeatureFlags(['web-carousel-hide-all-products-link'])
    const homeWithCarouselWith7Products = structuredClone(homeWithCarousel)

    homeWithCarouselWith7Products.sections[1].content.items?.push(
      { ...productBase },
      { ...productBase },
      { ...productBase },
      { ...productBase },
      { ...productBase },
      { ...productBase },
    )
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithCarouselWith7Products,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    const carouselLink = screen.getByText('Ver todas las novedades')
    expect(carouselLink).toBeInTheDocument()
  })

  it('should SHOW "view all the products" link if there are 6 products and screen width <= 1200px', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200)
    activeFeatureFlags(['web-carousel-hide-all-products-link'])
    const homeWithCarouselWith6Products = structuredClone(homeWithCarousel)

    homeWithCarouselWith6Products.sections[1].content.items?.push(
      { ...productBase },
      { ...productBase },
      { ...productBase },
      { ...productBase },
      { ...productBase },
    )
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithCarouselWith6Products,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    const carouselLink = screen.getByText('Ver todas las novedades')
    expect(carouselLink).toBeInTheDocument()
  })

  it('should SHOW "view all the products" link if there are 5 products and screen width <= 992px', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(992)
    activeFeatureFlags(['web-carousel-hide-all-products-link'])
    const homeWithCarouselWith5Products = structuredClone(homeWithCarousel)

    homeWithCarouselWith5Products.sections[1].content.items?.push(
      { ...productBase },
      { ...productBase },
      { ...productBase },
      { ...productBase },
    )
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithCarouselWith5Products,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    const carouselLink = screen.getByText('Ver todas las novedades')
    expect(carouselLink).toBeInTheDocument()
  })

  it('should SHOW "view all the products" link if there are 4 products and screen width <= 480px', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(480)
    activeFeatureFlags(['web-carousel-hide-all-products-link'])
    const homeWithCarouselWith4Products = structuredClone(homeWithCarousel)

    homeWithCarouselWith4Products.sections[1].content.items?.push(
      { ...productBase },
      { ...productBase },
      { ...productBase },
    )
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithCarouselWith4Products,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    const carouselLink = screen.getByText('Ver todas las novedades')
    expect(carouselLink).toBeInTheDocument()
  })

  it('should not throw an error if the request fails', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        status: 404,
        responseBody: { errors: [] },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    const page404 = await screen.findByText(
      'Sorry, it is not possible to find the page you are looking for.',
    )

    expect(page404).toBeInTheDocument()
  })
})
