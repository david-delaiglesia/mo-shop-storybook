import { screen } from '@testing-library/react'

import {
  addPrivateProductToCart,
  doFocusOnProduct,
  goToProductCategories,
  shareProduct,
  shareProductLink,
} from './helpers'
import moment from 'moment'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import {
  productBaseDetail,
  productBaseDetailWithUnavailableFromDate,
  productBaseDetailWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate,
  productBaseDetailWithUnavailableMondayWednesday,
  productBaseDetailWithUnavailableSunday,
  productBaseDetailWithoutUnavailableFromDate,
  productWithoutXSelling,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'
import { getNumberDay, getStringMonthDay } from 'utils/dates'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Product - Private', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    moment.locale('en')
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should show the private product detail if the postal code is available', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    expect(
      screen.getByText('Descripción Fideos orientales Yakisoba sabor pollo'),
    ).toBeInTheDocument()
    expect(screen.getByText('Paquete')).toBeInTheDocument()
    expect(screen.getByText('90 g')).toBeInTheDocument()
    expect(screen.getByText(/9,44 €\/kg/)).toBeInTheDocument()
    expect(screen.getByText('0,85 €')).toBeInTheDocument()
    expect(screen.getByText('Add to cart')).toBeInTheDocument()
    expect(
      screen.queryByText('Order restricted to people over 18 years of age.'),
    ).not.toBeInTheDocument()
  })

  it('should be able to set campaign ID to user properties when there is a campaign and user opens the private product detail page', async () => {
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

  it('should show a notification and copy the URL to the clipboard', async () => {
    navigator.clipboard = { writeText: vi.fn() }
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    shareProduct()
    await screen.findByText('Link copied to the clipboard')

    expect(screen.getByText('Link copied to the clipboard')).toBeInTheDocument()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        '/product/8731/fideos-orientales-yakisoba-sabor-pollo-hacendado-paquete',
      ),
    )
  })

  it('should go to the product category using the breadcrumb', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/120/',
        responseBody: { ...categoryDetail, id: 120 },
      },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    goToProductCategories('Pasta y fideos')
    await screen.findByText('Aceite, especias y salsas')

    expect(screen.getByText('Arroz, legumbres y pasta')).toBeInTheDocument()
    expect(screen.getByText('Pasta y fideos')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('breadcrumb_click', {
      id: 120,
      name: 'Pasta y fideos',
    })
  })

  it('should show the breacrumb after increasing the product', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    const breadcrumb = screen.getByText('Arroz, legumbres y pasta >')

    addPrivateProductToCart()

    expect(breadcrumb).toBeInTheDocument()
  })

  it('should send the zoom metrics', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    doFocusOnProduct()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('zoom_image_click', {
      display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
      id: '8731',
      picture_name: 'fideos-orientales-first-image.jpg?fit=crop&h=600&w=600',
      position: 0,
    })
  })

  it('should be able to share the product link', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    shareProductLink()
    const feedbackMessage = await screen.findByText(
      'Link copied to the clipboard',
    )

    expect(feedbackMessage).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('share_product', {
      display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
      id: '8731',
    })
  })

  it('should show the average unit price with 3 digits', async () => {
    const responses = [
      {
        path: '/products/8731/',
        responseBody: {
          ...productBaseDetail,
          price_instructions: {
            ...productBaseDetail.price_instructions,
            reference_price: '9.444',
          },
        },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    expect(screen.getByText('| 9,444 €/kg')).toBeInTheDocument()
  })

  it('should load the product detail for the user session warehouse', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText('Related products')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/products/8731/?lang=en&wh=vlc1'),
        method: 'GET',
      }),
    )
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(
          '/products/8731/xselling/?lang=en&wh=vlc1&exclude=',
        ),
        method: 'GET',
      }),
    )
  })

  it('should show the previous unit price along with unit price when it exists', async () => {
    const responses = [
      {
        path: '/products/8731/',
        responseBody: {
          ...productBaseDetail,
          price_instructions: {
            ...productBaseDetail.price_instructions,
            previous_unit_price: '0.95',
          },
        },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    expect(screen.getByText('0,95 €')).toBeInTheDocument()
    expect(screen.getByText('0,85 €')).toBeInTheDocument()
  })

  it('should not show the previous unit price if it does not exist', async () => {
    const responses = [
      {
        path: '/products/8731/',
        responseBody: {
          ...productBaseDetail,
          price_instructions: {
            ...productBaseDetail.price_instructions,
          },
        },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    expect(screen.queryByText('NaN €')).not.toBeInTheDocument()
    expect(screen.getByText('0,85 €')).toBeInTheDocument()
  })

  it('should not see the unavailable info if does not exists unavailable days', async () => {
    const responses = [
      {
        path: '/products/8731/',
        responseBody: productBaseDetail,
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    expect(
      screen.queryByText('This product is not available .'),
    ).not.toBeInTheDocument()
  })

  it('should not see the unavailable info if does not have unavailable days', async () => {
    const responses = [
      {
        path: '/products/8731/',
        responseBody: {
          ...productBaseDetail,
          unavailable_weekdays: [],
        },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    expect(
      screen.queryByText('This product is not available on .'),
    ).not.toBeInTheDocument()
  })

  it('should see the unavailable info', async () => {
    const responses = [
      {
        path: '/products/8731/',
        responseBody: productBaseDetailWithUnavailableSunday,
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    expect(
      screen.getByText('This product is not available on sunday.'),
    ).toBeInTheDocument()
  })

  it('should see the unavailable info with more than one day', async () => {
    const responses = [
      {
        path: '/products/8731/',
        responseBody: productBaseDetailWithUnavailableMondayWednesday,
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    expect(
      screen.getByText('This product is not available on monday, wednesday.'),
    ).toBeInTheDocument()
  })

  it('should not see the unavailable from info if it is not valid', async () => {
    const responses = [
      {
        path: '/products/8731/',
        responseBody: productBaseDetailWithoutUnavailableFromDate,
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    expect(
      screen.queryByText(/This product is not available from/i),
    ).not.toBeInTheDocument()
  })

  it('should not see the unavailable from info if it is yesterday', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const month = getStringMonthDay(yesterday)
    const day = getNumberDay(yesterday)

    const responses = [
      {
        path: '/products/8731/',
        responseBody: productBaseDetailWithUnavailableFromDate(yesterday),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    expect(
      screen.queryByText(`This product is not available from ${month} ${day}`),
    ).not.toBeInTheDocument()
  })

  it('should see the unavailable from info if FF is enabled', async () => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    const month = getStringMonthDay(date)
    const day = getNumberDay(date)

    const responses = [
      {
        path: '/products/8731/',
        responseBody: productBaseDetailWithUnavailableFromDate(date),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    expect(
      screen.getByText(`This product is not available from ${month} ${day}`),
    ).toBeInTheDocument()
  })

  it('should see the unavailable weekdays info of unavailable_from FF is enabled', async () => {
    const responses = [
      {
        path: '/products/8731/',
        responseBody: productBaseDetailWithUnavailableSunday,
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    expect(
      screen.getByText('This product is not available on sunday.'),
    ).toBeInTheDocument()
  })

  describe('when the product only has unavailable because of the weekdays', () => {
    it('should show the message for 1 weekdays', async () => {
      const nextMonday = moment().add(1, 'weeks').day(1).toDate()

      const notAvailableFromDay = getNumberDay(nextMonday)
      const notAvailableFromMonth = getStringMonthDay(nextMonday)
      const responses = [
        {
          path: '/products/8731/',
          responseBody:
            productBaseDetailWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate(
              null,
              [nextMonday],
            ),
        },
        {
          path: '/products/8731/xselling/',
          responseBody: productWithoutXSelling,
        },
      ]
      wrap(App).atPath('/product/8731').withNetwork(responses).mount()

      await screen.findByText(
        'Descripción Fideos orientales Yakisoba sabor pollo',
      )

      expect(
        screen.getByText('This product is not available on monday.'),
      ).toBeInTheDocument()
      expect(
        screen.queryByText(
          `This product is not available from ${notAvailableFromDay} ${notAvailableFromMonth}`,
        ),
      ).not.toBeInTheDocument()
    })

    it('should show the message for 2 weekdays', async () => {
      const nextMonday = moment().add(1, 'weeks').day(1).toDate()
      const nextTuesday = moment().add(1, 'weeks').day(2).toDate()

      const responses = [
        {
          path: '/products/8731/',
          responseBody:
            productBaseDetailWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate(
              null,
              [nextMonday, nextTuesday],
            ),
        },
        {
          path: '/products/8731/xselling/',
          responseBody: productWithoutXSelling,
        },
      ]
      wrap(App).atPath('/product/8731').withNetwork(responses).mount()

      await screen.findByText(
        'Descripción Fideos orientales Yakisoba sabor pollo',
      )

      expect(
        screen.getByText('This product is not available on monday, tuesday.'),
      ).toBeInTheDocument()
    })
  })

  describe('when the product only has unavailable because of the unavailable from date', () => {
    it('should show unavailable from date message', async () => {
      const nextMonday = moment().add(1, 'weeks').day(1).toDate()

      const notAvailableFromDay = getNumberDay(nextMonday)
      const notAvailableFromMonth = getStringMonthDay(nextMonday)

      const responses = [
        {
          path: '/products/8731/',
          responseBody:
            productBaseDetailWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate(
              nextMonday,
              [],
            ),
        },
        {
          path: '/products/8731/xselling/',
          responseBody: productWithoutXSelling,
        },
      ]
      wrap(App).atPath('/product/8731').withNetwork(responses).mount()

      await screen.findByText(
        'Descripción Fideos orientales Yakisoba sabor pollo',
      )

      expect(
        screen.queryByText(
          `This product is not available from ${notAvailableFromMonth} ${notAvailableFromDay}`,
        ),
      ).toBeInTheDocument()
    })
  })

  describe('when the product is unavailable because of the weekdays and the unavailable from date', () => {
    it('should show the unavailable from date and unavailable weekdays message', async () => {
      const nextMonday = moment().add(1, 'weeks').day(1).toDate()

      const notAvailableFromDay = getNumberDay(nextMonday)
      const notAvailableFromMonth = getStringMonthDay(nextMonday).toLowerCase()
      const responses = [
        {
          path: '/products/8731/',
          responseBody:
            productBaseDetailWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate(
              nextMonday,
              [nextMonday],
            ),
        },
        {
          path: '/products/8731/xselling/',
          responseBody: productWithoutXSelling,
        },
      ]
      wrap(App).atPath('/product/8731').withNetwork(responses).mount()

      await screen.findByText(
        'Descripción Fideos orientales Yakisoba sabor pollo',
      )

      expect(
        screen.getByText(
          `This product is not available on monday. It will also cease to be available from ${notAvailableFromDay} ${notAvailableFromMonth}`,
        ),
      ).toBeInTheDocument()
    })
  })

  describe('When the current product is not blinking type', () => {
    it('should not show the message', async () => {
      const responses = [
        {
          path: '/products/8731/',
          responseBody:
            productBaseDetailWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate(
              null,
              [],
            ),
        },
        {
          path: '/products/8731/xselling/',
          responseBody: productWithoutXSelling,
        },
      ]
      wrap(App).atPath('/product/8731').withNetwork(responses).mount()

      await screen.findByText(
        'Descripción Fideos orientales Yakisoba sabor pollo',
      )

      expect(
        screen.queryByTestId('private-product-detail__unavailable-reason'),
      ).not.toBeInTheDocument()
    })
  })
})
