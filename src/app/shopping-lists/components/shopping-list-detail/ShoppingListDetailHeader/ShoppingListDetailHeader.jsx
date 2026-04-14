import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

import { ActionButton } from './action-button'
import { AddAllToCartButton } from './add-all-to-cart-button'
import { MoreActionsButton } from './more-actions-button'
import { SearchProductsDialog } from './search-products-dialog'
import classNames from 'classnames'
import { bool, func, object, string } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { FocusedElement, useAccessibilityFocus } from 'app/accessibility'
import { withTranslate } from 'app/i18n/containers/i18n-provider/withTranslate'
import { SORTING_METHODS } from 'app/shopping-lists/constants'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { DropdownWithClickOut } from 'components/dropdown'
import { Storage } from 'services/storage/storage.js'
import { Plus28Icon } from 'system-ui/icons'
import { TAB_INDEX } from 'utils/constants'

import './ShoppingListDetailHeader.css'

const ShoppingListDetailHeader = ({
  listDetail,
  sortingMethod,
  setSortingMethod,
  displayHeaderActions,
  reFetchListDetail,
  t,
}) => {
  const { name, id: listId, products_quantity: productsQuantity } = listDetail

  const [isSearchModalVisible, setDisplaySearchModal] = useState(false)
  const [isSortDropdownOpened, setIsSortDropdownOpened] = useState(false)

  const closeSortDropdown = () => setIsSortDropdownOpened(false)
  const toggleSortDropdown = () =>
    setIsSortDropdownOpened(!isSortDropdownOpened)

  const productQuantityCaption =
    productsQuantity === 1
      ? t('shopping_lists.list_item.product')
      : t('shopping_lists.list_item.products')

  const openSearchDialog = () => {
    setDisplaySearchModal(true)
    ShoppingListsMetrics.openSearchDialog(listId, name, productsQuantity)
  }

  const updateSortingMethod = (method) => {
    setSortingMethod(method)
    closeSortDropdown()
    Storage.setShoppingListDetailOrderBy(listId, method)
  }

  const isEmptyList = productsQuantity === 0

  const sortDropdownHeader = (
    <div className="sorting-method__selector caption2-sb">
      <p className="caption2-sb selector__text">{t(`${sortingMethod}`)}</p>
      <Icon icon={'chevron-down'} />
    </div>
  )

  const sortDropDownContent = (
    <ul
      tabIndex={TAB_INDEX.ENABLED}
      role="menu"
      className="sorting-method__options"
    >
      <li
        role="menuitem"
        tabIndex={TAB_INDEX.ENABLED}
        className="footnote1-r sorting-method__option"
        onClick={() => {
          ShoppingListsMetrics.orderShoppingList('time')
          updateSortingMethod(SORTING_METHODS.TIME)
        }}
      >
        {t('product_sorting_by_time')}
      </li>
      <li
        role="menuitem"
        tabIndex={TAB_INDEX.ENABLED}
        className="footnote1-r sorting-method__option"
        onClick={() => {
          ShoppingListsMetrics.orderShoppingList('categories')
          updateSortingMethod(SORTING_METHODS.CATEGORY)
        }}
      >
        {t('product_sorting_by_category')}
      </li>
    </ul>
  )

  const nameWrapperClass = classNames(
    'shopping-list-detail-header__product-info-wrapper',
    {
      'shopping-list-detail-header__product-info-wrapper--with-products':
        productsQuantity > 0,
    },
  )

  const dropDownWrapperClass = classNames(
    'shopping-list-detail-header__products-order-wrapper',
    {
      'shopping-list-detail-header__products-order-wrapper--disabled':
        isEmptyList,
    },
  )

  const { setFocusRef, focusOnElement } = useAccessibilityFocus()

  const location = useLocation()

  useEffect(() => {
    focusOnElement()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  const sortProductsAriaLabel = `${t('accessibility.sorting_cart_menu_title')} ${t(sortingMethod)}`

  return (
    <>
      <div className="shopping-list-detail-header__wrapper">
        <div className={nameWrapperClass}>
          <FocusedElement innerRef={setFocusRef}>
            <h1 className="shopping-list-detail-header__name">{name}</h1>
          </FocusedElement>
          <div
            tabIndex={TAB_INDEX.ENABLED}
            className="shopping-list-detail-header__products-quantity body1-r"
          >
            {productsQuantity} {productQuantityCaption}
          </div>
        </div>
        {displayHeaderActions && (
          <div className="shopping-list-detail-header__actions-wrapper">
            {productsQuantity > 0 && (
              <AddAllToCartButton listDetail={listDetail} />
            )}
            <ActionButton
              label={t('shopping_lists.header_actions.search_products')}
              icon={Plus28Icon}
              onClick={openSearchDialog}
            />
            <MoreActionsButton />
            {isSearchModalVisible && (
              <SearchProductsDialog
                hideDialog={() => {
                  setDisplaySearchModal(false)
                  reFetchListDetail()
                }}
              />
            )}
          </div>
        )}
        {
          <div
            className="shopping-list-detail-header__products-order-dropdown"
            tabIndex={TAB_INDEX.ENABLED}
          >
            <div
              data-testid="shopping-list-detail-sorting-method-selector"
              className={dropDownWrapperClass}
            >
              <span
                aria-hidden={true}
                className="shopping-list-detail-header__products-order-title caption1-sb"
              >
                {t('product_sorting_title')}
              </span>
              <DropdownWithClickOut
                ariaLabel={sortProductsAriaLabel}
                handleClickOutside={closeSortDropdown}
                header={sortDropdownHeader}
                content={sortDropDownContent}
                open={isSortDropdownOpened}
                toggleDropdown={toggleSortDropdown}
                disabled={isEmptyList}
              />
            </div>
          </div>
        }
        <hr
          className="shopping-list-detail-header__separator"
          aria-hidden="true"
        />
      </div>
    </>
  )
}

ShoppingListDetailHeader.propTypes = {
  t: func,
  listDetail: object,
  sortingMethod: string,
  setSortingMethod: func,
  displayHeaderActions: bool,
  reFetchListDetail: func,
}

const ShoppingListDetailHeaderWithTranslate = withTranslate(
  ShoppingListDetailHeader,
)

export { ShoppingListDetailHeaderWithTranslate as ShoppingListDetailHeader }
