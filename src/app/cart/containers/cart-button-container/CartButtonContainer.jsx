import { useDispatch, useSelector } from 'react-redux'

import {
  CartButton,
  CartButtonWithPopOver,
} from 'app/cart/components/cart-button'
import {
  disableHighlightCart,
  toggleCart,
} from 'app/cart/containers/cart-button-container/actions'
import { getCart } from 'app/cart/selectors'
import { toggleOverlay } from 'containers/overlay-container/actions'
import { CartService } from 'domain/cart'

const getCartButtonComponent = (isCartHighlighted, isCartOpened) => {
  if (isCartHighlighted && !isCartOpened) {
    return CartButtonWithPopOver
  }

  return CartButton
}

const CartButtonContainer = () => {
  const cart = useSelector(getCart)
  const { products, cartUI } = useSelector(({ products, ui: { cartUI } }) => ({
    products,
    cartUI,
  }))
  const dispatch = useDispatch()

  const openCart = () => {
    dispatch(toggleOverlay())
    dispatch(toggleCart())
    dispatch(disableHighlightCart())
  }

  const isCartOpened = cartUI.opened
  const isCartHighlighted = cartUI.highlight

  const CartButtonComponent = getCartButtonComponent(
    isCartHighlighted,
    isCartOpened,
  )

  const cartWithPublishedProductsOnly =
    CartService.filterCartProductsByPublished(cart, products)

  return (
    <CartButtonComponent
      cart={cartWithPublishedProductsOnly}
      isCartOpened={isCartOpened}
      onClick={openCart}
    />
  )
}

export { CartButtonContainer }
