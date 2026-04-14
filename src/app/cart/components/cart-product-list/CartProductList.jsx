import { Component, Fragment, createRef } from 'react'

import { CartUnpublishedProductList } from './CartUnpublishedProductList'
import emptyCartImage from './assets/empty-cart@2x.png'
import { bool, func, number, string } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { CartProductCell } from 'app/cart/components/cart-product-cell'
import { SORTING_METHODS } from 'app/cart/constants'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { Cart, CartPropTypes, CartService } from 'domain/cart'
import { ProductListPropTypes } from 'domain/product'
import { TAB_INDEX } from 'utils/constants'

import './assets/CartProductList.css'

const groupOrderLinesByTime = (cart) => {
  const orderLines = Cart.orderLines(cart).sort((a, b) => b.order - a.order)

  return [{ orderLines }]
}

const groupOrderLinesByCategory = (cart, products) => {
  return CartService.groupOrderLinesByCategory(cart, products)
}

class CartProductList extends Component {
  cartProductListRef = createRef()
  cartUnpublishedProductListRef = createRef()

  componentDidUpdate({
    isCartOpened: prevIsCartOpened,
    sortingMethod: prevSortingMethod,
  }) {
    const { isCartOpened, sortingMethod } = this.props

    const cartHasBeenClosed = prevIsCartOpened && !isCartOpened
    const sortingMethodHasChanged = prevSortingMethod !== sortingMethod

    if (cartHasBeenClosed || sortingMethodHasChanged) {
      this.resetCartScroll()
    }
  }

  resetCartScroll = () => {
    this.cartProductListRef.current.scrollTop = 0
  }

  render() {
    const {
      cartContentHeight,
      cartUnpublished,
      cartPublished,
      sortingMethod,
      products,
      items,
      warehouse,
      t,
    } = this.props

    if (items === 0) {
      return (
        <div
          ref={this.cartProductListRef}
          className="cart-product-list"
          style={{ height: `calc(100vh - ${cartContentHeight}px)` }}
        >
          <div className="cart__empty">
            <img aria-hidden={true} alt="empty-cart" src={emptyCartImage}></img>
            <p tabIndex={TAB_INDEX.ENABLED}>{t('cart.empty_cart')}</p>
          </div>
        </div>
      )
    }

    const orderedByTime = sortingMethod === SORTING_METHODS.TIME

    const orderLinesGroups = orderedByTime
      ? groupOrderLinesByTime(cartPublished)
      : groupOrderLinesByCategory(cartPublished, products)

    return (
      <div ref={this.cartProductListRef} className="cart-product-list">
        {cartUnpublished && (
          <CartUnpublishedProductList
            unpublishedSectionRef={this.cartUnpublishedProductListRef}
            cart={cartUnpublished}
            products={products}
            warehouse={warehouse}
          />
        )}
        {orderLinesGroups.map(({ title, orderLines }, index) => (
          <Fragment key={index}>
            {!!title && (
              <h4
                className="subhead1-b cart-product-category__title"
                tabIndex={TAB_INDEX.ENABLED}
              >
                {title}
              </h4>
            )}
            {orderLines.map(({ id }) => (
              <CartProductCell
                key={id}
                product={products[id]}
                productCart={cartPublished.products[id]}
                warehouse={warehouse}
              />
            ))}
          </Fragment>
        ))}
      </div>
    )
  }
}

CartProductList.propTypes = {
  cartPublished: CartPropTypes.isRequired,
  cartUnpublished: CartPropTypes,
  products: ProductListPropTypes.isRequired,
  items: number.isRequired,
  sortingMethod: string,
  cartContentHeight: number.isRequired,
  isCartOpened: bool,
  warehouse: string.isRequired,
  t: func.isRequired,
}

CartProductList.defaultProps = {
  sortingMethod: SORTING_METHODS.TIME,
}

const ComposedCartProductList = compose(withTranslate)(CartProductList)

export { ComposedCartProductList as CartProductList }
