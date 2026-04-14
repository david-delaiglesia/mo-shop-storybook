import { act, screen } from '@testing-library/react'

import moment from 'moment'
import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app.jsx'
import {
  categories,
  categoryDetailWithBlinkingProductDay,
  categoryDetailWithBlinkingProductUnavailableFrom,
  categoryDetailWithBlinkingProductUnavailableFromAnUnavailableWeekday,
  categoryDetailWithBlinkingProductWithoutUnavailableFrom,
} from 'app/catalog/__scenarios__/categories'
import {
  productBase,
  productBaseWithUnavailableDay,
  productBaseWithUnavailableFromDate,
  productBaseWithUnavailableFromDateAndUnavailableWeekdaysDate,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { dynamicMockedOrder, mockedOrder } from 'app/order/__tests__/order.mock'
import {
  addProduct,
  addProductFromDetail,
  openProductDetail,
} from 'pages/helpers'
import { closeBlinkingProductAlert } from 'pages/order-products/__tests__/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order Blinking Products', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    moment.locale('en')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should show the alert if add product in the cell', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetailWithBlinkingProductDay(5),
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    const modal = screen.getByRole('dialog')

    expect(modal).toHaveTextContent('It is not possible to add the product')
    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should not show the alert if the product not match and add product in the cell', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetailWithBlinkingProductDay(4),
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should close the alert after see it if and add product in the cell', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetailWithBlinkingProductDay(5),
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    closeBlinkingProductAlert()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should show the alert if add product in the detail', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetailWithBlinkingProductDay(5),
      },
      {
        path: '/products/8731/',
        responseBody: productBaseWithUnavailableDay(5),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    await act(async () => {
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await addProductFromDetail()
    })
    await screen.findByText('Related products')

    const modal = screen.getByRole('dialog', {
      name: 'It is not possible to add the product. This product will not be available the day you receive your order.',
    })
    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should close the alert after see it when matching product detail', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetailWithBlinkingProductDay(5),
      },
      {
        path: '/products/8731/',
        responseBody: productBaseWithUnavailableDay(5),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    await act(async () => {
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await addProductFromDetail()
    })
    await screen.findByText('Related products')
    closeBlinkingProductAlert()

    expect(
      screen.queryByRole('dialog', {
        name: 'It is not possible to add the product',
      }),
    ).not.toBeInTheDocument()
  })

  it('should display alert about product unavailable from a specific day when editing an order for the same day', async () => {
    const orderDate = new Date()
    const unavailabilityDate = orderDate
    const maxEditDate = new Date(orderDate)
    maxEditDate.setDate(maxEditDate.getDate() + 1)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFrom(unavailabilityDate),
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    const modal = screen.getByRole('dialog')

    expect(modal).toHaveTextContent('It is not possible to add the product')
    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should display alert about product unavailable from a specific day when editing an order for the day after', async () => {
    const unavailabilityDate = new Date()
    const orderDate = new Date(unavailabilityDate)
    const maxEditDate = new Date(unavailabilityDate)
    orderDate.setDate(maxEditDate.getDate() + 1)
    maxEditDate.setDate(maxEditDate.getDate() + 2)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFrom(unavailabilityDate),
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    const modal = screen.getByRole('dialog')

    expect(modal).toHaveTextContent('It is not possible to add the product')
    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should show the alert if add product in the cell and unavailable_from FF is active', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetailWithBlinkingProductDay(5),
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    const modal = screen.getByRole('dialog')

    expect(modal).toHaveTextContent('It is not possible to add the product')
    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should not display alert about product unavailable when editing and order for the day before', async () => {
    const orderDate = new Date()
    const unavailabilityDate = new Date(orderDate)
    const maxEditDate = new Date(orderDate)
    unavailabilityDate.setDate(maxEditDate.getDate() - 1)
    maxEditDate.setDate(maxEditDate.getDate() + 2)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFrom(unavailabilityDate),
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should not display alert about product without valid unavailability when editing an order', async () => {
    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: mockedOrder,
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetailWithBlinkingProductWithoutUnavailableFrom,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should display alert about product unavailable when both unavailable from and unavailable weekdays are present and applicable', async () => {
    const orderDate = new Date()

    const unavailabilityDate = orderDate
    const availableDate = new Date(orderDate)
    const maxEditDate = new Date(orderDate)

    availableDate.setDate(availableDate.getDate() + 1)
    maxEditDate.setDate(maxEditDate.getDate() + 2)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFromAnUnavailableWeekday(
            unavailabilityDate,
            unavailabilityDate,
          ),
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    const modal = screen.getByRole('dialog')

    expect(modal).toHaveTextContent('It is not possible to add the product')
    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })
  it('should display alert about product unavailable when both unavailable from and unavailable weekdays are present and only unavailable from applicable', async () => {
    const orderDate = new Date()

    const unavailabilityDate = orderDate
    const availableDate = new Date(orderDate)
    const maxEditDate = new Date(orderDate)

    availableDate.setDate(availableDate.getDate() + 1)
    maxEditDate.setDate(maxEditDate.getDate() + 2)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFromAnUnavailableWeekday(
            unavailabilityDate,
            availableDate,
          ),
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    const modal = screen.getByRole('dialog')

    expect(modal).toHaveTextContent('It is not possible to add the product')
    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })
  it('should display alert about product unavailable when both unavailable from and unavailable weekdays are present and only unavailable weekdays applicable', async () => {
    const orderDate = new Date()

    const unavailabilityDate = orderDate
    const availableDate = new Date(orderDate)
    const maxEditDate = new Date(orderDate)

    availableDate.setDate(availableDate.getDate() + 1)
    maxEditDate.setDate(maxEditDate.getDate() + 2)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFromAnUnavailableWeekday(
            availableDate,
            unavailabilityDate,
          ),
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    const modal = screen.getByRole('dialog')

    expect(modal).toHaveTextContent('It is not possible to add the product')
    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })
  it('should not display alert about product unavailable when both unavailable from and unavailable weekdays are present not applicable', async () => {
    const orderDate = new Date()

    const availableDate = new Date(orderDate)
    const maxEditDate = new Date(orderDate)

    availableDate.setDate(availableDate.getDate() + 1)
    maxEditDate.setDate(maxEditDate.getDate() + 2)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFromAnUnavailableWeekday(
            availableDate,
            availableDate,
          ),
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should display alert about product unavailable from a specific day when editing an order for the same day', async () => {
    const orderDate = new Date()
    const unavailabilityDate = orderDate
    const maxEditDate = new Date(orderDate)
    maxEditDate.setDate(maxEditDate.getDate() + 1)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFrom(unavailabilityDate),
      },
      {
        path: '/products/8731/',
        responseBody: productBaseWithUnavailableFromDate(unavailabilityDate),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    await act(async () => {
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await addProductFromDetail()
    })
    await screen.findByText('Related products')

    const modal = screen.getByRole('dialog', {
      name: 'It is not possible to add the product. This product will not be available the day you receive your order.',
    })

    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should display alert about product unavailable from a specific day when editing an order for the day after', async () => {
    const unavailabilityDate = new Date()
    const orderDate = new Date(unavailabilityDate)
    const maxEditDate = new Date(unavailabilityDate)
    orderDate.setDate(maxEditDate.getDate() + 1)
    maxEditDate.setDate(maxEditDate.getDate() + 2)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFrom(unavailabilityDate),
      },
      {
        path: '/products/8731/',
        responseBody: productBaseWithUnavailableFromDate(unavailabilityDate),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    await act(async () => {
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await addProductFromDetail()
    })
    await screen.findByText('Related products')

    const modal = screen.getByRole('dialog', {
      name: 'It is not possible to add the product. This product will not be available the day you receive your order.',
    })

    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should show the alert if add product in the detail and unavailable_from FF is enabled', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetailWithBlinkingProductDay(5),
      },
      {
        path: '/products/8731/',
        responseBody: productBaseWithUnavailableDay(5),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    await act(async () => {
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await addProductFromDetail()
    })
    await screen.findByText('Related products')

    const modal = screen.getByRole('dialog', {
      name: 'It is not possible to add the product. This product will not be available the day you receive your order.',
    })
    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should not display alert about product unavailable when editing and order for the day before', async () => {
    const orderDate = new Date()
    const unavailabilityDate = new Date(orderDate)
    const maxEditDate = new Date(orderDate)
    unavailabilityDate.setDate(maxEditDate.getDate() - 1)
    maxEditDate.setDate(maxEditDate.getDate() + 2)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFrom(unavailabilityDate),
      },
      {
        path: '/products/8731/',
        responseBody: productBaseWithUnavailableFromDate(unavailabilityDate),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    await act(async () => {
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await addProductFromDetail()
    })
    await screen.findByText('Related products')

    expect(
      screen.queryByRole('dialog', {
        name: 'It is not possible to add the product',
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should not display alert about product without valid unavailability when editing an order', async () => {
    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: mockedOrder,
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetailWithBlinkingProductWithoutUnavailableFrom,
      },
      {
        path: '/products/8731/',
        responseBody: productBase,
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    await act(async () => {
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await addProductFromDetail()
    })
    await screen.findByText('Related products')

    expect(
      screen.queryByRole('dialog', {
        name: 'It is not possible to add the product',
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })

  it('should display alert about product unavailable when both unavailable from and unavailable weekdays are present and applicable', async () => {
    const orderDate = new Date()

    const unavailabilityDate = new Date(orderDate)
    const availableDate = new Date(orderDate)

    const maxEditDate = new Date(orderDate)

    availableDate.setDate(availableDate.getDate() + 1)
    maxEditDate.setDate(maxEditDate.getDate() + 2)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFromAnUnavailableWeekday(
            unavailabilityDate,
            unavailabilityDate,
          ),
      },
      {
        path: '/products/8731/',
        responseBody:
          productBaseWithUnavailableFromDateAndUnavailableWeekdaysDate(
            unavailabilityDate,
            unavailabilityDate,
          ),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    await act(async () => {
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await addProductFromDetail()
    })
    await screen.findByText('Related products')

    const modal = screen.getByRole('dialog', {
      name: 'It is not possible to add the product. This product will not be available the day you receive your order.',
    })

    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })
  it('should display alert about product unavailable when both unavailable from and unavailable weekdays are present and only unavailable from applicable', async () => {
    const orderDate = new Date()

    const unavailabilityDate = new Date(orderDate)
    const availableDate = new Date(orderDate)

    const maxEditDate = new Date(orderDate)

    availableDate.setDate(availableDate.getDate() + 1)
    maxEditDate.setDate(maxEditDate.getDate() + 2)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFromAnUnavailableWeekday(
            unavailabilityDate,
            availableDate,
          ),
      },
      {
        path: '/products/8731/',
        responseBody:
          productBaseWithUnavailableFromDateAndUnavailableWeekdaysDate(
            unavailabilityDate,
            availableDate,
          ),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    await act(async () => {
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await addProductFromDetail()
    })
    await screen.findByText('Related products')

    const modal = screen.getByRole('dialog', {
      name: 'It is not possible to add the product. This product will not be available the day you receive your order.',
    })

    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })
  it('should display alert about product unavailable when both unavailable from and unavailable weekdays are present and only unavailable weekdays applicable', async () => {
    const orderDate = new Date()

    const unavailabilityDate = new Date(orderDate)
    const availableDate = new Date(orderDate)

    const maxEditDate = new Date(orderDate)

    availableDate.setDate(availableDate.getDate() + 1)
    maxEditDate.setDate(maxEditDate.getDate() + 2)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFromAnUnavailableWeekday(
            availableDate,
            unavailabilityDate,
          ),
      },
      {
        path: '/products/8731/',
        responseBody:
          productBaseWithUnavailableFromDateAndUnavailableWeekdaysDate(
            availableDate,
            unavailabilityDate,
          ),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    await act(async () => {
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await addProductFromDetail()
    })
    await screen.findByText('Related products')

    const modal = screen.getByRole('dialog', {
      name: 'It is not possible to add the product. This product will not be available the day you receive your order.',
    })

    expect(modal).toHaveTextContent(
      'This product will not be available the day you receive your order.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).not.toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })
  it('should not display alert about product unavailable when both unavailable from and unavailable weekdays are present not applicable', async () => {
    const orderDate = new Date()

    const availableDate = new Date(orderDate)

    const maxEditDate = new Date(orderDate)

    availableDate.setDate(availableDate.getDate() + 1)
    maxEditDate.setDate(maxEditDate.getDate() + 2)

    const responses = [
      {
        path: '/customers/1/orders/1235/',
        responseBody: dynamicMockedOrder(orderDate, maxEditDate),
      },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody:
          categoryDetailWithBlinkingProductUnavailableFromAnUnavailableWeekday(
            availableDate,
            availableDate,
          ),
      },
      {
        path: '/products/8731/',
        responseBody:
          productBaseWithUnavailableFromDateAndUnavailableWeekdaysDate(
            availableDate,
            availableDate,
          ),
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    await act(async () => {
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await addProductFromDetail()
    })
    await screen.findByText('Related products')

    expect(
      screen.queryByRole('dialog', {
        name: 'It is not possible to add the product. This product will not be available the day you receive your order.',
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('complementary', { name: 'Products in my order' }),
    ).toHaveTextContent('Fideos orientales Yakisoba sabor pollo Hacendado')
  })
})
