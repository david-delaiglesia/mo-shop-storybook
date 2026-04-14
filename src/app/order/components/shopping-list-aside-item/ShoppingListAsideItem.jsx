import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

import classNames from 'classnames'
import PropTypes from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import EmptyPlaceHolderImage from 'app/shopping-lists/components/shopping-list-item/EmptyPlaceholder.svg'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'

import './ShoppingListAsideItem.css'

const ShoppingListItemImage = ({ image, position }) => {
  if (!image) {
    return (
      <img
        alt=""
        className={`shopping-list-item-aside__placeholder shopping-list-item-aside__image-empty--position${position}`}
        src={EmptyPlaceHolderImage}
      />
    )
  }

  return (
    <img
      alt=""
      className={`shopping-list-item-aside__product-image shopping-list-item-aside__image--position${position}`}
      src={image}
    />
  )
}

ShoppingListItemImage.propTypes = {
  image: PropTypes.string,
  position: PropTypes.number,
}

const ShoppingListAsideItem = ({
  id,
  name,
  thumbnailImages,
  productsQuantity,
  order,
}) => {
  const { t } = useTranslation()
  const { search } = useLocation()

  const searchParams = new URLSearchParams(search)
  const shoppingListId = searchParams.get('shopping-list-id')
  const isShoppingListSelected = id === shoppingListId
  const wrapperClassNames = classNames('shopping-list-item-aside__wrapper', {
    'shopping-list-item-aside__wrapper--selected': isShoppingListSelected,
  })

  const quantityCaption =
    productsQuantity === 1
      ? t('shopping_lists.list_item.product')
      : t('shopping_lists.list_item.products')

  return (
    <Link
      key={id}
      to={`?shopping-list-id=${id}`}
      className={wrapperClassNames}
      onClick={() => {
        ShoppingListsMetrics.listItemClick(
          id,
          name,
          productsQuantity,
          order,
          'edit',
        )
      }}
    >
      <div className="shopping-list-item-aside__product-image-wrapper">
        <ShoppingListItemImage image={thumbnailImages[0]} position={1} />
        <ShoppingListItemImage image={thumbnailImages[1]} position={2} />
        <ShoppingListItemImage image={thumbnailImages[2]} position={3} />
        <ShoppingListItemImage image={thumbnailImages[3]} position={4} />
        <span className="product-cell__image-overlay"></span>
      </div>
      <div className="shopping-list-item-aside__list-info">
        <div className="subhead1-b shopping-list-item-aside__title">{name}</div>
        <div className="footnote1-r shopping-list-item-aside__quantity">{`${productsQuantity} ${quantityCaption}`}</div>
      </div>
    </Link>
  )
}

ShoppingListAsideItem.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  productsQuantity: PropTypes.number,
  thumbnailImages: PropTypes.array,
  order: PropTypes.number,
}

const ShoppingListAsideItemWithTranslate = withTranslate(ShoppingListAsideItem)

export { ShoppingListAsideItemWithTranslate as ShoppingListAsideItem }
