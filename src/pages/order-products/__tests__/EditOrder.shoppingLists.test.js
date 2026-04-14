import { screen, within } from '@testing-library/react'

import {
  clickOutsideTheShoppingListAside,
  displayShoppingLists,
  navigateToMyRegulars,
  navigateToShoppingListDetail,
  openFirstProductDetail,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { recommendations } from 'app/catalog/__scenarios__/recommendations'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { user } from 'app/user/__scenarios__/user'
import { addFirstProduct } from 'pages/helpers'
import {
  shoppingListDetail,
  shoppingLists,
} from 'pages/shopping-lists/__tests__/scenarios'
import { suggestions } from 'pages/shopping-lists/__tests__/scenarios.suggestions'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  vi.useFakeTimers()
})

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()

  sessionStorage.clear()
})

it('should display the shopping lists when clicking the shopping lists link', async () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  vi.useRealTimers()
  wrap(App)
    .atPath('/orders/1235/edit/products')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
        delay: 500,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')
  displayShoppingLists()

  expect(screen.getByLabelText('Cargando listas')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Lists' })).toHaveClass(
    'edit-order-products__menu-item--selected',
  )
  expect(
    screen.queryByText('Aceite, especias y salsas'),
  ).not.toBeInTheDocument()
  expect(await screen.findByText('My first list')).toBeInTheDocument()
  expect(screen.getByText('My second list')).toBeInTheDocument()
})

it('should close the shopping list aside when is not enough space in the screen the user clicks outside', async () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1000)
  wrap(App)
    .atPath('/orders/1235/edit/products')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, vinagre y sal')
  displayShoppingLists()
  await screen.findByText('My first list')
  clickOutsideTheShoppingListAside()

  expect(screen.queryByText('My first list')).not.toBeInTheDocument()
})

it('should not close the shopping list aside when is enough space in the screen and the user clicks outside', async () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  wrap(App)
    .atPath('/orders/1235/edit/products')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, vinagre y sal')
  displayShoppingLists()
  await screen.findByText('My first list')
  clickOutsideTheShoppingListAside()

  expect(screen.getByText('My first list')).toBeInTheDocument()
})

it('should display the my regulars detail when loading the shopping lists', async () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  wrap(App)
    .atPath('/orders/1235/edit/products')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')
  displayShoppingLists()
  await screen.findByText('My first list')

  expect(
    screen.queryByRole('heading', { name: 'Aceite, vinagre y sal', level: 1 }),
  ).not.toBeInTheDocument()
  expect(
    screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
  ).toBeInTheDocument()
  const [modifyOrderAside] = screen.getAllByRole('complementary')
  expect(
    within(modifyOrderAside).getByText('My Essentials').closest('a'),
  ).toHaveClass('shopping-list-aside-item-my-regulars__wrapper--selected')
})

it('should allow to navigate to a shopping list detail', async () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  wrap(App)
    .atPath('/orders/1235/edit/products')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      {
        path: '/customers/1/shopping-lists/550e8400-e29b-41d4-a716-446655440000/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
      {
        path: '/customers/1/shopping-lists/550e8400-e29b-41d4-a716-446655440000/suggested-products/',
        responseBody: suggestions,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')
  displayShoppingLists()
  await navigateToShoppingListDetail()

  expect(
    await screen.findByRole('heading', { name: 'My second list', level: 1 }),
  ).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Lists' })).toHaveClass(
    'edit-order-products__menu-item--selected',
  )
  expect(
    screen.queryByRole('button', { name: 'Add all to cart' }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByText('Suggestions for your list'),
  ).not.toBeInTheDocument()
  const [modifyOrderAside] = screen.getAllByRole('complementary')
  expect(
    within(modifyOrderAside).getByText('My first list').closest('a'),
  ).toHaveClass('shopping-list-item-aside__wrapper--selected')
  expect(Tracker.sendInteraction).toHaveBeenCalledWith('shopping_list_click', {
    list_name: 'My first list',
    list_id: '550e8400-e29b-41d4-a716-446655440000',
    products_count: 1,
    order: 0,
    cart_mode: 'edit',
  })
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'shopping_list_detail_view',
    {
      name: 'My second list',
      list_id: '550e8400-e29b-41d4-a716-446655440000',
      products_count: 2,
      cart_mode: 'edit',
    },
  )
})

