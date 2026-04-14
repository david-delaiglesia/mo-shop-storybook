import { screen, within } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cartApiResponseWithUnpublished } from 'app/cart/__tests__/cart.mock'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  addProduct,
  decreaseProduct,
  getProductCell,
  increaseProduct,
} from 'pages/helpers'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('<ProductQuantityButton />', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should render increase button after adding a product', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
          lines: [
            { quantity: 1, product_id: '8731', sources: ['+NA'] },
            { quantity: 1, product_id: '28757', sources: [] },
            { quantity: 2, product_id: '3317', sources: [] },
            { quantity: 3, product_id: '71502', sources: [] },
          ],
        },
        responseBody: cartApiResponseWithUnpublished,
      },
    ]

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productCell = getProductCell(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    await within(productCell).findByText(/1 unit/)
    expect(
      within(productCell).getByRole('button', {
        name: /Add .*? to cart/,
      }),
    ).toBeInTheDocument()
  })

  it('should render the remove and decrease button', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
          lines: [
            { quantity: 1, product_id: '8731', sources: ['+NA'] },
            { quantity: 1, product_id: '28757', sources: [] },
            { quantity: 2, product_id: '3317', sources: [] },
            { quantity: 3, product_id: '71502', sources: [] },
          ],
        },
        responseBody: cartApiResponseWithUnpublished,
      },
    ]

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    const productCell = getProductCell(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    await within(productCell).findByText(/1 unit/)

    const removeButton = within(productCell).getByRole('button', {
      name: 'Remove product from cart',
    })
    expect(
      within(removeButton).getByTestId('Remove product from cart'),
    ).toHaveClass('icon-delete-28')
    increaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    await within(productCell).findByText(/2 unit/)
    expect(
      within(removeButton).getByTestId(/Remove .*? from cart/),
    ).toHaveClass('icon-minus-28')

    decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    await within(productCell).findByText(/1 unit/)
    expect(
      within(removeButton).getByTestId('Remove product from cart'),
    ).toHaveClass('icon-delete-28')
  })
})
