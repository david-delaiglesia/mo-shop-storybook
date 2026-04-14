import { screen, within } from '@testing-library/react'

import {
  closeCategoryMenu,
  goToNextCategory,
  openCategory,
  openCategoryMenu,
  searchProducts,
  selectCategories,
  selectSubcategory,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  babyFoodSubcategoryDetail,
  categories,
  categoryDetail,
  speciesCategoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { order } from 'app/order/__scenarios__/orderDetail'
import {
  getProductCell,
  increaseProduct,
  openProductDetail,
} from 'pages/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Order Products - Categories', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const defaultResponses = [
    { path: `/customers/1/orders/1235/`, responseBody: order },
    { path: `/customers/1/orders/1235/cart/`, responseBody: orderCart },
    { path: '/categories/', responseBody: categories },
    { path: '/categories/112/', responseBody: categoryDetail },
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should show the categories', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')

    const categoryTitle = screen.getByRole('heading', {
      name: 'Aceite, vinagre y sal',
    })
    const categoryMenuButton = screen.getByRole('button', {
      name: 'Aceite, vinagre y sal',
    })
    const firstCategorySubtitle = screen.getByRole('heading', {
      name: 'Aceite de oliva',
    })
    const firstCategoryProduct = screen.getByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    const subcategoryButton = screen.getByRole('button', {
      name: 'Bebé',
    })
    const subcategorySection = screen.queryByText('Alimentación infantil')
    const searchPlaceholder = screen.queryByText(
      'Search for products you want to add to your order.',
    )
    const categoryButton = screen.getByText('Categories')
    expect(categoryMenuButton).toBeInTheDocument()
    expect(categoryTitle).toBeInTheDocument()
    expect(firstCategorySubtitle).toBeInTheDocument()
    expect(firstCategoryProduct).toBeInTheDocument()
    expect(subcategoryButton).toBeInTheDocument()
    expect(categoryButton).toBeInTheDocument()
    expect(subcategorySection).not.toBeInTheDocument()
    expect(searchPlaceholder).not.toBeInTheDocument()
  })

  it('should display another category products using the menu', async () => {
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
    const subCategorySectionTitle = await screen.findByRole('heading', {
      name: 'Tarritos salados',
    })

    const subCategoryTitle = screen.getByRole('heading', {
      name: 'Alimentación infantil',
    })
    const subCategoryButton = screen.getByRole('button', {
      name: 'Alimentación infantil',
    })
    expect(subCategorySectionTitle).toBeInTheDocument()
    expect(subCategoryTitle).toBeInTheDocument()
    expect(subCategoryButton).toBeInTheDocument()
    expect(screen.getByText('Agua mineral Bronchales')).toBeInTheDocument()
  })

  it('should display another subcategory products using the next category button', async () => {
    const responses = [
      ...defaultResponses,
      {
        path: '/categories/115/',
        responseBody: speciesCategoryDetail,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    goToNextCategory('Especias')
    const subCategorySectionTitle = await screen.findByText('Hierbas')

    const subCategoryTitle = screen.getByRole('heading', {
      name: 'Especias',
    })
    const subCategoryButton = screen.getByRole('button', {
      name: 'Especias',
    })
    expect(subCategorySectionTitle).toBeInTheDocument()
    expect(subCategoryButton).toBeInTheDocument()
    expect(subCategoryTitle).toBeInTheDocument()
    expect(
      screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
    ).toBeInTheDocument()
    expect(HTMLElement.prototype.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('should not display the next category button if there is the last subcategory', async () => {
    const responses = [
      ...defaultResponses,
      {
        path: '/categories/115/',
        responseBody: speciesCategoryDetail,
      },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    goToNextCategory('Especias')
    await screen.findByText('Hierbas')

    expect(screen.queryByText(/View/)).not.toBeInTheDocument()
  })

  it('should hide categories after triggering a search', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    const categoryTitle = await screen.findByText('Aceite, especias y salsas')
    searchProducts('jam')
    await screen.findByText('Jamón serrano Hacendado')

    expect(categoryTitle).not.toBeInTheDocument()
  })

  it('should display the placeholder when clears the search bar', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    searchProducts('jam')
    await screen.findByText('Jamón serrano Hacendado')
    searchProducts('')
    await screen.findByText(
      'Search for products you want to add to your order.',
    )

    expect(
      screen.queryByText('Aceite, especias y salsas'),
    ).not.toBeInTheDocument()
  })

  it('should show the categories clicking to categories button', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    searchProducts('jam')
    await screen.findByText('Jamón serrano Hacendado')
    selectCategories()
    await screen.findByText('Aceite, especias y salsas')

    expect(screen.getByText('Aceite, especias y salsas')).toBeInTheDocument()
    expect(screen.getByLabelText('Search products').value).toBe('')
  })

  describe('When the resolution is min than 1440px', () => {
    it('should show and hide the categories menu', async () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200)
      wrap(App)
        .atPath('/orders/1235/edit/products')
        .withNetwork(defaultResponses)
        .withLogin()
        .mount()

      await screen.findByText('Aceite, vinagre y sal')

      expect(
        screen.queryByText('Aceite, especias y salsas'),
      ).not.toBeInTheDocument()

      openCategoryMenu()

      expect(screen.getByText('Aceite, especias y salsas')).toBeInTheDocument()

      closeCategoryMenu()

      expect(
        screen.queryByText('Aceite, especias y salsas'),
      ).not.toBeInTheDocument()
    })

    it('should hide the categories menu when select a subcategory', async () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200)
      const responses = [
        ...defaultResponses,
        {
          path: '/categories/115/',
          responseBody: speciesCategoryDetail,
        },
      ]
      wrap(App)
        .atPath('/orders/1235/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByText('Aceite, vinagre y sal')
      openCategoryMenu()

      expect(screen.getByText('Aceite, especias y salsas')).toBeInTheDocument()

      const menuItem = screen.getByText('Aceite, especias y salsas')
      expect(menuItem).toBeInTheDocument()

      selectSubcategory('Especias')
      await screen.findByText('Hierbas')

      expect(menuItem).not.toBeInTheDocument()
    })

    it('should hide the categories menu when click outside', async () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200)
      const responses = [
        ...defaultResponses,
        {
          path: '/categories/115/',
          responseBody: speciesCategoryDetail,
        },
        { path: '/products/8731/', requestBody: null },
        {
          path: '/products/8731/xselling/?exclude=3317,71502&lang=es&wh=vlc1',
          requestBody: null,
        },
      ]
      wrap(App)
        .atPath('/orders/1235/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByText('Aceite, vinagre y sal')
      openCategoryMenu()
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      await screen.findByRole('dialog')

      const menu = screen.queryByText('Aceite, especias y salsas')
      expect(menu).not.toBeInTheDocument()
    })

    it('should keep the selected subcategory after reopen the categories menu', async () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200)
      const responses = [
        ...defaultResponses,
        {
          path: '/categories/115/',
          responseBody: speciesCategoryDetail,
        },
      ]
      wrap(App)
        .atPath('/orders/1235/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByText('Aceite, vinagre y sal')
      openCategoryMenu()
      selectSubcategory('Especias')
      await screen.findByText('Hierbas')
      openCategoryMenu()
      closeCategoryMenu()

      expect(screen.getByText('Hierbas')).toBeInTheDocument()
    })
  })

  it('should show new arrival label for a product and user is logged in', async () => {
    const categoryDetailClone = cloneDeep(categoryDetail)
    categoryDetailClone.categories[0].products[0].is_new_arrival = true
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork([
        { path: `/customers/1/orders/1235/`, responseBody: order },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetailClone },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')

    const product = getProductCell(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(within(product).getByText('NEW')).toBeInTheDocument()
  })

  it('should send metrics when adding a new arrival to the cart', async () => {
    const categoryDetailClone = cloneDeep(categoryDetail)
    categoryDetailClone.categories[0].products[0].is_new_arrival = true
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork([
        { path: `/customers/1/orders/1235/`, responseBody: order },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetailClone },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')

    increaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'add_product_click',
      expect.objectContaining({
        tag_new_arrival: true,
      }),
    )
  })
})