it('should allow to navigate back to my regulars after navigating to another shopping list', async () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  wrap(App)
    .atPath('/orders/1235/edit/products')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      {
        path: '/customers/1/shopping-lists/550e8400-e29b-41d4-a716-446655440000/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')
  displayShoppingLists()
  await navigateToShoppingListDetail()
  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  navigateToMyRegulars()

  expect(
    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
  ).toBeInTheDocument()
})

it('should not navigate to my essentials if we are in a shopping list detail and click on the lists top link', async () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  wrap(App)
    .atPath('/orders/1235/edit/products')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      {
        path: '/customers/1/shopping-lists/550e8400-e29b-41d4-a716-446655440000/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')
  displayShoppingLists()
  await navigateToShoppingListDetail()
  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  displayShoppingLists()

  let myRegularProductToBeInTheDocument
  try {
    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    myRegularProductToBeInTheDocument = true
  } catch {
    myRegularProductToBeInTheDocument = false
  }

  expect(myRegularProductToBeInTheDocument).toBe(false)
})

it('should allow to add a product from the list to my current order products', async () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  wrap(App)
    .atPath('/orders/1235/edit/products')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      {
        path: '/customers/1/shopping-lists/550e8400-e29b-41d4-a716-446655440000/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')
  displayShoppingLists()
  await navigateToShoppingListDetail()
  await screen.findByRole('heading', { name: 'My second list', level: 1 })

  const currentOrderSectionBeforeAdding = screen.getByLabelText(
    'Products in my order',
  )
  expect(
    within(currentOrderSectionBeforeAdding).queryByLabelText(
      'strawberry and banana Kefir drink Hacendado, Bottle, 250 Grams, 0,90€ per Unit',
    ),
  ).not.toBeInTheDocument()

  addFirstProduct()

  const currentOrderSection = screen.getByLabelText('Products in my order')
  expect(
    within(currentOrderSection).getByLabelText(
      'strawberry and banana Kefir drink Hacendado, Bottle, 250 Grams, 0,90€ per Unit',
    ),
  ).toBeInTheDocument()
  expect('/customers/1/orders/1235/cart/draft/').toHaveBeenFetchedWith({
    method: 'PUT',
    body: {
      origin: 'edit_order',
      id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      lines: [
        { quantity: 1, product_id: '52750', sources: ['+SL'] },
        { id: 1, quantity: 2, product_id: '3317', sources: [] },
        { id: 2, quantity: 3, product_id: '71502', sources: [] },
      ],
    },
  })
})

it('should allow to add a product from my regulars to my order products', async () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  wrap(App)
    .atPath('/orders/1235/edit/products')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')
  displayShoppingLists()
  await screen.findByText('My first list')

  const currentOrderSectionBeforeAdding = screen.getByLabelText(
    'Products in my order',
  )
  expect(
    within(currentOrderSectionBeforeAdding).queryByLabelText(
      'Fideos orientales Yakisoba sabor pollo Hacendado, Paquete, 90 Grams, 0,85€ per Unit',
    ),
  ).not.toBeInTheDocument()

  addFirstProduct()

  const currentOrderSection = screen.getByLabelText('Products in my order')
  expect(
    within(currentOrderSection).getByLabelText(
      'Fideos orientales Yakisoba sabor pollo Hacendado, Paquete, 90 Grams, 0,85€ per Unit',
    ),
  ).toBeInTheDocument()
  expect('/customers/1/orders/1235/cart/draft/').toHaveBeenFetchedWith({
    method: 'PUT',
    body: {
      origin: 'edit_order',
      id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      lines: [
        { quantity: 1, product_id: '8731', sources: ['+MR', '+MR'] },
        { id: 1, quantity: 2, product_id: '3317', sources: [] },
        { id: 2, quantity: 3, product_id: '71502', sources: [] },
      ],
    },
  })
})

// When accessing directly to the edit/products page the withLogin function does not work as expected
// for this reason we need to mock the useUser hook in order to simulate that the request is being done by
// a logged in user
it('should not display the add product to list button in the product detail if the user is editing', async () => {
  vi.mock('app/catalog/components/private-product-detail/useUser.js', () => ({
    useUser: () => user,
  }))
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  wrap(App)
    .atPath('/orders/1235/edit/products')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      {
        path: '/customers/1/shopping-lists/550e8400-e29b-41d4-a716-446655440000/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')
  displayShoppingLists()
  await navigateToShoppingListDetail()
  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openFirstProductDetail()
  await screen.findByLabelText('strawberry and banana Kefir drink Hacendado')

  expect(screen.queryByText('Save in lists')).not.toBeInTheDocument()
})
