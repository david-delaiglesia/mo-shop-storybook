import { screen, within } from '@testing-library/react'

import {
  addProductToCart,
  addProductToCartFromDetail,
  goToBannerProducts,
  openProductDetailSimplified,
  resizeWindow,
  seeFirstBannerWithBottomControl,
  seeNextBannerWithArrow,
  seePreviousBannerWithArrow,
  seeSecondBannerWithBottomControl,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  homeWithBanner,
  homeWithMultipleBanners,
} from 'app/catalog/__scenarios__/home'
import { season } from 'app/catalog/__scenarios__/seasons'
import { getProductCell } from 'pages/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Banner', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should navigate to banner season products', async () => {
    const responses = [
      { path: '/home/', responseBody: homeWithBanner },
      { path: '/home/seasons/99/', responseBody: season },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Para tu San Valentín')
    goToBannerProducts()
    await screen.findByText('Para tu San Valentín')

    const bannerProduct = getProductCell(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(bannerProduct).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('home_section_click', {
      id: 99,
      title: 'Para tu San Valentín',
      campaign_id: 'your-way-irresistible',
      home_section_type: 'hero_banner',
    })
  })

  describe('when navigating to a banner results page', () => {
    it('should send the home_section_type when adding a product from the product cell', async () => {
      const today = new Date().toISOString().split('T')[0]
      const responses = [
        { path: '/home/', responseBody: homeWithBanner },
        { path: '/home/seasons/99/', responseBody: season },
      ]
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Para tu San Valentín')
      goToBannerProducts()
      await screen.findByText('Para tu San Valentín')

      const bannerProduct = getProductCell(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )

      addProductToCart(bannerProduct)

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'add_product_click',
        {
          added_amount: 1,
          amount: 0,
          cart_id: '10000000-1000-4000-8000-100000000000',
          cart_mode: 'purchase',
          display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
          first_product: true,
          first_product_added_at: expect.stringContaining(today),
          id: '8731',
          merca_code: '8731',
          layout: 'grid',
          order: 0,
          price: '0,85',
          requires_age_check: false,
          selling_method: 'units',
          source: 'season',
        },
      )
    })

    it('should send the home_section_type when adding a product from the product modal', async () => {
      const today = new Date().toISOString().split('T')[0]
      const responses = [
        { path: '/home/', responseBody: homeWithBanner },
        { path: '/home/seasons/99/', responseBody: season },
      ]
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Para tu San Valentín')
      goToBannerProducts()
      await screen.findByText('Para tu San Valentín')

      const bannerProduct = getProductCell(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )

      const productCellButton = within(bannerProduct!).getByRole('button', {
        name: 'Fideos orientales Yakisoba sabor pollo Hacendado, Paquete, 90 Grams, 0,85€ per Unit',
      })

      openProductDetailSimplified(productCellButton)

      const productDetail = screen.getByRole('dialog')

      addProductToCartFromDetail(productDetail)

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'add_product_click',
        {
          added_amount: 1,
          amount: 0,
          cart_id: '10000000-1000-4000-8000-100000000000',
          cart_mode: 'purchase',
          display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
          first_product: true,
          first_product_added_at: expect.stringContaining(today),
          id: '8731',
          merca_code: '8731',
          layout: 'product_detail',
          price: '0,85',
          requires_age_check: false,
          selling_method: 'units',
          source: 'season',
        },
      )
    })
  })

  it('should show the banner section', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithBanner },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Para tu San Valentín')

    const banner = screen.getByText('Para tu San Valentín').closest('a')
    const bannerLink = screen.getByText('View products').closest('a')
    expect(bannerLink).toHaveAttribute(
      'href',
      '/home/seasons/99?home_section_type=hero_banner',
    )
    expect(banner).toHaveTextContent('Para tu San Valentín')
    expect(banner).toHaveTextContent('View products')
  })

  it('should show the multiple banners', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithMultipleBanners },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Para tu San Valentín')

    const firstBanner = screen.getByText('Para tu San Valentín').closest('a')
    const secondBanner = screen.getByText('Date un homenaje').closest('a')
    const bannerContainer = screen
      .getByText('Para tu San Valentín')
      .closest('.banner__wrapper')
    expect(firstBanner).toBeInTheDocument()
    expect(secondBanner).toBeInTheDocument()
    expect(screen.getByLabelText('arrow--right')).toBeInTheDocument()
    expect(screen.getByLabelText('arrow--left')).toBeInTheDocument()
    expect(bannerContainer).not.toHaveStyle(
      expect.stringContaining('transform'),
    )
  })

  it('should scroll backward manually when there are multiple banners', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithMultipleBanners },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Para tu San Valentín')
    seeNextBannerWithArrow()
    seePreviousBannerWithArrow()

    const bannerContainer = screen
      .getByText('Para tu San Valentín')
      .closest('.banner__wrapper')
    expect(bannerContainer).toHaveStyle('transform: translateX(0px)')
  })

  it('should scroll backward with the bottom controllers when there are multiple banners', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithMultipleBanners },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Para tu San Valentín')
    seeSecondBannerWithBottomControl()
    seeFirstBannerWithBottomControl()

    const bannerContainer = screen
      .getByText('Para tu San Valentín')
      .closest('.banner__wrapper')
    expect(bannerContainer).toHaveStyle('transform: translateX(0px)')
  })

  it('should resize the banner if the window width changes when there are multiple banners', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithMultipleBanners },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Para tu San Valentín')
    resizeWindow()

    const bannerContainer = screen
      .getByText('Para tu San Valentín')
      .closest('.banner__wrapper')
    expect(bannerContainer).toHaveStyle('transform: translateX(0px)')
  })
})
