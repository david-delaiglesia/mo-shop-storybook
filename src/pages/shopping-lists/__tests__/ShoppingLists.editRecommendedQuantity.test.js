import { act, screen, waitFor, within } from '@testing-library/react'

import {
  addRecommendedQuantityGrams,
  addToCart,
  clickCloseDialog,
  clickInMoreActionsButton,
  clickOutside,
  editQuantity,
  reduceRecommendedQuantityGrams,
  saveRecommendedQuantity,
} from './helpers'
import { emptyShoppingListDetail, shoppingListDetail } from './scenarios'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.restoreAllMocks()
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

afterEach(() => {
  vi.clearAllMocks()
})

it('should display the edit quantity dialog', async () => {
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
  editQuantity(strawberryBananaKeffir)

  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })
  expect(dialog).toBeInTheDocument()
  expect(within(dialog).getByText('Edit quantity')).toBeInTheDocument()
  expect(within(dialog).getByText('1 unit')).toBeInTheDocument()
  expect(
    within(dialog).getByText('strawberry and banana Kefir drink Hacendado'),
  ).toBeInTheDocument()

  const { 0: productImage } = within(dialog).getAllByRole('img')
  expect(productImage).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'shopping_list_product_edit_quantity_click',
    {
      order: 0,
      product_id: '52750',
      display_name: 'strawberry and banana Kefir drink Hacendado',
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      list_name: 'My second list',
    },
  )
})

it('should display bulk product quantity in edit modal', async () => {
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
  const { 2: stripedRedShrimp } = screen.getAllByTestId('product-cell')
  editQuantity(stripedRedShrimp)

  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })
  expect(dialog).toBeInTheDocument()
  expect(within(dialog).getByText('Edit quantity')).toBeInTheDocument()
  expect(within(dialog).getByText('150 g')).toBeInTheDocument()
  expect(
    within(dialog).getByText('Frozen medium striped red shrimp'),
  ).toBeInTheDocument()

  const { 0: productImage } = within(dialog).getAllByRole('img')
  expect(productImage).toBeInTheDocument()
})

it('should increase the amount in edit modal', async () => {
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
  const { 2: stripedRedShrimp } = screen.getAllByTestId('product-cell')
  editQuantity(stripedRedShrimp)

  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })

  expect(within(dialog).getByText('150 g')).toBeInTheDocument()

  act(() => {
    addRecommendedQuantityGrams()
  })

  await waitFor(() => {
    expect(within(dialog).getByText('300 g')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'shopping_list_product_increment_quantity_click',
      {
        product_id: '24706',
        display_name: 'Frozen medium striped red shrimp',
        list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
        list_name: 'My second list',
        previous_quantity: 0.15,
        new_quantity: 0.3,
      },
    )
  })
})

it('should disable the increase amount button before surpassing the reaching the upper limit', async () => {
  const shoppingListDetailClone = cloneDeep(shoppingListDetail)
  shoppingListDetailClone.items[2].product.limit = 1
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          {
            responseBody: shoppingListDetailClone,
          },
          { responseBody: emptyShoppingListDetail },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  const { 2: stripedRedShrimp } = screen.getAllByTestId('product-cell')
  editQuantity(stripedRedShrimp)

  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })

  expect(within(dialog).getByText('150 g')).toBeInTheDocument()

  act(() => {
    addRecommendedQuantityGrams()
    addRecommendedQuantityGrams()
    addRecommendedQuantityGrams()
    addRecommendedQuantityGrams()
    addRecommendedQuantityGrams()
  })

  await waitFor(() => {
    expect(within(dialog).getByText('900 g')).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', {
        name: 'Increase 150 Grams quantity.',
      }),
    ).toBeDisabled()
  })
})

it('should disable the increase amount button when reaching the exact upper limit', async () => {
  const shoppingListDetailClone = cloneDeep(shoppingListDetail)
  shoppingListDetailClone.items[2].product.limit = 1
  shoppingListDetailClone.items[2].recommended_quantity = 0.5
  shoppingListDetailClone.items[2].product.price_instructions.increment_bunch_amount = 0.5
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          {
            responseBody: shoppingListDetailClone,
          },
          { responseBody: emptyShoppingListDetail },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  const { 2: stripedRedShrimp } = screen.getAllByTestId('product-cell')
  editQuantity(stripedRedShrimp)
  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })
  act(() => {
    addRecommendedQuantityGrams()
  })

  expect(within(dialog).getByText('1 kg')).toBeInTheDocument()
  await waitFor(() => {
    expect(
      within(dialog).getByRole('button', {
        name: 'Increase 150 Grams quantity.',
      }),
    ).toBeDisabled()
  })
})

it('should decrease the amount in edit modal', async () => {
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
  const { 2: stripedRedShrimp } = screen.getAllByTestId('product-cell')
  editQuantity(stripedRedShrimp)

  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })

  expect(within(dialog).getByText('150 g')).toBeInTheDocument()

  act(() => {
    addRecommendedQuantityGrams()
  })
  act(() => {
    reduceRecommendedQuantityGrams()
  })

  await waitFor(() => {
    expect(within(dialog).getByText('150 g')).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', {
        name: 'Reduce 150 Grams quantity.',
      }),
    ).toBeDisabled()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'shopping_list_product_decrease_quantity_click',
      {
        product_id: '24706',
        display_name: 'Frozen medium striped red shrimp',
        list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
        list_name: 'My second list',
        previous_quantity: 0.3,
        new_quantity: 0.15,
      },
    )
  })
})

