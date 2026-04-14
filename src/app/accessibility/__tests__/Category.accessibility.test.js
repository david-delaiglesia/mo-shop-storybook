import { screen, waitFor } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  babyFoodSubcategoryDetail,
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import {
  openCategory,
  openFirstCategory,
} from 'pages/category/__tests__/helpers'
import {
  addProductToCart,
  getProductCellByDisplayName,
} from 'pages/home/__tests__/helpers'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Category Accessibility test', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should not focus on the category heading when loading a category directly', async () => {
    const responses = [
      {
        path: '/categories/',
        responseBody: categories,
      },
      {
        path: '/categories/112/',
        responseBody: categoryDetail,
      },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findAllByText('Aceite, vinagre y sal')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Aceite, vinagre y sal',
      }),
    ).not.toHaveFocus()
  })

  it('should focus on the first category when loading categories', async () => {
    const responses = [{ path: '/categories/', responseBody: categories }]
    wrap(App).atPath('/categories/').withNetwork(responses).withLogin().mount()

    await screen.findAllByText('Aceite, especias y salsas')

    expect(screen.getByText('Aceite, especias y salsas')).toHaveFocus()
  })

  it('should focus on the category heading when selecting a category', async () => {
    const categoryDetailClone = cloneDeep(categoryDetail)
    categoryDetailClone.id = 115
    categoryDetailClone.name = 'Especias'

    const responses = [
      {
        path: '/categories/',
        responseBody: categories,
      },
      {
        path: '/categories/115/',
        responseBody: categoryDetailClone,
      },
    ]
    wrap(App).atPath('/categories/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Aceite, especias y salsas')

    openCategory('Aceite, especias y salsas')
    openCategory('Especias')

    await screen.findByRole('heading', {
      level: 1,
      name: 'Especias',
    })
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Especias',
      }),
    ).toHaveFocus()
  })

  it('should focus on the category heading when selecting the first category under a category section', async () => {
    const responses = [
      {
        path: '/categories/',
        responseBody: categories,
      },
      {
        path: '/categories/216/',
        responseBody: babyFoodSubcategoryDetail,
      },
    ]
    wrap(App).atPath('/categories/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Aceite, especias y salsas')

    openCategory('Bebé')
    await screen.findByRole('heading', {
      level: 1,
      name: 'Alimentación infantil',
    })

    openFirstCategory('Alimentación infantil')
    await screen.findByRole('heading', {
      level: 1,
      name: 'Alimentación infantil',
    })
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Alimentación infantil',
      }),
    ).toHaveFocus()
  })

  it('should keep the focus on Add to Cart button after adding a product to cart', async () => {
    const responses = [
      {
        path: '/categories/',
        responseBody: categories,
      },
      {
        path: '/categories/112/',
        responseBody: categoryDetail,
      },
    ]
    wrap(App)
      .atPath('/categories/112')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByRole('heading', {
      level: 1,
      name: 'Aceite, vinagre y sal',
    })
    const productToAdd = getProductCellByDisplayName(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    addProductToCart(productToAdd)

    const title = screen.getByRole('heading', {
      level: 1,
      name: 'Aceite, vinagre y sal',
    })
    expect(title).not.toHaveFocus()
  })

  it('should focus on the first subcategory when selecting a category group', async () => {
    const responses = [
      {
        path: '/categories/',
        responseBody: categories,
      },
    ]
    wrap(App).atPath('/categories/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Aceite, especias y salsas')

    openCategory('Aceite, especias y salsas')

    expect(
      screen.getByRole('button', {
        name: 'Aceite, vinagre y sal',
      }),
    ).toHaveFocus()
  })

  it('should remove the focus URL param after loading a subcategory', async () => {
    const categoryDetailClone = cloneDeep(categoryDetail)
    categoryDetailClone.id = 115
    categoryDetailClone.name = 'Especias'

    const responses = [
      {
        path: '/categories/',
        responseBody: categories,
      },
      {
        path: '/categories/115/',
        responseBody: categoryDetailClone,
      },
    ]
    wrap(App).atPath('/categories/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Aceite, especias y salsas')

    openCategory('Aceite, especias y salsas')
    openCategory('Especias')

    await screen.findByRole('heading', {
      level: 1,
      name: 'Especias',
    })
    await waitFor(() =>
      expect(window.location.search).not.toContain('focus-on-detail'),
    )
  })
})
