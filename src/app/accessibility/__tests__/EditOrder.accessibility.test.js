import { act, screen, waitFor, within } from '@testing-library/react'

import { focusOnMyOrderTitle, focusOnSearchInput } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  babyFoodSubcategoryDetail,
  categories,
} from 'app/catalog/__scenarios__/categories'
import { recommendations } from 'app/catalog/__scenarios__/recommendations'
import {
  orderCartWithOneProduct,
  orderCartWithValidPrice,
} from 'app/order/__scenarios__/orderCart'
import {
  order,
  orderWithSlotBonus,
  preparedLines,
} from 'app/order/__scenarios__/orderDetail'
import { ordersList } from 'app/order/__scenarios__/orderList'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { mockedCompleteOrderLine } from 'app/order/__tests__/preparedOrderLines.mock'
import {
  increaseProductFromCart,
  pressEnter,
  removeProductFromCart,
  shiftTabDispatched,
  tabDispatched,
} from 'pages/helpers'
import { goToCategories } from 'pages/home/__tests__/helpers'
import {
  acceptRemoveOrder,
  confirmOrderEdition,
  displayShoppingLists,
  navigateToShoppingListDetail,
  openCategory,
  openMyRegulars,
} from 'pages/order-products/__tests__/helpers'
import {
  shoppingListDetail,
  shoppingLists,
} from 'pages/shopping-lists/__tests__/scenarios'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order Accessibility', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const defaultResponses = [
    { path: `/customers/1/orders/1235/`, responseBody: order },
    { path: '/categories/', responseBody: categories },
  ]

  it('should have accessible amount products', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      ...defaultResponses,
      {
        path: '/categories/216/',
        responseBody: babyFoodSubcategoryDetail,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Categories')

    const amountProductsText = screen.getByText('Amount products')
    const amountProductsLabel = screen.getByLabelText('Amount products 0,00 €')

    expect(amountProductsLabel).toHaveAttribute('tabindex', '0')
    expect(amountProductsText).toHaveAttribute('aria-hidden', 'true')
    expect(within(amountProductsLabel).getByText('0,00 €')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('should have accessible service cost without slots', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [...defaultResponses]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Categories')

    const serviceCostLabel = screen.getByLabelText('Service cost 7,21 €')

    expect(serviceCostLabel).toHaveAttribute('tabindex', '0')
  })

  it('should have accessible service cost with slots', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const orderWithSlotBonusClone = cloneDeep(orderWithSlotBonus)
    orderWithSlotBonusClone.summary.slot_bonus = '8.21'

    const responses = [
      {
        path: `/customers/1/orders/1235/`,
        responseBody: orderWithSlotBonusClone,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Categories')

    const serviceCostLabel = screen.getByLabelText('Service cost 8,21 €')
    expect(serviceCostLabel).toHaveAttribute('tabindex', '0')
  })

  it('should have accessible price summary', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [...defaultResponses]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Categories')

    const estimatedCostLabel = screen.getByLabelText(
      'Approximate total 7,21 €. Click to see more information.',
    )
    expect(estimatedCostLabel).toHaveAttribute('tabindex', '0')
    expect(
      within(estimatedCostLabel).getByText('Estimated cost'),
    ).toHaveAttribute('aria-hidden', 'true')
    expect(within(estimatedCostLabel).getByText('7,21 €')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('should display tooltip after pressing enter in price summary', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [...defaultResponses]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Categories')

    const toolTipDiv = screen.getByTestId('edit-order-price-tooltip')
    pressEnter(toolTipDiv)

    expect(
      within(screen.getByTestId('aria-live-portal')).getByText(
        'For products sold by weight, the amount charged will be adjusted to the quantity served. Charging of the final amount will be made after the preparation of your order..',
      ),
    ).toBeInTheDocument()

    pressEnter(toolTipDiv)

    expect(
      within(screen.getByTestId('aria-live-portal')).getByText(
        'For products sold by weight, the amount charged will be adjusted to the quantity served. Charging of the final amount will be made after the preparation of your order.',
      ),
    ).toBeInTheDocument()
  })

  it('should focus on category when modifying an order', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      ...defaultResponses,
      {
        path: '/categories/216/',
        responseBody: babyFoodSubcategoryDetail,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Categories')
    expect(screen.getByText('Categories')).toHaveFocus()
  })

  it('should focus on category heading when selecting a category', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      ...defaultResponses,
      {
        path: '/categories/216/',
        responseBody: babyFoodSubcategoryDetail,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    openCategory('Bebé')
    openCategory('Alimentación infantil')

    await screen.findByRole('heading', {
      level: 1,
      name: 'Alimentación infantil',
    })
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Alimentación infantil',
      }),
    ).toHaveFocus()
  })

  it('should focus on first subcategory when selecting a category', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      ...defaultResponses,
      {
        path: '/categories/216/',
        responseBody: babyFoodSubcategoryDetail,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    openCategory('Bebé')
    vi.runAllTimers()
    expect(
      screen.getByRole('button', { name: 'Alimentación infantil' }),
    ).toHaveFocus()
  })

  it('should maintain category detail view after removing the focus-on detail param', async () => {
    vi.useRealTimers()
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      ...defaultResponses,
      {
        path: '/categories/216/',
        responseBody: babyFoodSubcategoryDetail,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    openCategory('Bebé')
    openCategory('Alimentación infantil')

    await screen.findByRole('heading', {
      level: 1,
      name: 'Alimentación infantil',
    })
    await waitFor(() =>
      expect(window.location.search).not.toContain('focus-on-detail'),
    )
    expect(window.location.search).toContain('?category=216')
  })

  it('should focus on My orders header when opening My orders', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: ordersList },
    ]
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork(responses)
      .withLogin()
      .mount()
    await screen.findByText('My orders', { selector: 'h1' })
    expect(
      screen.getByRole('heading', { level: 1, name: 'My orders' }),
    ).toHaveFocus()
  })

  it('should remove the focus param from the URL when moving from a category detail to a category group', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      ...defaultResponses,
      {
        path: '/categories/216/',
        responseBody: babyFoodSubcategoryDetail,
      },
    ]
    wrap(App)
      .atPath(
        '/orders/1235/edit/products?category=216&focus-on-detail=category',
      )
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')

    openCategory('Aceite, especias y salsas')

    expect(window.location.search).toBe('?category=112')
  })

  it('should focus on the first category when clicking on categories', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      ...defaultResponses,
      {
        path: '/categories/216/',
        responseBody: babyFoodSubcategoryDetail,
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')

    displayShoppingLists()

    await screen.findByText('My first list')

    goToCategories()

    expect(screen.getByText('Aceite, especias y salsas')).toHaveFocus()
  })

  it('should focus on My Essentials when clicking on Shopping Lists', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      ...defaultResponses,
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')

    displayShoppingLists()

    const myEssentialsText = await screen.findByText('My Essentials')

    expect(myEssentialsText.closest('a')).toHaveFocus()
  })

  it('should focus on My Essentials detail when clicking on My Essentials', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      ...defaultResponses,
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')

    displayShoppingLists()

    await screen.findByText('My Essentials')

    openMyRegulars()

    const myEssentialsHeader = await screen.findByRole('heading', {
      level: 1,
      name: 'My Essentials',
    })

    expect(myEssentialsHeader).toHaveFocus()
  })

  it('should focus on List detail when clicking on a List', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork([
        ...defaultResponses,
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
        {
          path: '/customers/1/shopping-lists/550e8400-e29b-41d4-a716-446655440000/',
          responseBody: shoppingListDetail,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    await act(async () => {
      displayShoppingLists()
      await screen.findByText('My Essentials')
    })

    await act(async () => {
      navigateToShoppingListDetail()
    })
    const header = await screen.findByRole('heading', {
      name: 'My second list',
      level: 1,
    })
    expect(header).toHaveFocus()
  })

  it('should announce feedback after cancelling order after removing all products', async () => {
    const responses = [
      { path: '/customers/1/orders/44051/', responseBody: order },
      {
        path: '/customers/1/orders/44051/cart/',
        responseBody: orderCartWithOneProduct,
      },
      {
        path: '/customers/1/orders/44051/?lang=en&wh=vlc1',
        method: 'delete',
        responseBody: {
          ...order,
          status: 'cancelled_by_customer',
          status_ui: 'cancelled_by_customer',
        },
      },
      {
        path: '/customers/1/orders/44051/lines/prepared/?lang=en&wh=vlc1',
        responseBody: { results: mockedCompleteOrderLine },
      },
    ]

    wrap(App)
      .atPath('/orders/44051/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')

    removeProductFromCart('Plataforma mopa grande abrillantadora Bosque Verde')
    confirmOrderEdition()

    const alert = screen.getByRole('dialog')
    acceptRemoveOrder(alert)

    const orderCancelledFeedback = await within(
      screen.getByTestId('aria-live-portal'),
    ).findByText('ORDER HAS BEEN CANCELLED')

    expect(orderCancelledFeedback).toBeInTheDocument()
  })

  it('should have title and description aria label for confirm order modal', async () => {
    const responses = [
      { path: '/customers/1/orders/5/', responseBody: mockedOrder },
      {
        path: '/customers/1/orders/5/cart/',
        responseBody: orderCartWithValidPrice,
      },
      {
        path: '/customers/1/orders/5/lines/prepared/',
        responseBody: preparedLines,
      },
    ]
    wrap(App)
      .atPath('/orders/5/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    increaseProductFromCart('Uva blanca con semillas')
    confirmOrderEdition()

    expect(
      await screen.findByRole('dialog', {
        name: 'Order updated. You can check the changes made on your order.',
      }),
    ).toBeInTheDocument()
  })

  it('should focus on My Orders after tabbing out of an empty search field', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      ...defaultResponses,
      {
        path: '/categories/216/',
        responseBody: babyFoodSubcategoryDetail,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Categories')

    focusOnSearchInput()
    tabDispatched()

    expect(screen.getByText('Products in my order')).toHaveFocus()
  })

  it('should NOT focus on My Orders after shift-tabbing out of an empty search field', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      ...defaultResponses,
      {
        path: '/categories/216/',
        responseBody: babyFoodSubcategoryDetail,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Categories')

    focusOnSearchInput()
    shiftTabDispatched()

    expect(screen.getByText('Products in my order')).not.toHaveFocus()
  })

  it('should focus on Search input after shift-tabbing out of my orders title', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      ...defaultResponses,
      {
        path: '/categories/216/',
        responseBody: babyFoodSubcategoryDetail,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Categories')

    const searchInput = screen.getByRole('searchbox', {
      name: 'Search products',
    })

    focusOnMyOrderTitle()
    shiftTabDispatched()

    expect(searchInput).toHaveFocus()
  })
})
