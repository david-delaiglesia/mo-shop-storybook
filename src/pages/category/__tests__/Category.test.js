import { screen, within } from '@testing-library/react'

import {
  clickOnPostalCode,
  confirmAddressForm,
  openUserMenu,
} from '../../home/__tests__/helpers'
import { openUserAddress } from '../../season/__tests__/helpers'
import {
  getProductByDisplayName,
  goToNextCategory,
  openCategory,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import {
  address,
  addressFromBarcelonaWarehouse,
} from 'app/address/__scenarios__/address'
import {
  babyFoodSubcategoryDetail,
  categories,
  categoriesWithSoda,
  categoriesWithTwoSubcategories,
  categoryDetail,
  categoryDetailCocaColaBarcelona,
  categoryDetailCocaColaValencia,
  speciesCategoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { CatalogClient } from 'app/catalog/client'
import {
  addProduct,
  decreaseProduct,
  increaseProduct,
  openAccountDropdown,
  openProductDetail,
  openSignInModal,
  removeProduct,
} from 'pages/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Category', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const cartId = '5529dc8b-0a94-4ae0-8145-de5186b542c6'
  const metrics = {
    amount: 0,
    cart_id: cartId,
    display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
    id: '8731',
    merca_code: '8731',
    layout: 'grid',
    price: '0,85',
    requires_age_check: false,
    selling_method: 'units',
    source: 'categories',
    cart_mode: 'purchase',
  }

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should send user token to category detail endpoint if user is logged in', async () => {
    vi.spyOn(
      CatalogClient,
      'getCategoryDetailWithUpdatedWarehouse',
    ).mockImplementation(() => vi.fn())
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findAllByText('Aceite, vinagre y sal')

    expect(
      CatalogClient.getCategoryDetailWithUpdatedWarehouse,
    ).toHaveBeenCalledWith(112, 'vlc1', false, true)
  })

  it('should NOT send user token to category detail endpoint if user is NOT logged in', async () => {
    vi.spyOn(
      CatalogClient,
      'getCategoryDetailWithUpdatedWarehouse',
    ).mockImplementation(() => vi.fn())
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App).atPath('/categories/112/').withNetwork(responses).mount()

    await screen.findAllByText('Aceite, vinagre y sal')

    expect(
      CatalogClient.getCategoryDetailWithUpdatedWarehouse,
    ).toHaveBeenCalledWith(112, 'vlc1', false, false)
  })

  it('should show the category detail', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findAllByText('Aceite, vinagre y sal')
    const productCell = getProductByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )

    expect(productCell).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('category', {
      category_id: 112,
    })
    expect(Tracker.sendViewChange).toHaveBeenCalledTimes(1)
  })

  it('should show the category detail from the proper warehouse', async () => {
    const responses = [
      {
        path: '/categories/?lang=en&wh=vlc1',
        responseBody: categories,
        catchParams: true,
      },
      {
        path: '/categories/112/?lang=en&wh=vlc1',
        responseBody: categoryDetail,
        catchParams: true,
      },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findAllByText('Aceite, vinagre y sal')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/categories/?lang=en&wh=vlc1'),
        method: 'GET',
      }),
    )
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/categories/112/?lang=en&wh=vlc1'),
        method: 'GET',
      }),
    )
  })

  it('should show the category detail from the proper warehouse when you change the address', async () => {
    const bcn1PostalCode = '08001'
    const responses = [
      {
        path: '/categories/?lang=en&wh=vlc1',
        responseBody: categoriesWithSoda,
        catchParams: true,
      },
      {
        path: '/categories/158/?lang=en&wh=vlc1',
        responseBody: categoryDetailCocaColaValencia,
        catchParams: true,
      },
      {
        path: `/customers/1/addresses/?lang=en&wh=vlc1`,
        responseBody: { results: [address, addressFromBarcelonaWarehouse] },
      },
      {
        path: `/customers/1/addresses/4/make_default/?lang=en&wh=vlc1`,
        method: 'patch',
        responseBody: { ...addressFromBarcelonaWarehouse },
        headers: { 'x-customer-pc': bcn1PostalCode, 'x-customer-wh': 'bcn1' },
      },
      {
        path: '/categories/158/?lang=en&wh=bcn1',
        responseBody: categoryDetailCocaColaBarcelona,
        catchParams: true,
      },
    ]
    wrap(App)
      .atPath('/categories/158/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findAllByText('Categories')

    expect(
      screen.getByRole('button', {
        name: 'Refresco Coca-Cola, 2 botellas x 2 Litres, Previous price: 4,00€ per Pack, Current price: 3,90€ per Pack',
      }),
    ).toBeInTheDocument()

    openUserMenu('John')
    openUserAddress('46010')

    await screen.findByRole('dialog')
    await screen.findByText('Where do you want to receive your order?')

    clickOnPostalCode(bcn1PostalCode)
    confirmAddressForm()

    expect(await screen.findByRole('dialog')).not.toBeInTheDocument()

    expect('/categories/158/?lang=en&wh=bcn1').toHaveBeenFetchedTimes(1)
    expect(
      screen.getByRole('button', {
        name: 'Refresco Coca-Cola, 2 botellas x 2 Litres, Previous price: 4,74€ per Pack, Current price: 4,64€ per Pack',
      }),
    ).toBeInTheDocument()
  })

  it('should be able to add a product to the cart', async () => {
    const today = new Date().toISOString().split('T')[0]
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartId,
          lines: [{ quantity: 1, product_id: '8731', sources: ['+CT'] }],
        },
      },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findAllByText('Aceite, vinagre y sal')
    Tracker.sendInteraction.mockClear()
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    const cart = await screen.findByLabelText('Show cart')

    const product = getProductByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(cart).toHaveTextContent('0,85 €')
    expect(product).toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      order: 0,
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      added_amount: 1,
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      body: {
        id: cartId,
        lines: [{ quantity: 1, product_id: '8731', sources: ['+CT'] }],
      },
      method: 'PUT',
    })
  })

  it('should be able to increase a product to the cart', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartId,
          lines: [{ quantity: 1, product_id: '8731', sources: ['+CT'] }],
        },
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartId,
          lines: [{ quantity: 2, product_id: '8731', sources: ['+CT', '+CT'] }],
        },
      },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findAllByText('Aceite, vinagre y sal')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    increaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    const cart = await screen.findByLabelText('Show cart')

    const product = getProductByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(cart).toHaveTextContent('1,70 €')
    expect(product).toHaveTextContent('2 units')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      order: 0,
      amount: 1,
      first_product: false,
      added_amount: 1,
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      body: {
        id: cartId,
        lines: [{ quantity: 1, product_id: '8731', sources: ['+CT'] }],
      },
      method: 'PUT',
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      body: {
        id: cartId,
        lines: [{ quantity: 2, product_id: '8731', sources: ['+CT', '+CT'] }],
      },
      method: 'PUT',
    })
  })

  it('should be able to decrease a product from the cart', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartId,
          lines: [{ quantity: 1, product_id: '8731', sources: ['+CT'] }],
        },
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartId,
          lines: [{ quantity: 2, product_id: '8731', sources: ['+CT', '+CT'] }],
        },
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartId,
          lines: [
            { quantity: 1, product_id: '8731', sources: ['+CT', '+CT', '-CT'] },
          ],
        },
      },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findAllByText('Aceite, vinagre y sal')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    increaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    const cart = await screen.findByLabelText('Show cart')

    const product = getProductByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(cart).toHaveTextContent('0,85 €')
    expect(product).toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...metrics,
        amount: 2,
        decreased_amount: 1,
      },
    )
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      body: {
        id: cartId,
        lines: [{ quantity: 1, product_id: '8731', sources: ['+CT'] }],
      },
      method: 'PUT',
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      body: {
        id: cartId,
        lines: [{ quantity: 2, product_id: '8731', sources: ['+CT', '+CT'] }],
      },
      method: 'PUT',
    })
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      body: {
        id: cartId,
        lines: [
          { quantity: 1, product_id: '8731', sources: ['+CT', '+CT', '-CT'] },
        ],
      },
      method: 'PUT',
    })
  })

  it('should be able to remove a product from the cart', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartId,
          lines: [{ quantity: 1, product_id: '8731', sources: ['+CT'] }],
        },
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [],
        },
      },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findAllByText('Aceite, vinagre y sal')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    removeProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    const cart = await screen.findByLabelText('Show cart')

    const product = getProductByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(cart).toHaveOnlyIcon()
    expect(product).toHaveTextContent('0 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...metrics,
        amount: 1,
        decreased_amount: 1,
      },
    )
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      body: {
        id: '10000000-1000-4000-8000-100000000000',
        lines: [],
      },
      method: 'PUT',
    })
  })

  it('should go to the next category using the next button', async () => {
    const responses = [
      { path: '/categories/', responseBody: categoriesWithTwoSubcategories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/categories/115/', responseBody: speciesCategoryDetail },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite de oliva')
    goToNextCategory('Especias')
    const header = await screen.findByText('Hierbas')

    expect(header).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('category', {
      category_id: 112,
    })
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('category', {
      category_id: 115,
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'category_next_button_click',
      {
        destination_id: 115,
        source_id: 112,
      },
    )
  })

  it('should not go to the next category using the view next button when it is the last category', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/categories/115/', responseBody: speciesCategoryDetail },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findAllByText('Aceite, vinagre y sal')
    goToNextCategory('Especias')
    await screen.findByText('Hierbas')

    expect(
      screen.queryByText('View Mayonesa, ketchup y mostaza'),
    ).not.toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('category', {
      category_id: categoryDetail.id,
    })
  })

  it('should go to another category using the menu', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/categories/216/', responseBody: babyFoodSubcategoryDetail },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite de oliva')
    openCategory('Bebé')
    const subCategoryHeader = await screen.findByText('Alimentación infantil')

    expect(subCategoryHeader).toBeInTheDocument()
    expect(screen.getByText('Tarritos salados')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('category_click', {
      id: 24,
      name: 'Bebé',
    })
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('should go to another subcategory using the menu', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/categories/115/', responseBody: speciesCategoryDetail },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite de oliva')
    openCategory('Especias')
    const header = await screen.findByText('Hierbas')

    expect(header).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('category', {
      category_id: 112,
    })
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('category', {
      category_id: 115,
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('category_click', {
      id: 115,
      name: 'Especias',
    })
  })
  it('should open the login modal', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/categories/115/', responseBody: speciesCategoryDetail },
    ]
    wrap(App).atPath('/categories/112/').withNetwork(responses).mount()

    await screen.findByText('Aceite de oliva')
    openAccountDropdown()
    openSignInModal()
    const loginModal = await screen.findByRole('dialog')

    expect(loginModal).toHaveTextContent('Enter your email')
    expect(window.location.search).toBe('?authenticate-user=')
  })

  it('should NOT show new arrival label if product is a not a new arrival', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite de oliva')
    const product = getProductByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(within(product).queryByText('NEW')).not.toBeInTheDocument()
  })

  it('should show new arrival label if product is a new arrival and user is logged in', async () => {
    const categoryDetailClone = cloneDeep(categoryDetail)
    categoryDetailClone.categories[0].products[0].is_new_arrival = true

    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetailClone },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite de oliva')
    const product = getProductByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(within(product).getByText('NEW')).toBeInTheDocument()
  })

  it('should show new arrival label without redesign class when redesign flag is inactive', async () => {
    const categoryDetailClone = cloneDeep(categoryDetail)
    categoryDetailClone.categories[0].products[0].is_new_arrival = true

    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetailClone },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite de oliva')
    const product = getProductByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    const label = within(product).getByText('NEW')
    expect(label).not.toHaveClass('product-cell__new-arrival-label--redesign')
  })

  it('should show new arrival label with redesign class when redesign flag is active', async () => {
    activeFeatureFlags(['web-new-arrival-label-redesign'])
    const categoryDetailClone = cloneDeep(categoryDetail)
    categoryDetailClone.categories[0].products[0].is_new_arrival = true

    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetailClone },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite de oliva')
    const product = getProductByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    const label = within(product).getByText('New')
    expect(label).toHaveClass('product-cell__new-arrival-label--redesign')
  })

  it('should send metrics of new arrival label', async () => {
    const today = new Date().toISOString().split('T')[0]

    const categoryDetailClone = cloneDeep(categoryDetail)
    categoryDetailClone.categories[0].products[0].is_new_arrival = true

    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetailClone },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite de oliva')

    increaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...metrics,
      order: 0,
      first_product_added_at: expect.stringContaining(today),
      first_product: true,
      added_amount: 1,
      tag_new_arrival: true,
    })
  })

  it('should NOT show new arrival label if product is a new arrival and user is NOT logged in', async () => {
    const categoryDetailClone = cloneDeep(categoryDetail)
    categoryDetailClone.categories[0].products[0].is_new_arrival = true

    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetailClone },
    ]
    wrap(App).atPath('/categories/112/').withNetwork(responses).mount()

    await screen.findByText('Aceite de oliva')
    const product = getProductByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(within(product).queryByText('NEW')).not.toBeInTheDocument()
  })

  it('should send metrics of new arrival label', async () => {
    const categoryDetailClone = cloneDeep(categoryDetail)
    categoryDetailClone.categories[0].products[0].is_new_arrival = true

    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetailClone },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite de oliva')

    openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')
    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'product_detail',
      expect.objectContaining({
        tag_new_arrival: true,
      }),
    )
  })
})
