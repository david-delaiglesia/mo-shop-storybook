import { Fragment, useState } from 'react'

import { func } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { getAriaLabelForApproximatePrice } from 'app/accessibility'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Tooltip from 'components/tooltip'
import { Cart, CartPropTypes, CartService } from 'domain/cart'
import { ProductListPropTypes } from 'domain/product'
import { Tracker } from 'services/tracker'
import { TAB_INDEX } from 'utils/constants'
import { getLocalePrize } from 'utils/maths'

const onHoverTooltip = () => {
  Tracker.sendInteraction('price_detail_click')
}

const CartCheckoutButtons = ({
  cart,
  products,
  beginPurchase,
  validateMergeCart,
  t,
}) => {
  const showAddToOngoingOrderButton = Cart.isOngoingOrder(cart)
  const cartWithPublishedProductsOnly =
    CartService.filterCartProductsByPublished(cart, products)
  const total = Cart.getTotal(cartWithPublishedProductsOnly)

  const priceInEUR = `${getLocalePrize(total)} €`

  const tooltipText = t('tooltip.price_message')

  const [timesShownTooltip, setTimesShownTooltip] = useState(0)
  const [tooltipTextAriaLive, setTooltipTextAriaLive] = useState()

  const showTooltip = (event) => {
    if (event.key === 'Enter') {
      const ariaLiveSwitch = timesShownTooltip % 2 === 0 ? '.' : ''

      setTimesShownTooltip(timesShownTooltip + 1)
      setTooltipTextAriaLive(`${tooltipText}${ariaLiveSwitch}`)

      onHoverTooltip()
    }
  }

  return (
    <div className="cart__checkout">
      <div aria-live="polite" className="sr-only">
        {tooltipTextAriaLive}
      </div>
      <div
        tabIndex={TAB_INDEX.ENABLED}
        className="cart__checkout__info"
        data-testid="cart__checkout__info"
        aria-label={getAriaLabelForApproximatePrice(priceInEUR)}
        onKeyDown={showTooltip}
      >
        <Tooltip
          data-testid="cart-approximate-total-tooltip"
          onMouseEnter={onHoverTooltip}
          text={tooltipText}
          tooltipPosition={'left'}
          aria-hidden="true"
        >
          <Icon icon="info" />
        </Tooltip>

        <p aria-hidden={true} className="body1-r">
          {t('cart.price')}
        </p>
        <span aria-hidden={true} className="title2-b">
          {priceInEUR}
        </span>
      </div>
      {!showAddToOngoingOrderButton && (
        <Button
          className="cart__start-checkout"
          variant="primary"
          fullWidth
          onClick={beginPurchase}
          data-testid="start-checkout"
        >
          {t('cart.start_checkout')}
        </Button>
      )}
      {showAddToOngoingOrderButton && (
        <Fragment>
          <Button
            className="cart__start-checkout"
            variant="primary"
            fullWidth
            handleLoading={true}
            loadingText={t('aria_loading')}
            onClick={validateMergeCart}
          >
            {t('add_to_ongoing_order_button')}
          </Button>
          <Button
            variant="quaternary"
            className="cart__start-checkout"
            fullWidth
            onClick={beginPurchase}
          >
            {t('create_new_order_button')}
          </Button>
        </Fragment>
      )}
    </div>
  )
}

CartCheckoutButtons.propTypes = {
  cart: CartPropTypes.isRequired,
  products: ProductListPropTypes.isRequired,
  beginPurchase: func.isRequired,
  validateMergeCart: func.isRequired,
  t: func.isRequired,
}

const TranslatedCartCheckoutButtons = withTranslate(CartCheckoutButtons)

export { TranslatedCartCheckoutButtons as CartCheckoutButtons }
