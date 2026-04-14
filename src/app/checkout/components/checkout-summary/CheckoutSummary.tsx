import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FreeDelivery } from '../../../free-delivery'

import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Card } from '@mercadona/mo.library.shop-ui/card'
import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { useUserUUID } from 'app/authentication'
import { CheckoutUtils } from 'app/checkout/CheckoutUtils'
import { useCheckoutContext } from 'app/checkout/contexts/CheckoutContext'
import { CheckoutMetrics } from 'app/checkout/metrics'
import { Order } from 'app/order'
import { OrderClient } from 'app/order/client'
import { sendPriceDetailClickMetrics } from 'app/order/metrics'
import { useAppDispatch } from 'app/redux'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import { SummaryTaxes } from 'app/taxes-summary'
import { TermsAndConditions } from 'components/terms-and-conditions'
import Tooltip from 'components/tooltip'
import { OrderService, Order as OrderUtils } from 'domain/order'
import { useId } from 'hooks/useId'
import productLimitImage from 'system-ui/assets/img/default-alert@2x.png'
import { TAB_INDEX } from 'utils/constants'
import { getLocalePrize } from 'utils/maths'
import { clearPendingAction } from 'wrappers/feedback/actions'

import './CheckoutSummary.css'

interface CheckoutSummaryProps {
  buttonDisabled: boolean
  confirm: () => void
  isConfirmOrderLoading?: boolean
  tokenAuthnFlow?: boolean
}

export const CheckoutSummary = ({
  buttonDisabled,
  confirm,
  isConfirmOrderLoading = false,
  tokenAuthnFlow = false,
}: CheckoutSummaryProps) => {
  const id = useId()
  const uuid = useUserUUID()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const [
    hasAnyOrderWithSameAddressAndDay,
    setHasAnyOrderWithSameAddressAndDay,
  ] = useState(false)
  const { checkout } = useCheckoutContext<true>()
  const [confirmedOrders, setConfirmedOrders] = useState<Order[]>([])

  useEffect(() => {
    checkOrdersWithSameAddressAndDay()
  }, [])

  useEffect(() => {
    setHasAnyOrderWithSameAddressAndDay(
      OrderService.hasAnyOrderWithSameAddressAndDay(
        confirmedOrders,
        checkout.slot,
        checkout.address,
      ),
    )
  }, [checkout.address?.id, checkout.slot?.id])

  const showDuplicatedOrderAlert = () => {
    const cancelOrder = () => {
      dispatch(hideAlert())
      CheckoutMetrics.duplicatedOrdersClick('cancel')
      dispatch(clearPendingAction())
    }
    const confirmOrder = () => {
      dispatch(hideAlert())
      CheckoutMetrics.duplicatedOrdersClick('continue')
      confirm()
    }

    dispatch(
      showAlert({
        title: 'duplicated_order_alert_title',
        description: 'duplicated_order_alert_body',
        imageSrc: productLimitImage,
        confirmButtonText: 'button.cancel',
        confirmButtonAction: cancelOrder,
        secondaryActionText: 'duplicated_order_alert_confirm_button',
        secondaryAction: confirmOrder,
      }),
    )
  }

  const onCheckoutClick = () => {
    CheckoutMetrics.finishCheckoutClick(checkout!)

    if (hasAnyOrderWithSameAddressAndDay) {
      showDuplicatedOrderAlert()
      CheckoutMetrics.duplicatedOrdersAlertView()
      return
    }

    return confirm()
  }

  const checkOrdersWithSameAddressAndDay = async () => {
    const response = await OrderClient.getConfirmedOrders(uuid)
    if (!response) return

    const { slot, address } = checkout

    setConfirmedOrders(response.orders)
    setHasAnyOrderWithSameAddressAndDay(
      OrderService.hasAnyOrderWithSameAddressAndDay(
        response.orders,
        slot,
        address,
      ),
    )
  }

  const hasEstimatedPrice = OrderUtils.hasEstimatedPrice(checkout)
  const hasDelivery = CheckoutUtils.hasDelivery(checkout)
  const slotBonus = CheckoutUtils.slotBonus(checkout)

  return (
    <div className="checkout-summary">
      <Card aria-labelledby={`${id}-title`} as="section">
        <h2 id={`${id}-title`} className="title2-b checkout-summary__title">
          {t('checkout.title')}
        </h2>
        <div className="checkout-summary__subtotals">
          <div
            className="checkout-summary__subtotals-products subhead1-r"
            tabIndex={TAB_INDEX.ENABLED}
          >
            <p>{t('commons.order.summary.products_price')}</p>
            <p>{getLocalePrize(checkout.summary.products)} €</p>
          </div>
          {(hasDelivery || slotBonus) && (
            <Fragment>
              <div
                className="checkout-summary__subtotals-delivery subhead1-r"
                tabIndex={TAB_INDEX.ENABLED}
              >
                <p>{t('commons.order.summary.delivery')}</p>
                <FreeDelivery
                  slotBonus={slotBonus}
                  delivery={checkout.summary.slot}
                />
              </div>
              {slotBonus && (
                <p className="checkout-summary__subtotals-subtitle caption2-sb">
                  {t('summary_discount_subtitle')}
                </p>
              )}
            </Fragment>
          )}
        </div>
        <span className="checkout-summary__total" tabIndex={TAB_INDEX.ENABLED}>
          <span>
            <p className="body1-b">{t('commons.order.summary.price_aprox')}</p>
            {hasEstimatedPrice && (
              <span className="checkout-summary__total-tooltip">
                <Tooltip
                  text={t('tooltip.price_message')}
                  tooltipPosition="left"
                  onMouseEnter={sendPriceDetailClickMetrics}
                >
                  <span className="checkout-summary__total-tooltip-icon">
                    <Icon
                      icon="info"
                      aria-hidden="true"
                      data-testid="estimated-cost-tooltip"
                      color="cucumber"
                    />
                  </span>
                </Tooltip>
              </span>
            )}
          </span>
          <p className="checkout-summary__total-price body1-b">
            {getLocalePrize(checkout.summary.total)} €
          </p>
        </span>
        <div className="checkout-summary__taxes">
          <SummaryTaxes summary={checkout.summary} />
        </div>
        <Button
          disabled={buttonDisabled}
          fullWidth
          loading={!tokenAuthnFlow && isConfirmOrderLoading}
          loadingText={t('aria_loading')}
          onClick={onCheckoutClick}
          size="big"
        >
          <span className="headline1-b">
            {tokenAuthnFlow
              ? t('token_authn_step_one_continue_button')
              : t('checkout.action')}
          </span>
        </Button>
        <div className="checkout-summary__terms-and-conditions">
          <TermsAndConditions flow="checkout" />
        </div>
      </Card>
    </div>
  )
}
