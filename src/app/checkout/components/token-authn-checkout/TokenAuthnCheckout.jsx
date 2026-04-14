import { bool, func } from 'prop-types'

import { BoxedLayout } from '@mercadona/mo.library.shop-ui/layouts'

import { CheckoutForm } from 'app/checkout/components/checkout-form'
import { CheckoutSummary } from 'app/checkout/components/checkout-summary'
import { useCheckoutContext } from 'app/checkout/contexts/CheckoutContext'
import { useTokenAuthn } from 'app/payment/contexts/TokenAuthn'
import { CHECKOUT_NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

import './TokenAuthnCheckout.css'

function TokenAuthnCheckout({
  canContinue,
  decrementEditMode,
  incrementEditMode,
}) {
  const { checkout } = useCheckoutContext()
  const { startTokenAuthnFlow } = useTokenAuthn()

  const content = (
    <CheckoutForm
      tokenAuthnFlow
      incrementEditMode={incrementEditMode}
      decrementEditMode={decrementEditMode}
      isValid={canContinue}
      checkout={checkout}
    />
  )

  const sidebar = (
    <CheckoutSummary
      tokenAuthnFlow
      checkout={checkout}
      confirm={startTokenAuthnFlow}
      buttonDisabled={!canContinue}
    />
  )

  const footer = <Footer />

  return (
    <BoxedLayout
      marginTop={`${CHECKOUT_NAVBAR_HEIGHT}px`}
      backgroundColor="var(--white-cream-light)"
    >
      {{ sidebar, content, footer }}
    </BoxedLayout>
  )
}

TokenAuthnCheckout.propTypes = {
  canContinue: bool.isRequired,
  decrementEditMode: func.isRequired,
  incrementEditMode: func.isRequired,
}

export { TokenAuthnCheckout }
