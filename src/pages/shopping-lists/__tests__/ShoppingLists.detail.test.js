import { screen, within } from '@testing-library/react'
import { waitForElementToBeRemoved } from '@testing-library/react'

import '../../../app/address/__scenarios__/address'
import {
  address,
  addressFromDifferentWarehouse,
} from '../../../app/address/__scenarios__/address'
import {
  addProductToCart,
  clickInMoreActionsButton,
  clickOnCreateNewListButton,
  closeErrorDialog,
  confirmListCreation,
  confirmListCreationWithEnter,
  introduceListName,
  login,
  navigateToListDetail,
  navigateToMyEssentialsDetail,
  removeProduct,
  removeProductFromMoreOptions,
} from './helpers'
import {
  emptyShoppingListDetail,
  shoppingListDetail,
  shoppingLists,
} from './scenarios'
import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cookies,
  cookiesWithMadWarehouse,
} from 'app/cookie/__scenarios__/cookies'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { openCart, pressEnter } from 'pages/helpers'
import {
  clickOnPostalCode,
  confirmAddressForm,
  openChangeAddressModal,
} from 'pages/home/__tests__/helpers'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

afterEach(() => {
  vi.clearAllMocks()
  vi.resetAllMocks()
})

it('should display the empty placeholder for non logged users when accessing a list detail', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679',
        responseBody: shoppingListDetail,
      },
    ])
    .mount()

  await screen.findByRole('heading', {
    level: 4,
    name: 'Sign in to see your lists',
  })

  expect(
    screen.getByText(
      'Once you access your account, you will find all your lists here.',
    ),
  ).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
})

it('should open the login dialog for anonymous users', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679',
        responseBody: shoppingListDetail,
      },
    ])
    .mount()

  await screen.findByRole('heading', {
    level: 4,
    name: 'Sign in to see your lists',
  })
  login()

  expect(
    within(screen.getByRole('dialog')).getByText('Enter your email'),
  ).toBeInTheDocument()
})

it('should redirect to the empty initial list detail page after creating a list', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
      {
        path: '/customers/1/shopping-lists/',
        method: 'POST',
        requestBody: { name: 'my list' },
        responseBody: { id: 'e2a357db-d023-4967-85b0-2a84f3a15ee2' },
      },
      {
        path: '/customers/1/shopping-lists/e2a357db-d023-4967-85b0-2a84f3a15ee2/',
        responseBody: emptyShoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })
  clickOnCreateNewListButton()
  expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  introduceListName('my list')
  confirmListCreation()

  expect(await screen.findByText('my list')).toBeInTheDocument()
  expect(screen.getByText('0 products')).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'create_new_shopping_list_button_click',
    {
      source: 'shopping_lists',
    },
  )
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'save_new_shopping_list_button_click',
    {
      source: 'shopping_lists',
      name: 'my list',
    },
  )
})

it('should allow to create a list by pressing the enter key', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
      {
        path: '/customers/1/shopping-lists/',
        method: 'POST',
        requestBody: { name: 'my list' },
        responseBody: { id: 'e2a357db-d023-4967-85b0-2a84f3a15ee2' },
      },
      {
        path: '/customers/1/shopping-lists/e2a357db-d023-4967-85b0-2a84f3a15ee2/',
        responseBody: emptyShoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })
  clickOnCreateNewListButton()
  expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  introduceListName('my list')
  confirmListCreationWithEnter()

  expect(await screen.findByText('my list')).toBeInTheDocument()
  expect(screen.getByText('0 products')).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'create_new_shopping_list_button_click',
    {
      source: 'shopping_lists',
    },
  )
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'save_new_shopping_list_button_click',
    {
      source: 'shopping_lists',
      name: 'my list',
    },
  )
})

it('should not display the empty placeholder when the shopping list has products', async () => {
  const shoppingListDetailCopy = cloneDeep(shoppingListDetail)
  shoppingListDetailCopy.products_quantity = 1
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetailCopy,
      },
    ])
    .withLogin()
    .mount()

  expect(await screen.findByText('1 product')).toBeInTheDocument()
})

it('should display the loader when the shopping list is loading', async () => {
  const shoppingListDetailCopy = cloneDeep(shoppingListDetail)
  shoppingListDetailCopy.products_quantity = 1
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetailCopy,
        delay: 300,
      },
    ])
    .withLogin()
    .mount()

  expect(
    await screen.findByLabelText('cargando el contenido de la lista'),
  ).toBeInTheDocument()

  expect(await screen.findByText('1 product')).toBeInTheDocument()
})

it('should display the correct caption when the list only contains a singular product', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  expect(
    await screen.findByRole('heading', { name: 'My second list', level: 1 }),
  )
  expect(screen.getByText('2 products')).toBeInTheDocument()
})

