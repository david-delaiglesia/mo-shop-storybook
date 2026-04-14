import { func, object, string } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { CartUnpublishedProductCell } from 'app/cart/components/cart-product-cell'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { Cart, CartPropTypes } from 'domain/cart'
import { ProductListPropTypes } from 'domain/product'
import { TAB_INDEX } from 'utils/constants'

const CartUnpublishedProductList = ({
  cart,
  products,
  warehouse,
  unpublishedSectionRef,
  t,
}) => {
  if (Cart.isEmpty(cart)) return null

  const orderLines = cart.products

  const orderedProducts = Object.keys(orderLines)
    .map((id) => {
      return { ...orderLines[id], id }
    })
    .filter(({ id }) => orderLines[id].quantity)

  return (
    <div ref={unpublishedSectionRef}>
      <p
        className="subhead1-b cart-unpublised__title"
        tabIndex={TAB_INDEX.ENABLED}
      >
        {t('product_unavailable')}
      </p>
      {orderedProducts.map(({ id }) => (
        <CartUnpublishedProductCell
          key={id}
          product={products[id]}
          productCart={orderLines[id]}
          warehouse={warehouse}
        />
      ))}
    </div>
  )
}

CartUnpublishedProductList.propTypes = {
  cart: CartPropTypes.isRequired,
  products: ProductListPropTypes.isRequired,
  warehouse: string.isRequired,
  unpublishedSectionRef: object.isRequired,
  t: func.isRequired,
}

const ComposedCartUnpublishedProductList = compose(withTranslate)(
  CartUnpublishedProductList,
)

export { ComposedCartUnpublishedProductList as CartUnpublishedProductList }
