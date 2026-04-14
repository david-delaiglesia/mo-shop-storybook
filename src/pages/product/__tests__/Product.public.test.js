import { fireEvent, screen } from '@testing-library/react'

import { confirmPostalCode, fillPostalCode } from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import {
  productBaseDetail,
  productWithoutXSelling,
} from 'app/catalog/__scenarios__/product'
import { Tracker } from 'services/tracker'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Product - Public', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should show the product detail properly', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    const image = await screen.findByAltText(
      'Main product image Fideos orientales Yakisoba sabor pollo Hacendado',
    )

    expect(image).toBeInTheDocument()
    expect(
      screen.getByText('Descripción Fideos orientales Yakisoba sabor pollo'),
    ).toBeInTheDocument()
    expect(screen.getByText('Do you want this product?')).toBeInTheDocument()
    expect(
      screen.getByText('Go to the shop by entering your postal code'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'The pack or product shown may not be up-to-date. We recommend that you check it upon receipt to confirm the details about it and its allergens. For additional information, contact us at our customer service Freephone 800 500 220.',
      ),
    ).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('product_detail', {
      product_id: '8731',
      display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
      public_mode: true,
    })
  })

  it('should be able to set campaign ID to user properties when there is a campaign and user opens the public product detail page', async () => {
    activeFeatureFlags(['web-campaign-user-event'])
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App)
      .atPath(
        '/product/8731/fideos-orientales-yakisoba-sabor-pollo-hacendado-paquete?campaign=verano',
      )
      .withNetwork(responses)
      .mount()

    await screen.findByAltText(
      'Main product image Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(Tracker.setUserProperties).toHaveBeenCalledWith({
      campaign: 'verano',
    })
  })

  it('should show the form to set the postal code', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText('Do you want this product?')

    expect(screen.getByLabelText('Postal code')).toBeInTheDocument()
    expect(screen.getByText('Enter')).toBeInTheDocument()
  })

  it('should show the proper header', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    const homeLink = await screen.findByLabelText('Home')

    expect(homeLink).toBeInTheDocument()
    expect(screen.queryByText('Categories')).not.toBeInTheDocument()
    expect(screen.queryByText('My Essentials')).not.toBeInTheDocument()
  })

  it('should display product image when it is empty', async () => {
    const responses = [
      {
        path: '/products/8731/',
        responseBody: { ...productBaseDetail, photos: [] },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText('Do you want this product?')

    const productImage = screen.getByAltText(
      'Main product image Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(productImage).toBeInTheDocument()
  })

  it('should load the product detail for the default warehouse', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText('Do you want this product?')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/products/8731/?lang=en&wh=vlc1'),
        method: 'GET',
      }),
    )
  })

  describe('when setting a postal code', () => {
    it('should show the private product detail if the postal code is available', async () => {
      const responses = [
        { path: '/products/8731/', responseBody: productBaseDetail },
        {
          path: '/products/8731/xselling/',
          responseBody: productWithoutXSelling,
        },
        {
          path: '/postal-codes/actions/change-pc/',
          requestBody: { new_postal_code: '46010' },
          method: 'put',
        },
      ]
      wrap(App).atPath('/product/8731').withNetwork(responses).mount()

      await screen.findByText('Do you want this product?')
      fillPostalCode('46010')
      confirmPostalCode()

      const units = await screen.findByText('Paquete')

      expect(units).toBeInTheDocument()
      expect(screen.getByText('| 9,44 €/kg')).toBeInTheDocument()
      expect(screen.getByText('Add to cart')).toBeInTheDocument()
    })

    it('should show the modal to go to the old web if the postal code is unavailable', async () => {
      const responses = [
        { path: '/products/8731/', responseBody: productBaseDetail },
        {
          path: '/products/8731/xselling/',
          responseBody: productWithoutXSelling,
        },
        {
          path: '/postal-codes/actions/change-pc/',
          requestBody: { new_postal_code: '46010' },
          method: 'put',
          status: 404,
        },
      ]
      wrap(App).atPath('/product/8731').withNetwork(responses).mount()

      await screen.findByText('Do you want this product?')
      fillPostalCode('46010')
      confirmPostalCode()
      const modal = await screen.findByRole('dialog')

      expect(modal).toHaveTextContent(
        'The new Mercadona online service is not available yet in the "46010" postal code.',
      )
    })
  })

  describe('Mobile version', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.resetAllMocks()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should not display the mobile blocker', async () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false })
      const responses = [
        { path: '/products/8731/', responseBody: productBaseDetail },
      ]
      wrap(App).atPath('/product/8731').withNetwork(responses).mount()

      await screen.findByText('Do you want this product?')

      expect(
        screen.queryByText(
          'Download the app to buy from your mobile or tablet.',
        ),
      ).not.toBeInTheDocument()
    })

    it('should show generic links', async () => {
      const responses = [
        { path: '/products/8731/', responseBody: productBaseDetail },
      ]
      wrap(App)
        .atPath('/product/8731?appNotFound')
        .withNetwork(responses)
        .mount()

      await screen.findByText('Do you want this product?')

      expect(screen.getByAltText('Abrir App en App Store')).toBeInTheDocument()
      expect(screen.getByAltText('Abrir App en Play Store')).toBeInTheDocument()
    })

    it('should navigate to App Store if user does not have the app installed', async () => {
      vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('iPhone')
      vi.spyOn(document, 'hasFocus').mockReturnValue(true)

      const responses = [
        { path: '/products/8731/', responseBody: productBaseDetail },
      ]
      wrap(App)
        .atPath('/product/8731?campaign=verano')
        .withNetwork(responses)
        .mount()

      await screen.findByText('Do you want this product?')

      expect(screen.getByText('Open in App')).toBeInTheDocument()
      const responsiveButton = screen.getByTestId('open-in-app')
      fireEvent.click(responsiveButton)

      vi.advanceTimersByTime(3000)

      expect(window.location).toBe(
        'https://itunes.apple.com/app/apple-store/id1368037685',
      )
    })

    it('should navigate to deep Link in Android', async () => {
      vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('android')

      const responses = [
        { path: '/products/8731/', responseBody: productBaseDetail },
      ]
      wrap(App)
        .atPath('/product/8731?campaign=campaign_id')
        .withNetwork(responses)
        .mount()

      await screen.findByText('Do you want this product?')

      expect(screen.getByText('Open in App')).toBeInTheDocument()
      const responsiveButton = screen.getByTestId('open-in-app')
      fireEvent.click(responsiveButton)

      expect(window.location).toBe(
        'intent://tienda.mercadona.es/product/8731/?campaign=campaign_id#Intent;scheme=mercadona;package=es.mercadona.tienda;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Des.mercadona.tienda%26referrer%3Dproduct%2F8731%2F%3Fcampaign%3Dcampaign_id;end;',
      )
    })

    it('should navigate to deep Link in iOS', async () => {
      vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('iPhone')

      const responses = [
        { path: '/products/8731/', responseBody: productBaseDetail },
      ]
      wrap(App)
        .atPath('/product/8731?campaign=verano')
        .withNetwork(responses)
        .mount()

      await screen.findByText('Do you want this product?')

      expect(screen.getByText('Open in App')).toBeInTheDocument()
      const responsiveButton = screen.getByTestId('open-in-app')
      fireEvent.click(responsiveButton)

      expect(window.location).toBe(
        'mercadona://tienda.mercadona.es/product/8731?campaign=verano',
      )
    })
  })
})
