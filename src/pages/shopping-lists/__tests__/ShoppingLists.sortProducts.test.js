import { screen, within } from '@testing-library/react'

import {
  addFirstSuggestionToList,
  clickIntoOptionsButton,
  confirmListDeletion,
  deleteList,
  orderByCategory,
  orderByTime,
} from './helpers'
import {
  cocoKefirProduct,
  emptyShoppingListDetail,
  shoppingListDetail,
  shoppingLists,
} from './scenarios'
import {
  lecheSemiAsturiana,
  suggestions,
  suggestionsAfterAddition,
} from './scenarios.suggestions'
import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

afterEach(() => {
  localStorage.clear()
})

it('should disable the order filter when the list is empty', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: emptyShoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'my list', level: 1 })

  expect(
    screen.getByText('As they were added').closest('button'),
  ).toBeDisabled()
  expect(
    screen.getByTestId('shopping-list-detail-sorting-method-selector'),
  ).toHaveClass('shopping-list-detail-header__products-order-wrapper--disabled')
})

it('should order the shopping list detail by category', async () => {
  const shoppingListWithTwoProductsWithTheSameCategory =
    cloneDeep(shoppingListDetail)
  shoppingListWithTwoProductsWithTheSameCategory.items.unshift(cocoKefirProduct)
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListWithTwoProductsWithTheSameCategory,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })

  orderByCategory()

  const firstCategorySection = screen
    .getByRole('heading', {
      name: 'Chocolate drinks, coffee & tea',
      level: 2,
    })
    .closest('section')
  const decaf = within(firstCategorySection).getByTestId('product-cell')
  expect(
    within(decaf).getByRole('heading', {
      name: 'Decaf caffe latte Hacendado',
      level: 4,
    }),
  ).toBeInTheDocument()

  const secondCategorySection = screen
    .getByRole('heading', {
      name: 'Frozen food',
      level: 2,
    })
    .closest('section')
  const shrimps = within(secondCategorySection).getByTestId('product-cell')
  expect(
    within(shrimps).getByRole('heading', {
      name: 'Frozen medium striped red shrimp',
      level: 4,
    }),
  ).toBeInTheDocument()

  const thirdCategorySection = screen
    .getByRole('heading', {
      name: 'Dessert & yoghurt',
      level: 2,
    })
    .closest('section')

  const [coconutKefir, kefir] =
    within(thirdCategorySection).getAllByTestId('product-cell')
  expect(
    within(coconutKefir).getByRole('heading', {
      name: 'Coconut Kefir drink Hacendado',
      level: 4,
    }),
  ).toBeInTheDocument()
  expect(
    within(kefir).getByRole('heading', {
      name: 'strawberry and banana Kefir drink Hacendado',
      level: 4,
    }),
  ).toBeInTheDocument()

  const [, decafByTime] = screen.queryAllByRole('heading', {
    name: 'Decaf caffe latte Hacendado',
    level: 4,
  })

  expect(decafByTime).toBeUndefined()
})

it('should send the expected event when ordering the shopping list', async () => {
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

  orderByCategory()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'sl_sorting_method_click',
    {
      method: 'categories',
    },
  )

  orderByTime()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'sl_sorting_method_click',
    {
      method: 'time',
    },
  )
})

describe('should keep the selected shopping list usage', () => {
  it('should load the shopping list order from the local storage', async () => {
    const orderByTimeValue = JSON.stringify({
      listsOrders: {
        '0191fa22-176e-7c35-811c-4eed128a7679': 'product_sorting_by_category',
      },
    })
    const orderByCategoryValue = JSON.stringify({
      listsOrders: {
        '0191fa22-176e-7c35-811c-4eed128a7679': 'product_sorting_by_time',
      },
    })
    localStorage.setItem('MO-shopping_list_detail', orderByTimeValue)

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

    expect(await screen.findByText('By category')).toBeInTheDocument()

    orderByTime()
    expect(localStorage.getItem('MO-shopping_list_detail')).toEqual(
      orderByCategoryValue,
    )

    orderByCategory()
    expect(localStorage.getItem('MO-shopping_list_detail')).toEqual(
      orderByTimeValue,
    )
  })

  it('should allow to keep more than one list ordering in the local storage', async () => {
    const initialValue = JSON.stringify({
      listsOrders: {
        '562beca6-56be-48ec-85ef-328545dbda42': 'product_sorting_by_category',
        'bc5f6395-58e4-4ba6-a24c-460c7bc21f30': 'product_sorting_by_category',
        'c14e69c9-5556-4f59-ab39-a7d239997809': 'product_sorting_by_time',
      },
    })
    const finalResult = JSON.stringify({
      listsOrders: {
        '562beca6-56be-48ec-85ef-328545dbda42': 'product_sorting_by_category',
        'bc5f6395-58e4-4ba6-a24c-460c7bc21f30': 'product_sorting_by_category',
        'c14e69c9-5556-4f59-ab39-a7d239997809': 'product_sorting_by_time',
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
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'My second list', level: 1 })

    orderByCategory()
    expect(localStorage.getItem('MO-shopping_list_detail')).toEqual(finalResult)
  })

  it('should delete the shopping list order from the local storage when deleting a shopping list', async () => {
    const orderByTimeCategories = JSON.stringify({
      listsOrders: {
        '0191fa22-176e-7c35-811c-4eed128a7679': 'product_sorting_by_category',
      },
    })
    const expectedResult = JSON.stringify({
      listsOrders: {},
    })
    localStorage.setItem('MO-shopping_list_detail', orderByTimeCategories)
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

    expect(localStorage.getItem('MO-shopping_list_detail')).toEqual(
      expectedResult,
    )
  })
})

it('should reload the shopping list data for the category view after performing an action in the view', async () => {
  const shoppingListDetailAfterAddition = cloneDeep(shoppingListDetail)
  shoppingListDetailAfterAddition.items.push(lecheSemiAsturiana)
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          {
            responseBody: shoppingListDetail,
          },
          {
            responseBody: shoppingListDetailAfterAddition,
          },
        ],
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        multipleResponses: [
          { responseBody: suggestions },
          { responseBody: suggestionsAfterAddition },
          { responseBody: suggestionsAfterAddition },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Suggestions for your list')
  orderByCategory()
  await addFirstSuggestionToList()

  expect(
    await screen.findByRole('heading', {
      name: 'Leche semidesnatada Asturiana',
    }),
  ).toBeInTheDocument()
})
