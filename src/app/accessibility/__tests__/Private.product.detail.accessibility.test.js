import { act, screen, within } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import {
  productBaseDetail,
  productBaseDetailWithNutritionInformation,
  productWithoutXSelling,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { ordersList } from 'app/order/__scenarios__/orderList'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { openProductDetail } from 'pages/helpers'
import { goToProductCategories } from 'pages/product/__tests__/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Product detail accessibility', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should have right breadcrumb label and navigate to category with focus on category detail', async () => {
    const responses = [
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/120/',
        responseBody: { ...categoryDetail, id: 120 },
      },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    const breadcrumbLabel = await screen.findByLabelText(
      'Go to the Pasta y fideos category',
    )

    expect(breadcrumbLabel).toBeInTheDocument()

    await act(async () => goToProductCategories('Pasta y fideos'))

    expect(window.location.search).toBe('?focus-on-detail=category')
  })

  it('should focus on the product image and display nutrition information together with product name', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: `/customers/1/orders/`, responseBody: ordersList },
      {
        path: `/products/8731/`,
        responseBody: productBaseDetailWithNutritionInformation,
      },
      {
        path: `/products/8731/xselling/`,
        responseBody: productWithoutXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')

    const [firstThumbnailImage] = screen.queryAllByLabelText(
      'Thumbnail image of the product Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    const productAriaLabel =
      'Fideos orientales Yakisoba sabor pollo Hacendado. Allergens: Puede contener crustáceos y productos a base de crustáceos. Puede contener pescado y productos a base de pescado. Puede contener granos de sésamo y productos a base de granos de sésamo. Contiene cereales que contengan gluten. Puede contener apio y productos derivados. Contiene moluscos y productos a base de moluscos.. Ingredients: Fideos 83,0% [harina de trigo, aceite de palma, sal, agentes de tratamiento de la harina (E500, E451), estabilizante (E501), espesante (E412), antioxidante (E306)], Sazonador líquido 16,1% [azúcar, agua, aceite de colza, salsa de soja (agua, habas de soja, sal, trigo) 8,8% en el sazonador líquido, potenciadores del sabor (E621, E635), colorante (E150c), dextrosa, melaza, vinagre, sal, especias, proteína vegetal hidrolizada, tomate en polvo, corrector de acidez: ácido cítrico, aromas], cebolleta. Puede contener trazas de apio, crustáceos, pescado, leche, moluscos, mostaza y sésamo.. Storage instructions: Mantener alejado de la humedad y de la luz. Instructions for use: 1. Retire las dos tapas y el sobre. Llene el vaso con agua hirviendo hasta la línea interior.. Origin: Japan'

    expect(screen.getByLabelText(productAriaLabel)).toHaveFocus()
    expect(firstThumbnailImage).toHaveAttribute('tabindex', '-1')
  })

  it('should have right tab indexes and aria properties for format, price and disclaimer', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: `/customers/1/orders/`, responseBody: ordersList },
      {
        path: `/products/8731/`,
        responseBody: productBaseDetailWithNutritionInformation,
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
    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')

    const detailDialog = await screen.findByRole('dialog')
    const productFormat = within(detailDialog).getByLabelText('0,85€ per Unit')

    expect(
      within(detailDialog).getByText(
        'Descripción Fideos orientales Yakisoba sabor pollo',
      ),
    ).toHaveAttribute('aria-hidden', 'true')
    expect(
      within(detailDialog).getByLabelText('Paquete 90 Grams | 9,44 €/kg'),
    ).toHaveAttribute('tabindex', '0')
    expect(within(detailDialog).getByText('Paquete')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(within(detailDialog).getByText('90 g')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(within(detailDialog).getByText('| 9,44 €/kg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(within(detailDialog).getByText('Related products')).toHaveAttribute(
      'tabindex',
      '0',
    )
    expect(productFormat).toHaveAttribute('tabindex', '0')
    expect(within(detailDialog).getByText('0,85 €')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(within(productFormat).getByText('/unit')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(
      within(detailDialog).getByText(
        'The pack or product shown may not be up-to-date. We recommend that you check it upon receipt to confirm the details about it and its allergens. For additional information, contact us at our customer service Freephone 800 500 220.',
      ),
    ).toHaveAttribute('tabindex', '0')
  })
})
