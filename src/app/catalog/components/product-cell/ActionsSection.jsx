import { matchPath } from 'react-router-dom'

import { DeleteProductCellButton } from './DeleteProductCellButton'
import { bool, func, object } from 'prop-types'

import { MoreActionsProductCellButton } from 'app/shopping-lists/components/more-actions-product-cell-button'
import { PATHS } from 'pages/paths'

const ActionsSection = ({
  t,
  product,
  isProductInCart,
  isPublished = true,
}) => {
  const isMyRegularsPageLegacy = !!matchPath(window.location.pathname, {
    path: PATHS.MY_REGULARS,
  })
  const isMyRegularsListPage = !!matchPath(window.location.pathname, {
    path: PATHS.SHOPPING_LISTS_MY_REGULARS,
  })
  const isShoppingListPage = !!matchPath(window.location.pathname, {
    path: PATHS.SHOPPING_LISTS_DETAIL,
  })

  const isMyRegularsPage = isMyRegularsPageLegacy || isMyRegularsListPage

  if (isMyRegularsPage || (isShoppingListPage && !isPublished)) {
    return <DeleteProductCellButton t={t} product={product} />
  }

  if (isShoppingListPage && isPublished) {
    return (
      <MoreActionsProductCellButton
        product={product}
        isProductInCart={isProductInCart}
      />
    )
  }

  return null
}

ActionsSection.propTypes = {
  t: func,
  product: object,
  isProductInCart: bool,
  isPublished: bool,
}

export { ActionsSection }
