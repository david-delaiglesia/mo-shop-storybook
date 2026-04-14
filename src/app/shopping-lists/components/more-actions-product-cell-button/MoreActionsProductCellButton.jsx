import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import classNames from 'classnames'
import { bool, func, object } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { EditDefaultQuantityDialog } from 'app/shopping-lists/components/edit-default-quantity-dialog'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { useShoppingListsContext } from 'app/shopping-lists/infra/shopping-lists-provider'
import { MoreActionsHorizontalIcon } from 'system-ui/icons'
import { withClickOutside } from 'wrappers/click-out-handler'
import { useMyRegulars } from 'wrappers/recommendation-provider/RecommendationProvider'

import './MoreActionsProductCellButton.css'

const MoreActionsProductCellButtonImplementation = ({
  product,
  isMenuVisible,
  setMenuVisible,
  isProductInCart,
}) => {
  const { listId } = useParams()
  const { t } = useTranslation()
  const myRegularContext = useMyRegulars()
  const { listName, productsIds } = useShoppingListsContext()

  const order = productsIds.findIndex((productId) => productId === product.id)

  const [isEditQuantityDialogVisible, setEditQuantityDialogVisible] =
    useState(false)

  const editQuantityButtonClassname = classNames(
    'more-actions-product-cell-button__action subhead1-r',
    {
      'more-actions-product-cell-button__action--disabled': isProductInCart,
    },
  )

  const handleToggleMoreActionsVisibility = () => {
    setMenuVisible((prevState) => !prevState)
    ShoppingListsMetrics.clickOnMoreActionsButton(
      listId,
      listName,
      product.id,
      product.display_name,
      order,
    )
  }

  return (
    <div className="actions-product-cell-button">
      <button
        aria-label={t('shopping_lists.delete_list.more_actions_button_text')}
        type="text"
        onClick={handleToggleMoreActionsVisibility}
      >
        <div>
          <MoreActionsHorizontalIcon
            className="more-actions-product-cell-button__icon"
            size={16}
          />
        </div>
      </button>
      {isMenuVisible && (
        <div className="more-actions-product-cell-button__actions-list">
          <button
            aria-disabled={isProductInCart}
            className={editQuantityButtonClassname}
            onClick={() => {
              if (isProductInCart) {
                ShoppingListsMetrics.clickOnEditRecommendedQuantityDisabled(
                  listId,
                  listName,
                  product.id,
                  product.display_name,
                  order,
                )
                return
              }

              ShoppingListsMetrics.clickOnEditRecommendedQuantity(
                listId,
                listName,
                product.id,
                product.display_name,
                order,
              )
              setEditQuantityDialogVisible(true)
            }}
            type="text"
          >
            {t('shopping_lists.more_actions.edit_quantity')}
            <Icon icon="edit" />
          </button>
          <button
            className="more-actions-product-cell-button__action more-actions-product-cell-button__action-delete subhead1-r"
            onClick={() => myRegularContext.removeMyRegularProduct(product)}
            type="text"
          >
            {t('shopping_lists.more_actions.remove_product')}
            <Icon icon="delete" />
          </button>
        </div>
      )}
      {isEditQuantityDialogVisible && (
        <EditDefaultQuantityDialog
          product={product}
          onEditQuantityDialogVisible={setEditQuantityDialogVisible}
        />
      )}
    </div>
  )
}

MoreActionsProductCellButtonImplementation.propTypes = {
  product: object,
  isMenuVisible: bool,
  setMenuVisible: func,
  isProductInCart: bool,
}

const MoreActionsProductCellButtonImplementationWithClickOut = withClickOutside(
  MoreActionsProductCellButtonImplementation,
)

const MoreActionsProductCellButton = ({ product, isProductInCart }) => {
  const [isMenuVisible, setMenuVisible] = useState(false)
  return (
    <MoreActionsProductCellButtonImplementationWithClickOut
      isMenuVisible={isMenuVisible}
      setMenuVisible={setMenuVisible}
      product={product}
      handleClickOutside={() => setMenuVisible(false)}
      isProductInCart={isProductInCart}
    />
  )
}

MoreActionsProductCellButton.propTypes = {
  product: object,
  isProductInCart: bool,
}

export { MoreActionsProductCellButton }
