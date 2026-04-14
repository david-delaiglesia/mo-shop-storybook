import { Link } from 'react-router-dom'

import EmptyPlaceHolderImage from './EmptyPlaceholder.svg'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { PATHS } from 'pages/paths'
import { interpolatePath } from 'pages/routing'

import './ShoppingListItem.css'

interface ShoppingListItemImageProps {
  image?: string
  position: number
}

const ShoppingListItemImage = ({
  image,
  position,
}: ShoppingListItemImageProps) => {
  if (!image) {
    return (
      <img
        alt=""
        className={`shopping-list-item__placeholder shopping-list-item__image-empty--position${position}`}
        src={EmptyPlaceHolderImage}
      />
    )
  }

  return (
    <img
      alt=""
      className={`shopping-list-item__product-image shopping-list-item__image--position${position}`}
      src={image}
    />
  )
}

interface ShoppingListItemProps {
  id: string
  name: string
  productsQuantity: number
  t: (key: string) => void
  thumbnailImages: string[]
  order: number
}

const ShoppingListItem = ({
  t,
  id,
  name,
  order,
  thumbnailImages,
  productsQuantity,
}: ShoppingListItemProps) => {
  const quantityCaption =
    productsQuantity === 1
      ? t('shopping_lists.list_item.product')
      : t('shopping_lists.list_item.products')

  const path = interpolatePath(PATHS.SHOPPING_LISTS_DETAIL, { listId: id })

  return (
    <Link
      key={id}
      to={path}
      className="shopping-list-item__wrapper"
      onClick={() =>
        ShoppingListsMetrics.listItemClick(
          id,
          name,
          productsQuantity,
          order,
          'purchase',
        )
      }
    >
      <div className="shopping-list-item__product-image-wrapper">
        <ShoppingListItemImage image={thumbnailImages[0]} position={1} />
        <ShoppingListItemImage image={thumbnailImages[1]} position={2} />
        <ShoppingListItemImage image={thumbnailImages[2]} position={3} />
        <ShoppingListItemImage image={thumbnailImages[3]} position={4} />
        <span className="product-cell__image-overlay"></span>
      </div>
      <div className="shopping-list-item__list-info">
        <div className="headline1-b shopping-list-item__title">{name}</div>
        <div className="subhead1-r shopping-list-item__quantity">{`${productsQuantity} ${quantityCaption}`}</div>
      </div>
    </Link>
  )
}

const ShoppingListItemWithTranslate = withTranslate(ShoppingListItem)

export { ShoppingListItemWithTranslate as ShoppingListItem }
