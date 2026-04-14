import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'

import { bool, func, number, object } from 'prop-types'

import { useAccessibilityFeedback } from 'app/accessibility'
import { CartClient } from 'app/cart/client'
import { CartProductList } from 'app/cart/components/cart-product-list'
import { SortCartProductDropdown } from 'app/cart/components/sort-cart-product-dropdown'
import { SORTING_METHODS } from 'app/cart/constants'
import { sendCartSortingMethodClickMetrics } from 'app/cart/metrics'
import { OrderClient } from 'app/order/client'
import { EditOrderProductsSummary } from 'app/order/components/edit-order-products-summary'
import { useOrder } from 'app/order/context'
import {
  sendRemoveAllProductsCancelOrderModalCloseMetrics,
  sendRemoveAllProductsCancelOrderModalMetrics,
  sendSavePurchaseProductsMetrics,
} from 'app/order/metrics'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import Button, { ButtonWithFeedback } from 'components/button'
import { Cart } from 'domain/cart'
import { TAB_INDEX, constants } from 'utils/constants'

import './EditOrderCart.css'

const CART_OFFSET = 338

const EditOrderCart = ({
  cancelEdition,
  buttonAction,
  cart,
  products,
  requiresAgeCheck,
  minPurchaseAlert,
  items,
}) => {
  const [sortingMethod, setSortingMethod] = useState(SORTING_METHODS.TIME)
  const [isDisabled, setIsDisabled] = useState(true)

  const { setFeedbackText } = useAccessibilityFeedback()

  useEffect(() => {
    const areProductsLoaded =
      cart.products && Object.keys(cart.products).length > 0
    if (areProductsLoaded) {
      setIsDisabled(false)
    }
  }, [cart.products])
  const order = useOrder()
  const { uuid } = useSelector((state) => state.session)
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const history = useHistory()

  const updateSortingMethod = (method) => {
    setSortingMethod(method)
    sendCartSortingMethodClickMetrics(cart, method)
  }

  const beginEdit = () => {
    sendSavePurchaseProductsMetrics({
      orderId: order.id,
      cartId: cart.id,
      price: Cart.getTotal(cart),
    })

    if (Cart.isFromMergeCartOrigin(cart)) {
      CartClient.updateCart(uuid, { id: cart.id, products: [] })
    }

    if (Cart.isEmpty(cart)) {
      sendRemoveAllProductsCancelOrderModalMetrics(order.id)
      handleCancelOrderModal()
      return
    }

    buttonAction()
  }

  const handleCancelOrderModal = () => {
    dispatch(
      showAlert({
        mood: 'destructive',
        title: t('remove_products_cancel_order_modal_title'),
        description: t('remove_products_cancel_order_modal_description'),
        confirmButtonText: t(
          'remove_products_cancel_order_modal_confirm_button',
        ),
        secondaryActionText: t(
          'remove_products_cancel_order_modal_cancel_button',
        ),
        confirmButtonAction: () => handleConfirmCancelOrder(),
        secondaryAction: () => handleSecondaryCancelOrder(),
      }),
    )
  }

  const handleConfirmCancelOrder = async () => {
    dispatch(hideAlert())
    sendRemoveAllProductsCancelOrderModalCloseMetrics(order.id, 'cancel_order')
    const cancelledOrder = await OrderClient.cancel(uuid, order.id)
    if (!cancelledOrder) {
      return
    }
    setFeedbackText(t('accessibility.order_cancelled'))
    history.push(`/user-area/orders/${order.id}`)
  }

  const handleSecondaryCancelOrder = () => {
    sendRemoveAllProductsCancelOrderModalCloseMetrics(order.id, 'back')
    dispatch(hideAlert())
  }
  const focusOnSearchInput = (event) => {
    const isShiftTabPressed = event.shiftKey && event.key === 'Tab'

    if (isShiftTabPressed) {
      event.preventDefault()

      const searchInputRef = document.getElementById('search')
      searchInputRef?.focus()
    }
  }

  return (
    <div
      role="complementary"
      aria-labelledby="edit-order-title"
      className="edit-order-products__cart"
    >
      <p
        tabIndex={TAB_INDEX.ENABLED}
        id="edit-order-title"
        className="headline1-b edit-order-products__cart-message"
        onKeyDown={focusOnSearchInput}
      >
        {t('user_area.edit_order.title')}
      </p>
      <SortCartProductDropdown
        className="edit-order-products__sorting-method"
        onChange={updateSortingMethod}
      />
      <CartProductList
        cartPublished={cart}
        products={products}
        items={items}
        minPurchase={constants.MIN_PURCHASE}
        cartContentHeight={CART_OFFSET}
        sortingMethod={sortingMethod}
        warehouse={order.warehouse}
      />
      <EditOrderProductsSummary />
      <div className="edit-order-products__actions">
        <Button
          text={t('button.cancel')}
          type="secondary"
          onClick={cancelEdition}
        />
        {requiresAgeCheck || minPurchaseAlert ? (
          <Button
            text={t('edit_purchase_confirm_button')}
            onClick={beginEdit}
            disabled={isDisabled}
          />
        ) : (
          <ButtonWithFeedback
            text={t('edit_purchase_confirm_button')}
            onClick={beginEdit}
            disabled={isDisabled}
          />
        )}
      </div>
    </div>
  )
}

EditOrderCart.propTypes = {
  cancelEdition: func,
  buttonAction: func,
  cart: object.isRequired,
  products: object.isRequired,
  requiresAgeCheck: bool.isRequired,
  minPurchaseAlert: bool.isRequired,
  items: number.isRequired,
}

export { EditOrderCart }
