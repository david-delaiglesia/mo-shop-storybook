import { useEffect, useState } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'

import classNames from 'classnames'
import { bool, func, number, object } from 'prop-types'

import { compose, useClickOut } from '@mercadona/mo.library.dashtil'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import withAgeVerification from 'app/cart/containers/with-age-verification'
import { CatalogClient } from 'app/catalog/client'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { EditOrderCart } from 'app/order/components/edit-order-cart'
import { EditOrderProductsContent } from 'app/order/components/edit-order-products-content'
import OrderHeader from 'app/order/components/order-header'
import { useOrder } from 'app/order/context'
import { isSmallResolution } from 'app/order/screen-service'
import { SearchBoxInEditPurchase } from 'app/search/containers/search-box-container'
import { CategoryService } from 'domain/category'
import { URL_PARAMS } from 'pages/paths'

import './EditOrderProducts.css'

const EditOrderProducts = ({
  cancelEdition,
  buttonAction,
  cart,
  products,
  requiresAgeCheck,
  minPurchaseAlert,
  items,
  t,
}) => {
  const isBigResolution = !isSmallResolution()
  const [categories, setCategories] = useState([])
  const [resetSearchBoxValue, setResetSearchBoxValue] = useState(false)
  const [menuVisible, setMenuVisible] = useState(isBigResolution)
  const [isShoppingListDetailMenuVisible, setShoppingListDetailMenuVisible] =
    useState(false)
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)

  const order = useOrder()

  const location = useLocation()
  const history = useHistory()

  const getQuery = (query) => {
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get(query)
  }

  const categoryId = Number(getQuery('category'))
  const isInShoppingListMyRegulars = getQuery('shopping-list-my-regulars')
  const isInShoppingList = getQuery('shopping-list-id')
  const isDisplayCategories = getQuery('display-categories')

  const getCategories = async () => {
    setIsCategoriesLoading(true)
    try {
      const response = await CatalogClient.getCategories(order.warehouse)
      if (!response) {
        return
      }
      const categories = response.results
      const categoryId = CategoryService.getFirstCategoryId(categories)

      setCategories(categories)
      goToCategory(categoryId)
    } finally {
      setIsCategoriesLoading(false)
    }
  }

  useEffect(() => {
    getCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isDisplayCategories) {
      displayCategories()
      goToCategory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisplayCategories])

  const onSearchStateChange = (searchState) => {
    if (searchState === undefined) return

    if (!searchState) {
      goToSearch()
      return
    }

    goToSearch(searchState)
  }

  const displayCategories = () => {
    resetSearchBox()
    setMenuVisible(true)
    setShoppingListDetailMenuVisible(false)
  }

  const displayShoppingLists = () => {
    resetSearchBox()
    setMenuVisible(false)
    setShoppingListDetailMenuVisible(true)
  }

  const resetSearchBox = () => {
    setResetSearchBoxValue(true)
    setTimeout(() => {
      setResetSearchBoxValue(null)
    }, 200)
  }

  const goToSearch = (search = '') => {
    history.replace({ ...location, search: `?search=${search}` })
  }

  const goToCategory = (id, { isSubcategory } = {}) => {
    if (!id) {
      getCategories()
      return
    }

    if (isSubcategory && isSmallResolution()) {
      setMenuVisible(false)
    }

    const params = new URLSearchParams()
    params.set('category', id)

    if (isSubcategory) {
      params.set(URL_PARAMS.FOCUS_ON_DETAIL, 'category')
    }

    history.replace({ ...location, search: params.toString() })
  }

  const { refContainer } = useClickOut(() => {
    if (isSmallResolution()) {
      setMenuVisible(false)
    }
  }, menuVisible)

  const { refContainer: shoppingListMenuAsideRef } = useClickOut(() => {
    if (isSmallResolution()) {
      setShoppingListDetailMenuVisible(false)
    }
  }, isShoppingListDetailMenuVisible)

  const categoryMenuItemClassNames = classNames(
    'edit-order-products__menu-item',
    'subhead1-sb',
    { 'edit-order-products__menu-item--selected': categoryId },
  )

  const myProductsMenuItemClassNames = classNames(
    'edit-order-products__menu-item',
    'subhead1-sb',
    {
      'edit-order-products__menu-item--selected':
        isInShoppingListMyRegulars || isInShoppingList,
    },
  )

  const defaultCategoryId =
    categories.length && CategoryService.getFirstCategoryId(categories)

  const categoriesPath = `?category=${categoryId || defaultCategoryId}&${URL_PARAMS.FOCUS_ON_CATEGORY}=true`

  const shoppingListMyRegularsPath = isInShoppingList
    ? `?shopping-list-id=${isInShoppingList}`
    : `?shopping-list-my-regulars=true&${URL_PARAMS.FOCUS_ON_DETAIL}=false`

  const headerButtonAriaLabel = t('accessibility.cancel_and_go_back')

  return (
    <div className="edit-order-products">
      <OrderHeader
        text={t('user_area.edit_order.header')}
        ariaLabel={headerButtonAriaLabel}
        callback={cancelEdition}
      />
      <div className="edit-order-products__content">
        <div className="edit-order-products__results">
          <div className="edit-order-products__header">
            <nav className="edit-order-products__nav">
              <FocusedElementWithInitialFocus>
                <Link
                  to={categoriesPath}
                  className={categoryMenuItemClassNames}
                  onClick={displayCategories}
                >
                  {t('header.menu.categories')}
                </Link>
              </FocusedElementWithInitialFocus>
              <Link
                to={shoppingListMyRegularsPath}
                className={myProductsMenuItemClassNames}
                onClick={displayShoppingLists}
              >
                {t('shopping_lists.title')}
              </Link>
            </nav>
            <SearchBoxInEditPurchase
              key={resetSearchBoxValue}
              isSearchPage={true}
              onChange={onSearchStateChange}
              warehouseOrder={order.warehouse}
            />
          </div>
          {!isCategoriesLoading && (
            <div
              className="edit-order-products__results-container"
              data-testid="edit-order-products-container"
            >
              <EditOrderProductsContent
                categories={categories}
                goToCategory={goToCategory}
                menuVisible={menuVisible}
                setMenuVisible={setMenuVisible}
                isShoppingListDetailMenuVisible={
                  isShoppingListDetailMenuVisible
                }
                refContainer={refContainer}
                shoppingListMenuAsideRef={shoppingListMenuAsideRef}
              />
            </div>
          )}
        </div>
        <EditOrderCart
          cancelEdition={cancelEdition}
          buttonAction={buttonAction}
          cart={cart}
          products={products}
          requiresAgeCheck={requiresAgeCheck}
          minPurchaseAlert={minPurchaseAlert}
          items={items}
        />
      </div>
    </div>
  )
}

EditOrderProducts.propTypes = {
  cancelEdition: func,
  buttonAction: func,
  cart: object.isRequired,
  products: object.isRequired,
  requiresAgeCheck: bool.isRequired,
  minPurchaseAlert: bool.isRequired,
  items: number.isRequired,
  t: func.isRequired,
}

const ComposedEditOrderProducts = compose(
  withAgeVerification,
  withTranslate,
)(EditOrderProducts)

export const PlainEditOrderProducts = EditOrderProducts

export { ComposedEditOrderProducts as EditOrderProducts }