it('the decrease button should be disabled by default', async () => {
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
  const { 2: stripedRedShrimp } = screen.getAllByTestId('product-cell')
  editQuantity(stripedRedShrimp)
  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })

  expect(
    within(dialog).getByRole('button', { name: 'Reduce 150 Grams quantity.' }),
  ).toBeDisabled()
})

it('hides the edit recommended quantity option when clicking for the second time the more actions button', async () => {
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
  clickInMoreActionsButton(strawberryBananaKeffir)

  const editQuantityButton = screen.queryByRole('button', {
    name: 'Edit quantity',
  })
  expect(editQuantityButton).not.toBeInTheDocument()
})

it('should hide the edit recommended quantity option when clicking anywhere else in the page', async () => {
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

  await waitFor(async () => {
    await screen.findByRole('heading', { name: 'My second list', level: 1 })
    const [strawberryBananaKeffir] = screen.getAllByTestId('product-cell')
    clickInMoreActionsButton(strawberryBananaKeffir)
    clickOutside()

    const editQuantityButton = screen.queryByRole('button', {
      name: 'Edit quantity',
    })
    expect(editQuantityButton).not.toBeInTheDocument()
  })
})

it('should hide the edit recommended quantity dialog when clicking cancel', async () => {
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
  editQuantity(strawberryBananaKeffir)

  await screen.findByRole('dialog', { name: 'Edit quantity' })
  act(() => {
    clickCloseDialog()
  })

  const editQuantityDialog = screen.queryByRole('dialog', {
    name: 'Edit quantity',
  })
  expect(editQuantityDialog).not.toBeInTheDocument()

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'cancel_shopping_list_product_edit_quantity_click',
    {
      product_id: '52750',
      display_name: 'strawberry and banana Kefir drink Hacendado',
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      list_name: 'My second list',
      quantity: 1,
    },
  )
})

it('should send the selected recommended quantity to the backend', async () => {
  const shoppingListDetailClone = cloneDeep(shoppingListDetail)
  shoppingListDetailClone.items[2].recommended_quantity = 0.45
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          { responseBody: shoppingListDetail },
          { responseBody: shoppingListDetailClone },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  const { 2: stripedRedShrimp } = screen.getAllByTestId('product-cell')
  editQuantity(stripedRedShrimp)
  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })
  act(() => {
    addRecommendedQuantityGrams()
    addRecommendedQuantityGrams()
  })
  await within(dialog).findByText('450 g')
  act(() => {
    saveRecommendedQuantity(dialog)
  })

  waitFor(() => {
    expect(
      screen.queryByRole('dialog', { name: 'Edit quantity' }),
    ).not.toBeInTheDocument()
  })
  const { 2: stripedRedShrimpAfterUpdate } =
    screen.getAllByTestId('product-cell')
  expect(
    await within(stripedRedShrimpAfterUpdate).findByRole('button', {
      name: 'Add 450 Grams to cart',
    }),
  ).toBeInTheDocument()
  expect(
    '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/products/24706/quantity/',
  ).toHaveBeenFetchedWith({
    method: 'PUT',
    body: {
      quantity: 0.45,
    },
  })
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'confirm_shopping_list_product_edit_quantity_click',
    {
      product_id: '24706',
      display_name: 'Frozen medium striped red shrimp',
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      list_name: 'My second list',
      previous_quantity: 0.15,
      new_quantity: 0.45,
    },
  )
})

it('should display the loading state when saving the recommended quantity', async () => {
  const shoppingListDetailClone = cloneDeep(shoppingListDetail)
  shoppingListDetailClone.items[2].recommended_quantity = 0.45
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          { responseBody: shoppingListDetail },
          { responseBody: shoppingListDetailClone },
        ],
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/products/24706/quantity/',
        method: 'PUT',
        requestBody: {
          quantity: 0.45,
        },
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  const { 2: stripedRedShrimp } = screen.getAllByTestId('product-cell')
  editQuantity(stripedRedShrimp)
  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })
  act(() => {
    addRecommendedQuantityGrams()
    addRecommendedQuantityGrams()
  })
  await within(dialog).findByText('450 g')
  act(() => {
    saveRecommendedQuantity(dialog)
  })

  const saveButton = within(dialog).getAllByRole('button')[3]
  expect(saveButton).toBeDisabled()
  expect(saveButton).toHaveClass('ui-button--loading')
})

it('should load the recommended quantity when opening the recommended quantity dialog', async () => {
  const shoppingListDetailClone = cloneDeep(shoppingListDetail)
  shoppingListDetailClone.items[2].recommended_quantity = 0.3

  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          {
            responseBody: shoppingListDetailClone,
          },
          { responseBody: emptyShoppingListDetail },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  const { 2: stripedRedShrimp } = screen.getAllByTestId('product-cell')
  editQuantity(stripedRedShrimp)
  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })
  await within(dialog).findByText('300 g')
})

it('should disable the option for editing the recommended quantity when the product is already in the cart', async () => {
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
  const [strawberryBananaKeffir] = screen.getAllByTestId('product-cell')
  addToCart(strawberryBananaKeffir)
  editQuantity(strawberryBananaKeffir)

  expect(
    within(strawberryBananaKeffir).getByRole('button', {
      name: 'Edit quantity',
    }),
  ).toHaveClass('more-actions-product-cell-button__action--disabled')
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'shopping_list_product_edit_quantity_button_disabled_click',
    {
      order: 0,
      product_id: '52750',
      display_name: 'strawberry and banana Kefir drink Hacendado',
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      list_name: 'My second list',
    },
  )
})
