import { screen, within } from '@testing-library/react'

import {
  continueWithoutBlinkingProduct,
  keepShopping,
  selectDeliveryDate,
  selectDifferentDayBlinkingProduct,
  selectSaturdayDeliveryDate,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { address } from 'app/address/__scenarios__/address'
import { MinPurchaseAmountNotReachedException } from 'app/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  checkout,
  checkoutWithoutSlotWithBlinkingProduct,
  checkoutWithoutSlotWithStaticBlinkingProduct,
  checkoutWithoutSlotWithUnavailableFromBlinkingProduct,
  checkoutWithoutSlotWithoutUnavailableFromBlinkingProduct,
} from 'app/checkout/__scenarios__/checkout'
import {
  slotForFurtherWeek,
  slotsMock,
} from 'containers/slots-container/__tests__/mocks'
import { Storage } from 'services/storage'
import { getNumberDay, getShortDayName, getStringMonthDay } from 'utils/dates'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Delivery - Blinking Products- with FeatureFlag', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should close the modal and reset the day selected', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Delivery')
    selectDeliveryDate(tomorrow.getDate())
    selectDifferentDayBlinkingProduct()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('radio', {
        name: `${tomorrow.getDate().toString()} ${getShortDayName(tomorrow)}`,
        checked: true,
      }),
    ).not.toBeInTheDocument()
  })

  it('should see the new modal when select a day that match with a blinking product', async () => {
    const SATURDAY = 6
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutSlotWithStaticBlinkingProduct([
            SATURDAY,
          ]),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotForFurtherWeek,
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Delivery')
    selectSaturdayDeliveryDate()

    const modal = screen.getByRole('dialog')
    const monday = within(modal).getByText('M').parentNode
    const tuesday = within(modal).getByText('TU').parentNode
    const wednesday = within(modal).getByText('W').parentNode
    const thursday = within(modal).getByText('T').parentNode
    const friday = within(modal).getByText('F').parentNode
    const saturday = within(modal).getByText('S').parentNode
    expect(modal).toHaveTextContent(
      'These products will not be available on the selected day',
    )
    expect(modal).toHaveTextContent('Ron dominicano añejo superior Brugal')

    expect(modal).toHaveTextContent(`Not available on Saturday`)
    expect(modal).toContainElement(
      screen.getByRole('button', { name: 'Continue without the products' }),
    )
    expect(modal).toContainElement(
      screen.getByRole('button', { name: 'Select a different day' }),
    )
    expect(within(modal).getByRole('img')).toBeInTheDocument()
    expect(monday).toHaveClass('blinking-product__weekday--available')
    expect(tuesday).toHaveClass('blinking-product__weekday--available')
    expect(wednesday).toHaveClass('blinking-product__weekday--available')
    expect(thursday).toHaveClass('blinking-product__weekday--available')
    expect(friday).toHaveClass('blinking-product__weekday--available')
    expect(saturday).toHaveClass('blinking-product__weekday--unavailable')
  })

  it('should see the new modal when select a day that match with a blinking product, show the sentence with two unavailable days', async () => {
    const FRIDAY = 5
    const SATURDAY = 6
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutSlotWithStaticBlinkingProduct([
            FRIDAY,
            SATURDAY,
          ]),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotForFurtherWeek,
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Delivery')
    selectSaturdayDeliveryDate()

    const modal = screen.getByRole('dialog')
    const monday = within(modal).getByText('M').parentNode
    const tuesday = within(modal).getByText('TU').parentNode
    const wednesday = within(modal).getByText('W').parentNode
    const thursday = within(modal).getByText('T').parentNode
    const friday = within(modal).getByText('F').parentNode
    const saturday = within(modal).getByText('S').parentNode
    expect(modal).toHaveTextContent(
      'These products will not be available on the selected day',
    )

    expect(modal).toHaveTextContent('Ron dominicano añejo superior Brugal')
    expect(modal).toHaveTextContent('Not available on Friday, Saturday')

    expect(modal).toContainElement(
      screen.getByRole('button', { name: 'Continue without the products' }),
    )
    expect(modal).toContainElement(
      screen.getByRole('button', { name: 'Select a different day' }),
    )
    expect(within(modal).getByRole('img')).toBeInTheDocument()
    expect(monday).toHaveClass('blinking-product__weekday--available')
    expect(tuesday).toHaveClass('blinking-product__weekday--available')
    expect(wednesday).toHaveClass('blinking-product__weekday--available')
    expect(thursday).toHaveClass('blinking-product__weekday--available')
    expect(friday).toHaveClass('blinking-product__weekday--unavailable')
    expect(saturday).toHaveClass('blinking-product__weekday--unavailable')
  })

  it('should see the new modal when select a day that match with a blinking product, show the sentence with three or more unavailable days', async () => {
    const THURSDAY = 4
    const FRIDAY = 5
    const SATURDAY = 6
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutSlotWithStaticBlinkingProduct([
            THURSDAY,
            FRIDAY,
            SATURDAY,
          ]),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotForFurtherWeek,
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Delivery')
    selectSaturdayDeliveryDate()

    const modal = screen.getByRole('dialog')
    const monday = within(modal).getByText('M').parentNode
    const tuesday = within(modal).getByText('TU').parentNode
    const wednesday = within(modal).getByText('W').parentNode
    const thursday = within(modal).getByText('T').parentNode
    const friday = within(modal).getByText('F').parentNode
    const saturday = within(modal).getByText('S').parentNode
    expect(modal).toHaveTextContent(
      'These products will not be available on the selected day',
    )

    expect(modal).toHaveTextContent('Ron dominicano añejo superior Brugal')
    expect(modal).toHaveTextContent(
      'Only available on Monday, Tuesday, Wednesday',
    )

    expect(modal).toContainElement(
      screen.getByRole('button', { name: 'Continue without the products' }),
    )
    expect(modal).toContainElement(
      screen.getByRole('button', { name: 'Select a different day' }),
    )
    expect(within(modal).getByRole('img')).toBeInTheDocument()
    expect(monday).toHaveClass('blinking-product__weekday--available')
    expect(tuesday).toHaveClass('blinking-product__weekday--available')
    expect(wednesday).toHaveClass('blinking-product__weekday--available')
    expect(thursday).toHaveClass('blinking-product__weekday--unavailable')
    expect(friday).toHaveClass('blinking-product__weekday--unavailable')
    expect(saturday).toHaveClass('blinking-product__weekday--unavailable')
  })

  it('should update the checkout when confirm remove blinking products', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            {
              responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
            },
            {
              responseBody: checkout,
            },
          ],
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/checkouts/5/remove-lines/',
          method: 'post',
          requestBody: {
            product_ids: ['28745'],
          },
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('60,00 €')
    selectDeliveryDate(tomorrow.getDate())
    continueWithoutBlinkingProduct()
    await screen.findByText('75,46 €')

    expect(
      screen.getByRole('region', {
        name: 'Summary',
      }),
    ).toHaveTextContent('Estimated cost75,46 €')
    expect('/customers/1/checkouts/5/remove-lines/').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        product_ids: ['28745'],
      },
    })
  })

  it('should update the cart when confirm remove blinking products', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            {
              responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
            },
            {
              responseBody: checkout,
            },
          ],
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/checkouts/5/remove-lines/',
          method: 'post',
          requestBody: {
            product_ids: ['28745'],
          },
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('60,00 €')
    selectDeliveryDate(tomorrow.getDate())
    continueWithoutBlinkingProduct()
    await screen.findByText('75,46 €')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect('/customers/1/cart/').toHaveBeenFetchedTimes(2)
  })

  it('should see a modal if remove blinking products set a minimum purchas checkout', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/checkouts/5/remove-lines/',
          method: 'post',
          requestBody: {
            product_ids: ['28745'],
          },
          status: 400,
          responseBody: {
            errors: [
              MinPurchaseAmountNotReachedException.toJSON({
                detail:
                  'Remember that to place your order the minimum amount is €60',
              }),
            ],
          },
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('60,00 €')
    selectDeliveryDate(tomorrow.getDate())
    continueWithoutBlinkingProduct()
    expect(
      await screen.findByRole('dialog', {
        name: 'Minimum order. Remember that to place your order the minimum amount is €60',
      }),
    ).toBeInTheDocument()
  })

  it('should go to the home with the cart updated after confirm the modal under minimum purchase amount comming from the backend', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/checkouts/5/remove-lines/',
          method: 'post',
          requestBody: {
            product_ids: ['28745'],
          },
          responseBody: {
            errors: [
              MinPurchaseAmountNotReachedException.toJSON({
                detail:
                  'Remember that to place your order the minimum amount is €60',
              }),
            ],
          },
          status: 400,
        },
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('60,00 €')
    selectDeliveryDate(tomorrow.getDate())
    continueWithoutBlinkingProduct()
    await screen.findByRole('dialog', {
      name: 'Minimum order. Remember that to place your order the minimum amount is €60',
    })
    keepShopping()
    await screen.findByText('Novedades')

    expect('/customers/1/cart/').toHaveBeenFetchedTimes(3)
    expect(
      screen.queryByRole('dialog', {
        name: 'Minimum order. Remember that to place your order the minimum amount is €60',
      }),
    ).not.toBeInTheDocument()
  })

  it('should go to the home with the cart updated and opened after confirm the minimum purchase modal', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/checkouts/5/remove-lines/',
          method: 'post',
          requestBody: {
            product_ids: ['28745'],
          },
          responseBody: {
            errors: [
              MinPurchaseAmountNotReachedException.toJSON({
                detail:
                  'Remember that to place your order the minimum amount is €60',
              }),
            ],
          },
          status: 400,
        },
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('60,00 €')
    selectDeliveryDate(tomorrow.getDate())
    continueWithoutBlinkingProduct()
    await screen.findByRole('dialog', {
      name: 'Minimum order. Remember that to place your order the minimum amount is €60',
    })
    keepShopping()
    await screen.findByText('Novedades')
    const overlay = screen.getByTestId('overlay-container')
    const cartSidebar = screen.getByLabelText('Cart')

    expect('/customers/1/cart/').toHaveBeenFetchedTimes(3)
    expect(
      screen.queryByRole('dialog', {
        name: 'Minimum order. Remember that to place your order the minimum amount is €60',
      }),
    ).not.toBeInTheDocument()
    expect(overlay).toHaveClass('overlay--show')
    expect(cartSidebar).toHaveClass('cart--open')
  })

  it('should display information about product unavailable from a specific day when selecting the same day', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const month = getStringMonthDay(tomorrow)
    const day = getNumberDay(tomorrow)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody:
            checkoutWithoutSlotWithUnavailableFromBlinkingProduct(tomorrow),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Delivery')
    selectDeliveryDate(tomorrow.getDate())
    const modal = screen.getByRole('dialog')

    expect(modal).toHaveTextContent(`Not available from ${month} ${day}`)
  })

  it('should display information about product unavailable from a specific day when selecting a day after', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const month = getStringMonthDay(today)
    const day = getNumberDay(today)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody:
            checkoutWithoutSlotWithUnavailableFromBlinkingProduct(today),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Delivery')
    selectDeliveryDate(tomorrow.getDate())
    const modal = screen.getByRole('dialog')

    expect(modal).toHaveTextContent(`Not available from ${month} ${day}`)
  })

  it('should see the unavailable weekday modal when select a day that match with a blinking product and FF is active', async () => {
    const SATURDAY = 6
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutSlotWithStaticBlinkingProduct([
            SATURDAY,
          ]),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotForFurtherWeek,
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Delivery')
    selectSaturdayDeliveryDate()

    const modal = screen.getByRole('dialog')
    const monday = within(modal).getByText('M').parentNode
    const tuesday = within(modal).getByText('TU').parentNode
    const wednesday = within(modal).getByText('W').parentNode
    const thursday = within(modal).getByText('T').parentNode
    const friday = within(modal).getByText('F').parentNode
    const saturday = within(modal).getByText('S').parentNode
    expect(modal).toHaveTextContent(
      'These products will not be available on the selected day',
    )
    expect(modal).toHaveTextContent('Ron dominicano añejo superior Brugal')

    expect(modal).toHaveTextContent(`Not available on Saturday`)
    expect(modal).toContainElement(
      screen.getByRole('button', { name: 'Continue without the products' }),
    )
    expect(modal).toContainElement(
      screen.getByRole('button', { name: 'Select a different day' }),
    )
    expect(within(modal).getByRole('img')).toBeInTheDocument()
    expect(monday).toHaveClass('blinking-product__weekday--available')
    expect(tuesday).toHaveClass('blinking-product__weekday--available')
    expect(wednesday).toHaveClass('blinking-product__weekday--available')
    expect(thursday).toHaveClass('blinking-product__weekday--available')
    expect(friday).toHaveClass('blinking-product__weekday--available')
    expect(saturday).toHaveClass('blinking-product__weekday--unavailable')
  })

  it('should not display information about product unavailable from yesterday when selecting a day', async () => {
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody:
            checkoutWithoutSlotWithUnavailableFromBlinkingProduct(yesterday),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Delivery')
    selectDeliveryDate(tomorrow.getDate())

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should not display information about product without valid unavailability when selecting a day', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody:
            checkoutWithoutSlotWithoutUnavailableFromBlinkingProduct,
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Delivery')
    selectDeliveryDate(tomorrow.getDate())

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
