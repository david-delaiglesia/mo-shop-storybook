import {
  act,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  productBaseDetail,
  productWithoutXSelling,
} from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import {
  addProductToList,
  closeAddProductToListDialog,
  selectListFromDialog,
} from 'pages/product/__tests__/helpers'
import { closeErrorDialog } from 'pages/shopping-lists/__tests__/helpers'
import { productShoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

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
  Storage.clear()
  localStorage.clear()
})

it('should not display the add to list button when the user is not logged in', async () => {
  wrap(App)
    .atPath('/product/8731')
    .withNetwork([
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ])
    .mount()

  await screen.findByText('Descripción Fideos orientales Yakisoba sabor pollo')

  expect(
    screen.queryByRole('button', { name: 'Save in lists' }),
  ).not.toBeInTheDocument()
})

describe('for logged in users', () => {
  it('should display the add to list button', async () => {
    wrap(App)
      .atPath('/product/8731')
      .withNetwork([
        { path: '/products/8731/', responseBody: productBaseDetail },
        {
          path: '/products/8731/xselling/',
          responseBody: productWithoutXSelling,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    expect(
      screen.getByRole('button', { name: 'Save in lists' }),
    ).toBeInTheDocument()
  })

  describe('Add to list dialog', () => {
    it('should load the available lists for the user', async () => {
      wrap(App)
        .atPath('/product/8731')
        .withNetwork([
          { path: '/products/8731/', responseBody: productBaseDetail },
          {
            path: '/products/8731/xselling/',
            responseBody: productWithoutXSelling,
          },
          {
            path: '/customers/1/shopping-lists/products/8731/shopping-lists-with-product-checks/',
            responseBody: productShoppingLists,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText(
        'Descripción Fideos orientales Yakisoba sabor pollo',
      )
      addProductToList()

      const dialog = screen.getByRole('dialog', { name: 'Save in a list' })
      expect(
        within(dialog).getByText(
          'Select the list in which you want to save this product.',
        ),
      ).toBeInTheDocument()
      expect(
        await within(dialog).findByText('Some user list'),
      ).toBeInTheDocument()
      expect(within(dialog).getByText('4 products')).toBeInTheDocument()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'add_to_shopping_list_icon_click',
        {
          product_id: '8731',
        },
      )
    })

    it('should display the image placeholder for the user lists', async () => {
      wrap(App)
        .atPath('/product/8731')
        .withNetwork([
          { path: '/products/8731/', responseBody: productBaseDetail },
          {
            path: '/products/8731/xselling/',
            responseBody: productWithoutXSelling,
          },
          {
            path: '/customers/1/shopping-lists/products/8731/shopping-lists-with-product-checks/',
            responseBody: productShoppingLists,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText(
        'Descripción Fideos orientales Yakisoba sabor pollo',
      )
      addProductToList()
      const dialog = await screen.findByRole('dialog', {
        name: 'Save in a list',
      })
      const firstList = within(dialog).getByRole('button', {
        name: 'Some user list',
      })
      const firstListImages = within(firstList).getAllByRole('img')

      expect(firstListImages.length).toBe(4)
      expect(firstListImages[0]).toHaveAttribute(
        'src',
        'https://sta-mercadona.imgix.net/images/ed2f5303a6f0c6bac00c00f254f82fb5.jpg?fit=crop&h=300&w=300',
      )
      expect(firstListImages[0]).toHaveClass(
        'select-shopping-list-dialog__product-image--position1',
      )
      expect(firstListImages[1]).toHaveAttribute(
        'src',
        'https://sta-mercadona.imgix.net/images/6fe3bd1734dacc3f8751577ed526b7ab.jpg?fit=crop&h=300&w=300',
      )
      expect(firstListImages[1]).toHaveClass(
        'select-shopping-list-dialog__product-image--position2',
      )
      expect(firstListImages[2]).toHaveAttribute(
        'src',
        'https://sta-mercadona.imgix.net/images/5fa8b3f8b45d41a01fc19622122fca72.jpg?fit=crop&h=300&w=300',
      )
      expect(firstListImages[2]).toHaveClass(
        'select-shopping-list-dialog__product-image--position3',
      )
      expect(firstListImages[3]).toHaveAttribute(
        'src',
        'https://sta-mercadona.imgix.net/images/409a53c0327dff2c4b91e6b4c58efa42.jpg?fit=crop&h=300&w=300',
      )
      expect(firstListImages[3]).toHaveClass(
        'select-shopping-list-dialog__product-image--position4',
      )
    })

    it('should display the empty images placeholders for lists with no products', async () => {
      const productShoppingListsCopy = cloneDeep(productShoppingLists)
      productShoppingListsCopy.shopping_lists[0].thumbnail_images = []
      productShoppingListsCopy.shopping_lists[0].products_quantity = 0

      wrap(App)
        .atPath('/product/8731')
        .withNetwork([
          { path: '/products/8731/', responseBody: productBaseDetail },
          {
            path: '/products/8731/xselling/',
            responseBody: productWithoutXSelling,
          },
          {
            path: '/customers/1/shopping-lists/products/8731/shopping-lists-with-product-checks/',
            responseBody: productShoppingListsCopy,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText(
        'Descripción Fideos orientales Yakisoba sabor pollo',
      )
      addProductToList()
      const dialog = await screen.findByRole('dialog', {
        name: 'Save in a list',
      })
      const firstList = within(dialog).getByRole('button', {
        name: 'Some user list',
      })
      const firstListImages = within(firstList).getAllByRole('img')

      expect(firstListImages.length).toBe(4)
      expect(firstListImages.length).toBe(4)
      expect(firstListImages[0]).toHaveAttribute(
        'src',
        '/src/app/shopping-lists/components/select-shopping-list-dialog/shopping-lists-dialog-card-item/EmptyPlaceholder.svg',
      )
      expect(firstListImages[0]).toHaveClass(
        'select-shopping-list-dialog__empty-image--position1',
      )
      expect(firstListImages[1]).toHaveAttribute(
        'src',
        '/src/app/shopping-lists/components/select-shopping-list-dialog/shopping-lists-dialog-card-item/EmptyPlaceholder.svg',
      )
      expect(firstListImages[1]).toHaveClass(
        'select-shopping-list-dialog__empty-image--position2',
      )
      expect(firstListImages[2]).toHaveAttribute(
        'src',
        '/src/app/shopping-lists/components/select-shopping-list-dialog/shopping-lists-dialog-card-item/EmptyPlaceholder.svg',
      )
      expect(firstListImages[2]).toHaveClass(
        'select-shopping-list-dialog__empty-image--position3',
      )
      expect(firstListImages[3]).toHaveAttribute(
        'src',
        '/src/app/shopping-lists/components/select-shopping-list-dialog/shopping-lists-dialog-card-item/EmptyPlaceholder.svg',
      )
      expect(firstListImages[3]).toHaveClass(
        'select-shopping-list-dialog__empty-image--position4',
      )
    })

    it('should allow to select one of the list in order to add the product', async () => {
      wrap(App)
        .atPath('/product/8731')
        .withNetwork([
          { path: '/products/8731/', responseBody: productBaseDetail },
          {
            path: '/products/8731/xselling/',
            responseBody: productWithoutXSelling,
          },
          {
            path: '/customers/1/shopping-lists/products/8731/shopping-lists-with-product-checks/',
            responseBody: productShoppingLists,
          },
        ])
        .withLogin()
        .mount()

      await act(async () => {
        await screen.findByText(
          'Descripción Fideos orientales Yakisoba sabor pollo',
        )
        addProductToList()
        await selectListFromDialog()

        const dialog = screen.getByRole('dialog', { name: 'Save in a list' })
        await within(dialog).findByText('Some user list')
        expect(
          within(dialog).getByRole('button', { name: 'Some user list' }),
        ).toBeDisabled()

        await waitForElementToBeRemoved(() => {
          return screen.queryByRole('dialog', { name: 'Save in a list' })
        })
      })

      expect(
        '/customers/1/shopping-lists/918edf1c-f7a5-4460-8b28-b1a47b4c5638/products/',
      ).toHaveBeenFetchedWith({
        method: 'POST',
        body: {
          merca_code: '8731',
        },
      })
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'select_shopping_list_to_save_add_product',
        {
          is_in_list: false,
          product_id: '8731',
          list_id: '918edf1c-f7a5-4460-8b28-b1a47b4c5638',
          list_name: 'Some user list',
          list_item_count: 4,
        },
      )
      expect(
        await screen.findByText('Saved in Some user list'),
      ).toBeInTheDocument()
    })

    it('should not allow to select a list if the product is already on it', async () => {
      wrap(App)
        .atPath('/product/8731')
        .withNetwork([
          { path: '/products/8731/', responseBody: productBaseDetail },
          {
            path: '/products/8731/xselling/',
            responseBody: productWithoutXSelling,
          },
          {
            path: '/customers/1/shopping-lists/products/8731/shopping-lists-with-product-checks/',
            responseBody: productShoppingLists,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText(
        'Descripción Fideos orientales Yakisoba sabor pollo',
      )
      addProductToList()

      const mySecondListButton = await screen.findByRole('button', {
        name: 'My second list',
      })
      expect(mySecondListButton).toBeDisabled()
      expect(
        within(mySecondListButton).getByText('In the list'),
      ).toBeInTheDocument()
      expect(mySecondListButton).toHaveClass(
        'select-shopping-list-dialog__card-item--disabled',
      )
    })

    it('should allow to close the dialog', async () => {
      wrap(App)
        .atPath('/product/8731')
        .withNetwork([
          { path: '/products/8731/', responseBody: productBaseDetail },
          {
            path: '/products/8731/xselling/',
            responseBody: productWithoutXSelling,
          },
          {
            path: '/customers/1/shopping-lists/products/8731/shopping-lists-with-product-checks/',
            responseBody: productShoppingLists,
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText(
        'Descripción Fideos orientales Yakisoba sabor pollo',
      )
      addProductToList()
      const dialog = await screen.findByRole('dialog', {
        name: 'Save in a list',
      })
      expect(dialog).toBeInTheDocument()
      closeAddProductToListDialog()

      expect(
        screen.queryByRole('dialog', { name: 'Save in a list' }),
      ).not.toBeInTheDocument()
    })

    it('should display a message if there is an error adding a product to the shopping list', async () => {
      wrap(App)
        .atPath('/product/8731')
        .withNetwork([
          { path: '/products/8731/', responseBody: productBaseDetail },
          {
            path: '/products/8731/xselling/',
            responseBody: productWithoutXSelling,
          },
          {
            path: '/customers/1/shopping-lists/918edf1c-f7a5-4460-8b28-b1a47b4c5638/products/',
            method: 'POST',
            status: 400,
            requestBody: { merca_code: '8731' },
          },
          {
            path: '/customers/1/shopping-lists/products/8731/shopping-lists-with-product-checks/',
            responseBody: productShoppingLists,
          },
        ])
        .withLogin()
        .mount()

      await act(async () => {
        await screen.findByText(
          'Descripción Fideos orientales Yakisoba sabor pollo',
        )
        addProductToList()
        await selectListFromDialog()
      })

      const errorDialog = await screen.findByRole('dialog', {
        name: 'Operation not performed.It was not possible to save the product to the list, please try again.',
      })
      expect(errorDialog).toBeInTheDocument()
      expect(
        within(errorDialog).getByText('Operation not performed.'),
      ).toBeInTheDocument()
      expect(
        within(errorDialog).getByText(
          'It was not possible to save the product to the list, please try again.',
        ),
      ).toBeInTheDocument()

      closeErrorDialog(errorDialog, 'Understood')
      expect(
        screen.queryByRole('dialog', {
          name: 'Operation not performed.It was not possible to save the product to the list, please try again.',
        }),
      ).not.toBeInTheDocument()
    })
  })
})