it('should navigate to the list detail when selecting one of the lists', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
      {
        path: '/customers/1/shopping-lists/',
        method: 'POST',
        requestBody: { name: 'my list' },
        responseBody: { id: 'e2a357db-d023-4967-85b0-2a84f3a15ee2' },
      },
      {
        path: '/customers/1/shopping-lists/e2a357db-d023-4967-85b0-2a84f3a15ee2/',
        responseBody: shoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })
  navigateToListDetail()

  expect(
    await screen.findByRole('heading', { name: 'My second list', level: 1 }),
  )
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'shopping_list_detail_view',
    {
      list_id: 'e2a357db-d023-4967-85b0-2a84f3a15ee2',
      name: 'My second list',
      products_count: 2,
      cart_mode: 'purchase',
    },
  )
})

it('should display the product names included in the lists', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })

  const [productCell1, productCell2] = screen.getAllByTestId('product-cell')
  expect(
    within(productCell1).getByText(
      'strawberry and banana Kefir drink Hacendado',
    ),
  ).toBeInTheDocument()
  expect(
    within(productCell2).getByText('Decaf caffe latte Hacendado'),
  ).toBeInTheDocument()
})

it('should reload the list when toggling between addresses', async () => {
  const shoppingListWithUnavailableProduct = cloneDeep(shoppingListDetail)
  shoppingListWithUnavailableProduct.items[0].product.published = false

  const vlc1PostalCode = '46010'
  const mad1PostalCode = '28001'

  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: `/customers/1/addresses/?lang=en&wh=vlc1`,
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=en&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: { 'x-customer-pc': mad1PostalCode, 'x-customer-wh': 'mad1' },
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/?lang=en&wh=vlc1',
        responseBody: shoppingListDetail,
        catchParams: true,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/?lang=en&wh=mad1',
        responseBody: shoppingListWithUnavailableProduct,
        catchParams: true,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })

  const [productCellInVlc1] = screen.getAllByTestId('product-cell')
  expect(
    within(productCellInVlc1).queryByText('Product not available'),
  ).not.toBeInTheDocument()

  openCart()
  openChangeAddressModal(vlc1PostalCode)
  await screen.findByText(mad1PostalCode)
  clickOnPostalCode(mad1PostalCode)

  confirmAddressForm()

  Cookie.get = vi.fn((cookie) => cookiesWithMadWarehouse[cookie])

  await screen.findByText('Delivery in 28001')

  const [productCellInMad1] = screen.getAllByTestId('product-cell')
  expect(
    within(productCellInMad1).getByText('Product not available'),
  ).toBeInTheDocument()
})

it('should be able to add shopping list product to the cart', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  const [productCell1] = screen.getAllByTestId('product-cell')
  addProductToCart(productCell1)
  addProductToCart(productCell1)

  expect(within(productCell1).getByText('2 units')).toBeInTheDocument()
  openCart()
  const openCartContent = screen.getByRole('complementary', { name: 'Cart' })
  expect(
    within(openCartContent).getByText(
      'strawberry and banana Kefir drink Hacendado',
    ),
  ).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'add_product_click',
    expect.objectContaining({
      source: 'shopping_list',
      layout: 'grid',
    }),
  )
  expect('/customers/1/cart/').toHaveBeenFetchedWith({
    method: 'PUT',
    body: {
      id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      lines: [{ quantity: 2, product_id: '52750', sources: ['+SL', '+SL'] }],
    },
  })
})

it('should allow to remove the product from a list', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          {
            responseBody: shoppingListDetail,
          },
          { responseBody: emptyShoppingListDetail },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })

  const [strawberryBananaKeffir] = screen.getAllByTestId('product-cell')
  clickInMoreActionsButton(strawberryBananaKeffir)

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'shopping_list_product_options_click',
    {
      order: 0,
      product_id: '52750',
      display_name: 'strawberry and banana Kefir drink Hacendado',
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      list_name: 'My second list',
    },
  )

  removeProductFromMoreOptions()

  await waitForElementToBeRemoved(() =>
    screen.getByRole('heading', {
      level: 4,
      name: 'strawberry and banana Kefir drink Hacendado',
    }),
  )

  expect(
    '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/products/52750/',
  ).toHaveBeenFetchedWith({
    method: 'DELETE',
    body: {},
  })
})

it('should allow to remove the unpublished product from a list', async () => {
  const cloneShoppingListDetail = cloneDeep(shoppingListDetail)
  cloneShoppingListDetail.items[0].product.published = false

  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          {
            responseBody: cloneShoppingListDetail,
          },
          { responseBody: emptyShoppingListDetail },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })

  removeProduct(
    'strawberry and banana Kefir drink Hacendado from my regular products',
  )

  await waitForElementToBeRemoved(() =>
    screen.getByRole('heading', {
      level: 4,
      name: 'strawberry and banana Kefir drink Hacendado',
    }),
  )
})

