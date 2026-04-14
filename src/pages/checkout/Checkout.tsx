import { useEffect, useState } from 'react'
import { useRouteMatch } from 'react-router'

import { BoxedLayout } from '@mercadona/mo.library.shop-ui/layouts'

import {
  CheckoutMetrics,
  CheckoutProvider,
  useCheckoutContext,
} from 'app/checkout'
import { CheckoutForm } from 'app/checkout/components/checkout-form'
import { CheckoutSummary } from 'app/checkout/components/checkout-summary'
import { TokenAuthnCheckout } from 'app/checkout/components/token-authn-checkout'
import {
  CheckoutPaymentsProvider,
  useCheckoutPaymentsContext,
} from 'app/checkout/contexts/CheckoutPaymentsContext'
import { CheckoutSlotResetProvider } from 'app/checkout/contexts/CheckoutSlotResetContext'
import {
  PaymentAuthFlow,
  PaymentAuthenticationFailedModal,
  PaymentMethodType,
  usePaymentAuthenticationCallbacks,
  usePaymentAuthenticationSuccessCallback,
} from 'app/payment'
import { PAYMENT_SEARCH_PARAMS } from 'app/payment/constants'
import { CheckoutPSD2Provider } from 'app/payment/contexts/CheckoutPSD2Context'
import { TokenAuthnProvider } from 'app/payment/contexts/TokenAuthn'
import { useAppDispatch } from 'app/redux'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { Card, CardService } from 'domain/card'
import { useSearchParam } from 'hooks/useSearchParam'
import { SystemAlert } from 'services/system-alert'
import { CHECKOUT_NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

const CheckoutDetail = () => {
  const dispatch = useAppDispatch()

  const { checkout } = useCheckoutContext<true>()
  const checkoutPayments = useCheckoutPaymentsContext()

  const [
    showPaymentAuthenticationFailedModal,
    setShowPaymentAuthenticationFailedModal,
  ] = useState(false)

  const [, setShowPaymentCardListParam] = useSearchParam(
    PAYMENT_SEARCH_PARAMS.SHOW_PAYMENT_CARD_LIST,
  )
  const [, setShowAddNewPaymentMethodModal] = useSearchParam(
    PAYMENT_SEARCH_PARAMS.SHOW_ADD_NEW_PAYMENT_METHOD_MODAL,
  )

  const [elementsInEditMode, setElementsInEditMode] = useState(0)

  usePaymentAuthenticationSuccessCallback({
    flow: PaymentAuthFlow.CHECKOUT_AUTO_CONFIRM,
    paymentMethodType: PaymentMethodType.BIZUM,
  })

  // Manage autoconfirm new payment method bizum flow
  // TODO: Move it to CheckoutPayments context
  usePaymentAuthenticationCallbacks({
    flow: PaymentAuthFlow.UPDATE_CHECKOUT_PAYMENT_METHOD,
    paymentMethodType: PaymentMethodType.BIZUM,
    onAuthSuccess: () => {
      checkoutPayments?.confirmCheckout()
    },
    onAuthFailure: () => {
      setShowPaymentAuthenticationFailedModal(true)
    },
  })

  usePaymentAuthenticationCallbacks({
    flow: PaymentAuthFlow.CHECKOUT_AUTO_CONFIRM,
    paymentMethodType: PaymentMethodType.CREDIT_CARD,
    onAuthSuccess: () => {
      checkoutPayments?.confirmCheckout()
    },
    onAuthFailure: () => {
      setShowPaymentAuthenticationFailedModal(true)
    },
  })

  usePaymentAuthenticationCallbacks({
    flow: PaymentAuthFlow.CHECKOUT_AUTO_CONFIRM,
    paymentMethodType: PaymentMethodType.BIZUM,
    onAuthSuccess: () => {
      checkoutPayments?.confirmCheckout()
    },
    onAuthFailure: () => {
      setShowPaymentAuthenticationFailedModal(true)
    },
  })

  useEffect(() => {
    dispatch(setHeaderType(LayoutHeaderType.CHECKOUT))
    SystemAlert.activate({
      onView: CheckoutMetrics.systemDismissCheckoutAlertView,
      onConfirm: CheckoutMetrics.systemDismissCheckoutAlertConfirmClick,
    })

    return () => {
      SystemAlert.deactivate()
    }
  }, [])

  useEffect(() => {
    if (checkout?.id) {
      CheckoutMetrics.summaryView(checkout)
      return
    }
  }, [checkout.id])

  const incrementEditMode = () => {
    setElementsInEditMode((current) => current + 1)
  }

  const decrementEditMode = () => {
    setElementsInEditMode((current) => current - 1)
  }

  const checkData = () => {
    const { address, slot, paymentMethod, phoneNationalNumber } = checkout

    if (!address || !slot || !phoneNationalNumber || !paymentMethod) {
      return true
    }

    return (
      Card.isExpired(paymentMethod) ||
      CardService.willBeExpiredOnSlotDelivery(paymentMethod, slot)
    )
  }

  const isInvalidCheckout = () => {
    const isEditing = elementsInEditMode > 0

    return isEditing || checkData()
  }

  const canContinueToAddPaymentMethod = () => {
    const isEditing = elementsInEditMode > 0
    const { address, slot, phoneNationalNumber } = checkout

    return !isEditing && !!address && !!slot && !!phoneNationalNumber
  }

  if (!checkout) {
    return null
  }

  if (!checkout.paymentMethod) {
    return (
      <>
        <TokenAuthnProvider
          onSuccess={checkoutPayments!.confirmCheckout}
          checkout={checkout}
          shouldAutoConfirm
        >
          <TokenAuthnCheckout
            canContinue={canContinueToAddPaymentMethod()}
            decrementEditMode={decrementEditMode}
            incrementEditMode={incrementEditMode}
          />
        </TokenAuthnProvider>

        {showPaymentAuthenticationFailedModal && (
          <PaymentAuthenticationFailedModal
            onClose={() => setShowPaymentAuthenticationFailedModal(false)}
            onRetry={() => {
              setShowPaymentAuthenticationFailedModal(false)
              setShowAddNewPaymentMethodModal('true')
            }}
          />
        )}
      </>
    )
  }

  return (
    <>
      <BoxedLayout
        marginTop={`${CHECKOUT_NAVBAR_HEIGHT}px`}
        backgroundColor="var(--white-cream-light)"
      >
        {{
          sidebar: (
            <CheckoutSummary
              confirm={checkoutPayments!.confirmCheckout}
              buttonDisabled={isInvalidCheckout()}
              isConfirmOrderLoading={checkoutPayments?.isConfirming}
            />
          ),
          content: (
            <CheckoutForm
              incrementEditMode={incrementEditMode}
              decrementEditMode={decrementEditMode}
              isValid={!isInvalidCheckout()}
              checkout={checkout}
            />
          ),
          footer: <Footer />,
        }}
      </BoxedLayout>

      {showPaymentAuthenticationFailedModal && (
        <PaymentAuthenticationFailedModal
          onClose={() => setShowPaymentAuthenticationFailedModal(false)}
          onRetry={() => {
            setShowPaymentAuthenticationFailedModal(false)
            setShowPaymentCardListParam('true')
          }}
        />
      )}
    </>
  )
}

export const CheckoutPage = () => {
  const { params } = useRouteMatch<{ id: string }>()

  return (
    <CheckoutProvider checkoutId={Number(params.id)}>
      <CheckoutPSD2Provider>
        <CheckoutSlotResetProvider>
          <CheckoutPaymentsProvider>
            <CheckoutDetail />
          </CheckoutPaymentsProvider>
        </CheckoutSlotResetProvider>
      </CheckoutPSD2Provider>
    </CheckoutProvider>
  )
}
