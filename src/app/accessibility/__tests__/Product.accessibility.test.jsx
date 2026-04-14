import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'

import { ProductSection } from 'app/catalog/components/product-section'
import { createReduxStore } from 'app/redux'
import { SelectShoppingListDialog } from 'app/shopping-lists/components/select-shopping-list-dialog'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'

const store = createReduxStore()

ShoppingListsClient.fetchProductShoppingLists = vi.fn(() => {
  return Promise.resolve({ shoppingLists: [] })
})

describe('Product - accessibility', () => {
  it('should focus on the header of save to a new list dialog', async () => {
    render(
      <Provider store={store}>
        <SelectShoppingListDialog />
      </Provider>,
    )

    expect(
      screen.getByText('shopping_lists.add_to_list.description'),
    ).toHaveFocus()
  })

  it('should NOT focus on the header of a product section if the URL path is not Price drops', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/test-path']}>
          <ProductSection name="another name" products={[]} />
        </MemoryRouter>
      </Provider>,
    )

    expect(screen.getByText('another name')).not.toHaveFocus()
  })

  it('should focus on the header of Price drops', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/price-drops']}>
          <ProductSection name="Bajadas de precio" products={[]} />
        </MemoryRouter>
      </Provider>,
    )

    expect(screen.getByText('Bajadas de precio')).toHaveFocus()
  })
})
