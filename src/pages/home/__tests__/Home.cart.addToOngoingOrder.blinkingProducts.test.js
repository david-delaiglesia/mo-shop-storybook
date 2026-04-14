import { screen, within } from '@testing-library/react'

import {
  addCartToOngoingOrder,
  cancelBlinkingProductMerge,
  continueBlinkingProductMerge,
  openCart,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cartWithOngoingOrder,
  expensiveCartRequest,
  mergedCart,
  mergedCartWithBlinkingProduct,
  mergedCartWithUnavailableFromBlinkingProduct,
} from 'app/cart/__scenarios__/cart'
import { homeWithWidget } from 'app/catalog/__scenarios__/home'
import {
  order,
  orderWithCustomSlotDate,
} from 'app/order/__scenarios__/orderDetail'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'
import { getDay, getNumberDay, getStringMonthDay } from 'utils/dates'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Add to ongoing order Blinking Products - Indirect', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should receive an alert when try to merge blinking products', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidget },
        {
          path: '/customers/1/orders/44051/cart/validate-merge/',
          method: 'post',
          requestBody: expensiveCartRequest,
          responseBody: { ...mergedCartWithBlinkingProduct },
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: { ...order },
        },
      ])
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    const modal = await screen.findByRole('dialog')

    screen.getByRole('heading', {
      name: 'These products will not be available on the day of delivery',
    })
    screen.getByText('Not available on Monday, Wednesday')
    expect(modal).toHaveTextContent(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(screen.queryByText('Products in my order')).not.toBeInTheDocument()
  })

  it('should can close the alert when try to merge blinking products', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidget },
        {
          path: '/customers/1/orders/44051/cart/validate-merge/',
          method: 'post',
          requestBody: expensiveCartRequest,
          responseBody: { ...mergedCartWithBlinkingProduct },
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: { ...order },
        },
      ])
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByRole('dialog')

    const blinkingProductTitle = screen.getByRole('heading', {
      name: 'These products will not be available on the day of delivery',
    })
    const blinkingProductMessage = screen.getByText(
      'Not available on Monday, Wednesday',
    )
    expect(blinkingProductMessage).toBeVisible()
    cancelBlinkingProductMerge()

    expect(screen.getByText('Add to current order')).toBeInTheDocument()

    expect(blinkingProductTitle).not.toBeInTheDocument()
    expect(blinkingProductMessage).not.toBeInTheDocument()
  })

  it('should can continue with the merge removing the blinking products', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidget },
        {
          path: '/customers/1/orders/44051/cart/validate-merge/',
          method: 'post',
          requestBody: expensiveCartRequest,
          responseBody: { ...mergedCartWithBlinkingProduct },
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: { ...order },
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByRole('dialog')
    continueBlinkingProductMerge()
    const productsToAddToOrder = await screen.findByRole('complementary', {
      name: 'Products in my order',
    })

    expect(
      within(productsToAddToOrder).queryByText(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      ),
    ).not.toBeInTheDocument()
    expect(
      within(productsToAddToOrder).getByText('Agua mineral Bronchales'),
    ).toBeInTheDocument()
  })

  it('should display information about product unavailable from a specific day when selecting the same day', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const parsedTomorrow = getDay(tomorrow)
    const month = getStringMonthDay(tomorrow)
    const day = getNumberDay(tomorrow)

    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidget },
        {
          path: '/customers/1/orders/44051/cart/validate-merge/',
          method: 'post',
          requestBody: expensiveCartRequest,
          responseBody: mergedCartWithUnavailableFromBlinkingProduct(tomorrow),
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: orderWithCustomSlotDate(parsedTomorrow),
        },
      ])
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    const modal = await screen.findByRole('dialog')

    expect(modal).toHaveTextContent(`Not available from ${month} ${day}`)
  })

  it('should display information about product unavailable from a specific day when selecting a day after', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const parsedTomorrow = getDay(tomorrow)
    const month = getStringMonthDay(today)
    const day = getNumberDay(today)

    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidget },
        {
          path: '/customers/1/orders/44051/cart/validate-merge/',
          method: 'post',
          requestBody: expensiveCartRequest,
          responseBody: mergedCartWithUnavailableFromBlinkingProduct(today),
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: orderWithCustomSlotDate(parsedTomorrow),
        },
      ])
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    const modal = await screen.findByRole('dialog')

    expect(modal).toHaveTextContent(`Not available from ${month} ${day}`)
  })

  it('should receive an alert when try to merge blinking products with unavailable_from FF active', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidget },
        {
          path: '/customers/1/orders/44051/cart/validate-merge/',
          method: 'post',
          requestBody: expensiveCartRequest,
          responseBody: { ...mergedCartWithBlinkingProduct },
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: { ...order },
        },
      ])
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    const modal = await screen.findByRole('dialog')

    screen.getByRole('heading', {
      name: 'These products will not be available on the day of delivery',
    })
    screen.getByText('Not available on Monday, Wednesday')
    expect(modal).toHaveTextContent(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(screen.queryByText('Products in my order')).not.toBeInTheDocument()
  })

  it('should not display information about product unavailable from yesterday when selecting a day', async () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() + 1)
    const parsedToday = getDay(today)

    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidget },
        {
          path: '/customers/1/orders/44051/cart/validate-merge/',
          method: 'post',
          requestBody: expensiveCartRequest,
          responseBody: mergedCartWithUnavailableFromBlinkingProduct(yesterday),
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: orderWithCustomSlotDate(parsedToday),
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByText('Products in my order')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should not display information about product without valid unavailability when selecting a day', async () => {
    const today = new Date()
    const parsedToday = getDay(today)

    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidget },
        {
          path: '/customers/1/orders/44051/cart/validate-merge/',
          method: 'post',
          requestBody: expensiveCartRequest,
          responseBody: mergedCart,
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: orderWithCustomSlotDate(parsedToday),
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin({ cart: cartWithOngoingOrder })
      .mount()

    await screen.findByText('Próxima entrega')
    openCart()
    await screen.findByText('Add to current order')
    addCartToOngoingOrder()
    await screen.findByText('Products in my order')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
