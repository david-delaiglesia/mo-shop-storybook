import { screen, within } from '@testing-library/react'

import {
  addProductToCart,
  clickOnHighlightedBanner,
  emptyCart,
  resizeWindow,
} from '../helpers'
import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithHighlightedGroup } from 'app/catalog/__scenarios__/home'
import { productBaseDetail } from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Highlighted Group', () => {
  it('should show the highlighted group section', async () => {
    activeFeatureFlags(['web-highlighted-group'])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithHighlightedGroup },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    const highlightedGroup = await screen.findByText('Dos productos destacados')

    expect(
      within(highlightedGroup.parentElement!).getByText('Aproveche'),
    ).toBeInTheDocument()
    expect(
      within(highlightedGroup.parentElement!).getByText(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      ),
    ).toBeInTheDocument()
    expect(
      within(highlightedGroup.parentElement!).getByText('90 g'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: 'imagen del producto Fideos orientales Yakisoba sabor pollo Hacendado',
      }),
    ).toHaveAttribute(
      'src',
      'https://sta-mercadona.imgix.net/images/26db68648970f989049016e551611aa9.jpg?',
    )
    expect(
      within(highlightedGroup.parentElement!).getByText(
        'Uva blanca con semillas',
      ),
    ).toBeInTheDocument()
    expect(
      within(highlightedGroup.parentElement!).getByText('200 g'),
    ).toBeInTheDocument()
    expect(
      within(highlightedGroup.parentElement!).getAllByText('Paquete'),
    ).toHaveLength(2)
    expect(
      within(highlightedGroup.parentElement!).getAllByText('Add to cart'),
    ).toHaveLength(2)
  })

  it('should show the highlighted group section for non-logged users', async () => {
    activeFeatureFlags(['web-highlighted-group'])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithHighlightedGroup },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Dos productos destacados')

    const highlightedGroup = await screen.findByText('Dos productos destacados')

    expect(
      within(highlightedGroup.parentElement!).getByText('Aproveche'),
    ).toBeInTheDocument()
    expect(
      within(highlightedGroup.parentElement!).getByText(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      ),
    ).toBeInTheDocument()
    expect(
      within(highlightedGroup.parentElement!).getByText('90 g'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: 'imagen del producto Fideos orientales Yakisoba sabor pollo Hacendado',
      }),
    ).toHaveAttribute(
      'src',
      'https://sta-mercadona.imgix.net/images/26db68648970f989049016e551611aa9.jpg?',
    )
    expect(
      within(highlightedGroup.parentElement!).getByText(
        'Uva blanca con semillas',
      ),
    ).toBeInTheDocument()
    expect(
      within(highlightedGroup.parentElement!).getByText('200 g'),
    ).toBeInTheDocument()
    expect(
      within(highlightedGroup.parentElement!).getAllByText('Paquete'),
    ).toHaveLength(2)
    expect(
      within(highlightedGroup.parentElement!).getAllByText('Add to cart'),
    ).toHaveLength(2)
  })

  // TODO: remove when FF is disabled
  it('should NOT show the highlighted group section if FF is disabled', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithHighlightedGroup },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    expect(
      screen.queryByText('Dos productos destacados'),
    ).not.toBeInTheDocument()
  })

  // TODO: remove when FF is disabled
  it('should NOT show the highlighted group section for non-logged users if FF is disabled', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithHighlightedGroup },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    expect(
      screen.queryByText('Dos productos destacados'),
    ).not.toBeInTheDocument()
  })

  it('should animate wrapper and move to next slide after 4 seconds', async () => {
    activeFeatureFlags(['web-highlighted-group'])
    vi.useFakeTimers()
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithHighlightedGroup },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Dos productos destacados')
    resizeWindow()

    const wrapper = screen
      .getByText('Fideos orientales Yakisoba sabor pollo Hacendado')
      .closest('.highlighted-group__wrapper')
    expect(wrapper).toHaveStyle('transform: translateX(0px)')

    vi.advanceTimersByTime(4000)

    expect(wrapper).toHaveStyle('transform: translateX(-1272px)')

    vi.useRealTimers()
  })

  it('should stop animating wrapper if user clicks on add to cart', async () => {
    activeFeatureFlags(['web-highlighted-group'])
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])

    vi.useFakeTimers()
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithHighlightedGroup },
      { path: '/customers/1/cart/', responseBody: emptyCart },
      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Dos productos destacados')
    resizeWindow()

    const wrapper = screen
      .getByText('Fideos orientales Yakisoba sabor pollo Hacendado')
      .closest('.highlighted-group__wrapper')

    addProductToCart(
      screen.getByRole('button', {
        name: 'Fideos orientales Yakisoba sabor pollo Hacendado, Paquete, 90 Grams, 0,85€ per Unit',
      }).parentElement,
    )

    vi.advanceTimersByTime(4000)

    expect(wrapper).toHaveStyle('transform: translateX(0px)')

    vi.useRealTimers()
  })

  it('should stop animating wrapper if user opens product detail', async () => {
    activeFeatureFlags(['web-highlighted-group'])
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])

    vi.useFakeTimers()
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithHighlightedGroup },
      { path: '/customers/1/cart/', responseBody: emptyCart },
      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Dos productos destacados')
    resizeWindow()

    const wrapper = screen
      .getByText('Fideos orientales Yakisoba sabor pollo Hacendado')
      .closest('.highlighted-group__wrapper')

    clickOnHighlightedBanner()

    await screen.findByRole('dialog')

    vi.advanceTimersByTime(4000)

    expect(wrapper).toHaveStyle('transform: translateX(0px)')

    vi.useRealTimers()
  })

  it('should NOT show mobile image if screen size < 992px and FF is disabled', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(991)
    activeFeatureFlags(['web-highlighted-group'])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithHighlightedGroup },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Dos productos destacados')

    expect(
      screen.getByRole('img', {
        name: 'imagen del producto Fideos orientales Yakisoba sabor pollo Hacendado',
      }),
    ).toHaveAttribute(
      'src',
      'https://sta-mercadona.imgix.net/images/26db68648970f989049016e551611aa9.jpg?',
    )
  })

  it('should show mobile image if screen size < 992px', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(991)
    activeFeatureFlags([
      'web-highlighted-group',
      'web-highlighted-group-responsive-images',
    ])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithHighlightedGroup },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Dos productos destacados')

    expect(
      screen.getByRole('img', {
        name: 'imagen del producto Fideos orientales Yakisoba sabor pollo Hacendado',
      }),
    ).toHaveAttribute(
      'src',
      'https://sta-mercadona.imgix.net/images/4cf03f082ecc8a8635f24af5bc3f2d36.jpg?',
    )
  })
})
