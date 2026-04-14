import { useDispatch } from 'react-redux'

import EmptyPlaceHolderImage from './EmptyPlaceholder.svg'
import { useAddProductToShoppingList } from './hooks/useAddProductToShoppingList'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { createNotification } from 'containers/notifications-container/actions'

import './ShoppingListsDialogCardItem.css'

const ShoppingListItemImage = ({ image, position }) => {
  if (!image) {
    return (
      <div className="select-shopping-list-dialog__empty-image-wrapper">
        <img
          alt=""
          className={`select-shopping-list-dialog__empty-image--position${position}`}
          src={EmptyPlaceHolderImage}
        />
      </div>
    )
  }

  return (
    <img
      alt=""
      className={`select-shopping-list-dialog__product-image select-shopping-list-dialog__product-image--position${position}`}
      src={image}
    />
  )
}

ShoppingListItemImage.propTypes = {
  image: PropTypes.string,
  position: PropTypes.number,
}

const ShoppingListsDialogCardItem = ({
  t,
  list,
  productId,
  displayErrorDialog,
  displaySelectShoppingListDialog,
}) => {
  const dispatch = useDispatch()

  const cardItemClasses = classNames('select-shopping-list-dialog__card-item', {
    'select-shopping-list-dialog__card-item--disabled': list.inList,
  })

  const { addProductToShoppingList, isAddingProductToList } =
    useAddProductToShoppingList({
      productId,
      listId: list.id,
    })

  const handleAddProductToShoppingList = () => {
    addProductToShoppingList({
      onSuccess() {
        dispatch(
          createNotification({
            text: `${t(`shopping_lists.add_to_list.notification`)} ${list.name}`,
          }),
        )
        ShoppingListsMetrics.selectListToToggleProduct(
          list?.inList,
          productId,
          list.id,
          list.name,
          list.productsQuantity,
        )
        displaySelectShoppingListDialog(false)
      },
      onError() {
        displayErrorDialog(true)
      },
    })
  }

  return (
    <button
      key={list.id}
      className={cardItemClasses}
      onClick={handleAddProductToShoppingList}
      aria-label={list.name}
      disabled={list.inList || isAddingProductToList}
    >
      <div className="select-shopping-list-dialog__product-image-wrapper">
        <ShoppingListItemImage image={list.thumbnailImages[0]} position={1} />
        <ShoppingListItemImage image={list.thumbnailImages[1]} position={2} />
        <ShoppingListItemImage image={list.thumbnailImages[2]} position={3} />
        <ShoppingListItemImage image={list.thumbnailImages[3]} position={4} />
        <span className="product-cell__image-overlay"></span>
      </div>
      <div className="select-shopping-list-dialog__card-item-info-wrapper">
        <div className="select-shopping-list-dialog__card-item-info">
          <div className="body1-sb select-shopping-list-dialog__card-item-name">
            {list.name}
          </div>
          <div className="subhead1-r select-shopping-list-dialog__card-item-quantity">
            {list.productsQuantity} {t('shopping_lists.list_item.products')}
          </div>
        </div>
        {list.inList && (
          <div className="select-shopping-list-dialog__card-item-in-list-marker subhead1-r">
            <Icon icon="check-28" />
            {t('shopping_lists.list_item.in_list')}
          </div>
        )}
      </div>
    </button>
  )
}

ShoppingListsDialogCardItem.propTypes = {
  t: PropTypes.func,
  list: PropTypes.object,
  productId: PropTypes.string,
  displayErrorDialog: PropTypes.func,
  displaySelectShoppingListDialog: PropTypes.func,
}

const ShoppingListsDialogCardItemWithTranslate = withTranslate(
  ShoppingListsDialogCardItem,
)

export { ShoppingListsDialogCardItemWithTranslate as ShoppingListsDialogCardItem }
