import { Fragment } from 'react'
import { useLocation } from 'react-router-dom'

import { monitoring } from 'monitoring'
import { array, bool, func, object } from 'prop-types'

import { CategoryDetailContainer } from 'app/catalog/containers/category-detail-container'
import { MyRegularsContainer } from 'app/my-regulars/containers/my-regulars-container'
import EditProductsPlaceholder from 'app/order/components/edit-products-placeholder'
import { ShoppingListAside } from 'app/order/components/shopping-list-aside/ShoppingListAside.jsx'
import { useShoppingLists } from 'app/order/components/shopping-list-aside/useShoppingLists.js'
import { useOrder } from 'app/order/context'
import { isSmallResolution } from 'app/order/screen-service'
import { SearchResultsContainer } from 'app/search/containers/search-results-container'
import { ShoppingListDetailNoLayout } from 'app/shopping-lists/components/shopping-list-detail'
import { CategoryMenu } from 'components/category-menu'
import { CategoryService } from 'domain/category'
import { MyRegulars } from 'pages/my-regulars'
import { getNextSubcategory } from 'utils/categories'

import './EditOrderProductsContent.css'

const EDIT_ORDER_VIEW = 'edit-order'

const EditOrderProductsContent = ({
  categories,
  goToCategory,
  setMenuVisible,
  menuVisible,
  isShoppingListDetailMenuVisible,
  refContainer,
  shoppingListMenuAsideRef,
}) => {
  const location = useLocation()
  const order = useOrder()
  const [response, isLoading] = useShoppingLists()

  const getQuery = (query) => {
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get(query)
  }
  const searchQuery = getQuery('search')
  const categoryId = Number(getQuery('category'))

  const nextSubcategory = getNextSubcategory(categories, categoryId)
  const nextSubcategoryPath = `?category=${nextSubcategory?.id}`

  const isSearching = typeof searchQuery === 'string'
  const isInMyRegulars = getQuery('my-regulars')
  const isInShoppingListMyRegulars = getQuery('shopping-list-my-regulars')
  const isInCategoryView = !!categoryId
  const shoppingListId = getQuery('shopping-list-id')

  const onCategoryChanged = (category) => {
    if (category.categories?.length > 0) {
      setTimeout(() => {
        document.getElementById(category.categories[0].id)?.focus()
      })
    }
    const categoryId = CategoryService.getFirstSubcategoryId(category)
    goToCategory(categoryId)
  }

  const onSubcategoryChanged = (category) => {
    goToCategory(category.id, { isSubcategory: true })
  }

  const goToCategories = () => {
    setMenuVisible(true)
    goToCategory()
  }

  if (isInMyRegulars) {
    return (
      <MyRegularsContainer
        goToCategories={goToCategories}
        warehouse={order.warehouse}
      />
    )
  }

  if (isSearching) {
    return (
      <Fragment>
        {searchQuery ? <SearchResultsContainer /> : <EditProductsPlaceholder />}
      </Fragment>
    )
  }

  if (isInCategoryView) {
    return (
      <Fragment>
        {menuVisible && (
          <CategoryMenu
            refContainer={refContainer}
            categories={categories}
            categoryId={categoryId}
            onCategoryChanged={onCategoryChanged}
            onSubcategoryChanged={onSubcategoryChanged}
          />
        )}
        <CategoryDetailContainer
          categoryId={categoryId}
          nextSubcategory={nextSubcategory}
          nextSubcategoryPath={nextSubcategoryPath}
          orderWarehouse={order.warehouse}
          fetchingFrom={EDIT_ORDER_VIEW}
        />
      </Fragment>
    )
  }

  if (isInShoppingListMyRegulars || shoppingListId) {
    return (
      <>
        {isShoppingListDetailMenuVisible && (
          <ShoppingListAside
            response={response}
            isLoading={isLoading}
            shoppingListMenuAsideRef={shoppingListMenuAsideRef}
          />
        )}
        <div
          className={
            isSmallResolution()
              ? 'edit-order-products-content__shopping-list-wrapper--small-resolution'
              : 'edit-order-products-content__shopping-list-wrapper'
          }
        >
          <div className="edit-order-products-content__shopping-list-responsive">
            {!shoppingListId && <MyRegulars withLayout={false} />}
            {shoppingListId && <ShoppingListDetailNoLayout />}
          </div>
        </div>
      </>
    )
  }

  monitoring.captureError(new Error('Fail to retrieve the order content'))

  return null
}

EditOrderProductsContent.propTypes = {
  categories: array,
  menuVisible: bool,
  isShoppingListDetailMenuVisible: bool,
  goToCategory: func.isRequired,
  refContainer: object,
  shoppingListMenuAsideRef: object,
  setMenuVisible: func,
}

export { EditOrderProductsContent, EDIT_ORDER_VIEW }
