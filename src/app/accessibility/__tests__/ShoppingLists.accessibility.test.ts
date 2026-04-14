import { act, screen, within } from '@testing-library/react'

import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { productWithBulk } from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { getProductCellByDisplayName } from 'pages/home/__tests__/helpers'
import {
  addProductToCart,
  addRecommendedQuantity,
  addToCart,
  clickInMoreActionsButton,
  clickIntoOptionsButton,
  clickOnCreateNewListButton,
  confirmListCreation,
  confirmListDeletion,
  deleteList,
  editQuantity,
  introduceListName,
  openShoppingListSearchProduct,
  openSortingDropdown,
  reduceRecommendedQuantity,
  removeProductFromMoreOptions,
} from 'pages/shopping-lists/__tests__/helpers'
import { navigateToListDetail } from 'pages/shopping-lists/__tests__/helpers'
import {
  shoppingListDetail,
  shoppingLists,
} from 'pages/shopping-lists/__tests__/scenarios'
import { suggestions } from 'pages/shopping-lists/__tests__/scenarios.suggestions'
import { Cookie } from 'services/cookie'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Shopping Lists - Accessibility', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    Cookie.get = vi.fn((cookie: string) => cookies[cookie]) as <
      CookieValueType,
    >(
      cookieName: string,
    ) => CookieValueType
  })

  afterEach(() => {
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('should focus on List heading when navigating to list', async () => {
    wrap(App)
      .atPath('/shopping-lists')
      .withNetwork([
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { level: 1, name: 'Lists' })

    expect(
      screen.getByRole('heading', { level: 1, name: 'Lists' }),
    ).toHaveFocus()
  })

  it('should focus on list description when navigating to a list', async () => {
    wrap(App)
      .atPath('/shopping-lists')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/',
          responseBody: shoppingLists,
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

    const header = await screen.findByRole('heading', {
      name: 'My second list',
      level: 1,
    })
    expect(header).toHaveFocus()
  })

  it('should focus on list description when navigating to a list', async () => {
    wrap(App)
      .atPath('/shopping-lists')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/',
          responseBody: shoppingLists,
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
    expect(
      screen.getByRole('heading', { name: 'My second list', level: 1 }),
    ).toHaveFocus()
  })

  it('should keep the focus on add to cart button when adding a product to cart', async () => {
    wrap(App)
      .atPath('/shopping-lists')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/',
          responseBody: shoppingLists,
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

    await screen.findByRole('heading', {
      name: 'My second list',
      level: 1,
    })

    const productToAdd = getProductCellByDisplayName(
      'strawberry and banana Kefir drink Hacendado',
    )
    addProductToCart(productToAdd)

    expect(
      screen.getByRole('heading', {
        name: 'My second list',
        level: 1,
      }),
    ).not.toHaveFocus()
  })

  it('should have the empty placeholder accessible for non logged users', async () => {
    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679',
          responseBody: shoppingListDetail,
        },
      ])
      .mount()

    const placeholderHeader = await screen.findByRole('heading', {
      level: 4,
      name: 'Sign in to see your lists',
    })
    const message = screen.getByText(
      'Once you access your account, you will find all your lists here.',
    )

    expect(placeholderHeader).toHaveFocus()
    expect(message).toHaveAttribute('tabindex', '0')
  })

  it('should have accessible header', async () => {
    wrap(App)
      .atPath('/shopping-lists')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/',
          responseBody: shoppingLists,
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

    await screen.findByRole('heading', {
      name: 'My second list',
      level: 1,
    })

    expect(screen.getByText('2 products')).toHaveAttribute('tabindex', '0')
    expect(
      screen.getByRole('button', { name: 'Add all to cart' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Add all to cart')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Options' })).toBeInTheDocument()
    expect(screen.getByText('Options')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should have accessible sort dropdown', async () => {
    activeFeatureFlags(['web-accessibility-cart'])
    wrap(App)
      .atPath('/shopping-lists')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/',
          responseBody: shoppingLists,
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

    await screen.findByRole('heading', {
      name: 'My second list',
      level: 1,
    })

    openSortingDropdown()

    const sortText = screen.getByText('Sort')
    const sortDropdown = screen.getByRole('menu')
    const asTheyWereAddedOption = screen.getByRole('menuitem', {
      name: 'As they were added',
    })
    const byCategoryOption = screen.getByRole('menuitem', {
      name: 'By category',
    })
    const selectorButton = screen.getByRole('button', {
      name: 'Sort products As they were added',
    })

    expect(selectorButton).toHaveAttribute('aria-haspopup', 'true')
    expect(sortText).toHaveAttribute('aria-hidden', 'true')
    expect(sortDropdown).toHaveAttribute('tabindex', '0')
    expect(asTheyWereAddedOption).toHaveAttribute('tabindex', '0')
    expect(byCategoryOption).toHaveAttribute('tabindex', '0')
  })

  it('should have accessible suggestions', async () => {
    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListDetail,
        },
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
          responseBody: suggestions,
          status: 404,
          delay: 300,
        },
      ])
      .withLogin()
      .mount()

    const [loadingSuggestionCard] = await screen.findAllByLabelText(
      'Cargando sugerencias',
    )
    expect(loadingSuggestionCard).toHaveAttribute('tabindex', '0')

    const suggestionText = await screen.findByText('Suggestions for your list')

    expect(suggestionText).toHaveAttribute('tabindex', '0')
    expect(screen.getByTestId('suggestions-thumbnail')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('should have accessible error dialog when failing to create a list', async () => {
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
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { level: 1, name: 'Lists' })
    clickOnCreateNewListButton()
    introduceListName('my list')
    confirmListCreation()

    const errorDialog = await screen.findByRole('dialog', {
      name: 'Operation not performed.It was not possible to create the list, please try again.',
    })
    expect(errorDialog).toBeInTheDocument()
  })

  it('should have accessible edit quantity dialog', async () => {
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
    editQuantity(strawberryBananaKeffir)

    const dialog = await screen.findByRole('dialog', { name: 'Edit quantity' })
    expect(
      within(dialog).getByLabelText(
        'strawberry and banana Kefir drink Hacendado, 1 unit In the list',
      ),
    ).toBeInTheDocument()
    expect(within(dialog).getByLabelText('1 unit')).toBeInTheDocument()
    expect(
      within(dialog).getByLabelText('Increase 1 Unit quantity.'),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByLabelText('Reduce 1 Unit quantity.'),
    ).toBeInTheDocument()
  })

  it('should have accessible edit quantity dialog for gram product', async () => {
    const bulkProduct = {
      ...productWithBulk,
      id: '69827',
      display_name: 'Judía verde plana',
      packaging: 'Granel',
      price_instructions: {
        ...productWithBulk.price_instructions,
        is_pack: false,
        pack_size: null,
        unit_name: null,
        unit_size: 1,
        approx_size: true,
        size_format: 'kg',
        total_units: null,
        drained_weight: null,
        selling_method: 1,
        min_bunch_amount: 0.15,
      },
    }

    const shoppingListBulkProduct = {
      product: bulkProduct,
      recommended_quantity: 1,
      source: 'shopping-list',
      source_code: 'SL',
    }

    const shoppingListDetailClone = cloneDeep(shoppingListDetail)
    shoppingListDetailClone.items[0] = shoppingListBulkProduct

    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListDetailClone,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'My second list', level: 1 })
    const [judia] = screen.getAllByTestId('product-cell')

    editQuantity(judia)

    const dialog = await screen.findByRole('dialog', { name: 'Edit quantity' })
    expect(
      within(dialog).getByLabelText('Judía verde plana, 1 Kilo In the list'),
    ).toBeInTheDocument()
    expect(within(dialog).getByLabelText('1 Kilo')).toBeInTheDocument()
    expect(
      within(dialog).getByLabelText('Increase 150 Grams quantity.'),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByLabelText('Reduce 150 Grams quantity.'),
    ).toBeInTheDocument()
  })

  it('should announce feedback when increasing or decreasing product quantity from shopping list', async () => {
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
    editQuantity(strawberryBananaKeffir)

    act(() => {
      addRecommendedQuantity()
    })

    expect(screen.getByText('1 Unit quantity has been increased.'))

    act(() => {
      reduceRecommendedQuantity()
    })

    expect(screen.getByText('1 UNIT QUANTITY HAS BEEN REDUCED.'))
  })

  it('should have aria disabled for the option of editing the recommended quantity when the product is already in the cart', async () => {
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
    ).toHaveAttribute('aria-disabled', 'true')
  })

  it('should announce when product has been removed from list', async () => {
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

    clickInMoreActionsButton(strawberryBananaKeffir)
    removeProductFromMoreOptions()

    const productRemovedFeedback = await within(
      screen.getByTestId('aria-live-portal'),
    ).findByText('THE PRODUCT HAS BEEN REMOVED FROM THE LIST.')

    expect(productRemovedFeedback).toBeInTheDocument()
  })

  it('should announce when a list has been deleted', async () => {
    const initialValue = JSON.stringify({
      listsOrders: {
        '0191fa22-176e-7c35-811c-4eed128a7679': 'product_sorting_by_category',
      },
    })
    localStorage.setItem('MO-shopping_list_detail', initialValue)

    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListDetail,
        },
        {
          path: '/customers/1/shopping-lists/',
          responseBody: shoppingLists,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'My second list', level: 1 })
    clickIntoOptionsButton()
    deleteList()

    const dialog = screen.getByRole('dialog', {
      name: 'Do you want to delete this list?',
    })

    confirmListDeletion(dialog)

    await screen.findByRole('heading', { level: 1, name: 'Lists' })

    const listRemovedFeedback = await within(
      screen.getByTestId('aria-live-portal'),
    ).findByText('THE LIST HAS BEEN DELETED')

    expect(listRemovedFeedback).toBeInTheDocument()
    localStorage.clear()
  })

  it('should have proper aria label for closing search products, modal', async () => {
    wrap(App)
      .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
          responseBody: shoppingListDetail,
        },
        {
          path: '/customers/1/shopping-lists/',
          responseBody: shoppingLists,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'My second list', level: 1 })
    openShoppingListSearchProduct()

    const dialog = screen.getByRole('dialog', { name: 'Search products' })

    expect(
      within(dialog).getByLabelText('Confirm changes and return to list'),
    ).toBeInTheDocument()
  })
})