it('should allow to remove an unpublished product from a list', async () => {
  const shoppingListDetailCopy = cloneDeep(shoppingListDetail)
  shoppingListDetailCopy.items[0].product.published = false
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          {
            responseBody: shoppingListDetailCopy,
          },
          { responseBody: emptyShoppingListDetail },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  removeProduct(
    'strawberry and banana Kefir drink Hacendado from my regular products',
  )
  await waitForElementToBeRemoved(() =>
    screen.getByRole('heading', {
      level: 4,
      name: 'strawberry and banana Kefir drink Hacendado',
    }),
  )

  expect(
    '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/products/52750/',
  ).toHaveBeenFetchedWith({
    method: 'DELETE',
    body: {},
  })
})

it('should navigate to the my essentials list detail when selecting one of the lists', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
      {
        path: '/customers/1/shopping-lists/',
        method: 'POST',
        requestBody: { name: 'my list' },
        responseBody: { id: 'e2a357db-d023-4967-85b0-2a84f3a15ee2' },
      },
      {
        path: '/customers/1/shopping-lists/e2a357db-d023-4967-85b0-2a84f3a15ee2/',
        responseBody: shoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })
  navigateToMyEssentialsDetail()

  expect(
    await screen.findByText('Make your first order to see your essentials'),
  )
})

it('should redirect to the empty initial list detail page after creating a list', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
      {
        path: '/customers/1/shopping-lists/',
        method: 'POST',
        requestBody: { name: 'my list' },
        responseBody: { id: 'e2a357db-d023-4967-85b0-2a84f3a15ee2' },
      },
      {
        path: '/customers/1/shopping-lists/e2a357db-d023-4967-85b0-2a84f3a15ee2/',
        responseBody: emptyShoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })
  clickOnCreateNewListButton()
  expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  introduceListName('my list')
  confirmListCreation()

  expect(await screen.findByText('my list')).toBeInTheDocument()
  expect(screen.getByText('0 products')).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'create_new_shopping_list_button_click',
    {
      source: 'shopping_lists',
    },
  )
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'save_new_shopping_list_button_click',
    {
      source: 'shopping_lists',
      name: 'my list',
    },
  )
})

it('should allow to create a list by pressing the enter key', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
      {
        path: '/customers/1/shopping-lists/',
        method: 'POST',
        requestBody: { name: 'my list' },
        responseBody: { id: 'e2a357db-d023-4967-85b0-2a84f3a15ee2' },
      },
      {
        path: '/customers/1/shopping-lists/e2a357db-d023-4967-85b0-2a84f3a15ee2/',
        responseBody: emptyShoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })
  clickOnCreateNewListButton()
  expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  introduceListName('my list')
  confirmListCreationWithEnter()

  expect(await screen.findByText('my list')).toBeInTheDocument()
  expect(screen.getByText('0 products')).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'create_new_shopping_list_button_click',
    {
      source: 'shopping_lists',
    },
  )
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'save_new_shopping_list_button_click',
    {
      source: 'shopping_lists',
      name: 'my list',
    },
  )
})

it('should NOT create a list by pressing the enter key with an empty list or in the cancel key', async () => {
  const shoppingListCreateSpy = vi.spyOn(ShoppingListsClient, 'createList')
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })

  clickOnCreateNewListButton()

  const dialog = screen.getByRole('dialog', {
    name: 'Create list, Enter a name for your new list',
  })
  const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' })

  confirmListCreationWithEnter()
  pressEnter(cancelButton)

  expect(shoppingListCreateSpy).not.toHaveBeenCalled()
})

it('should display a dialog if the list creation fails', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
      {
        path: '/customers/1/shopping-lists/',
        method: 'POST',
        status: 400,
        requestBody: { name: 'my list' },
        responseBody: { id: 'e2a357db-d023-4967-85b0-2a84f3a15ee2' },
      },
      {
        path: '/customers/1/shopping-lists/e2a357db-d023-4967-85b0-2a84f3a15ee2/',
        responseBody: emptyShoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })
  clickOnCreateNewListButton()
  expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  introduceListName('my list')
  confirmListCreation()

  const errorDialog = await screen.findByRole('dialog', {
    name: 'Operation not performed.It was not possible to create the list, please try again.',
  })
  expect(errorDialog).toBeInTheDocument()
  expect(
    within(errorDialog).getByText('Operation not performed.'),
  ).toBeInTheDocument()
  expect(
    within(errorDialog).getByText(
      'It was not possible to create the list, please try again.',
    ),
  ).toBeInTheDocument()

  closeErrorDialog(errorDialog, 'Understood')
  expect(
    screen.queryByRole('dialog', { name: 'Operation not performed.' }),
  ).not.toBeInTheDocument()
})
