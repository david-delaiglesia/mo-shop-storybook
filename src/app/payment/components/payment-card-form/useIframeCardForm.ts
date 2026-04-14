import { FunctionComponent, useEffect, useState } from 'react'

import {
  PaymentCardTpvIframe,
  type PaymentCardTpvIframeProps,
} from './components/payment-card-tpv-iframe'

import { PaymentProvider } from 'app/payment/interfaces'

const IFRAME_FORM: Record<
  PaymentProvider | 'mersys',
  {
    component: FunctionComponent<PaymentCardTpvIframeProps>
    height: number
  }
> = {
  [PaymentProvider.CECA]: { component: PaymentCardTpvIframe, height: 300 },
  [PaymentProvider.REDSYS]: { component: PaymentCardTpvIframe, height: 420 },
  // Mersys uses the same iframe as Redsys because is a staging mock provider
  mersys: { component: PaymentCardTpvIframe, height: 420 },
}

export const useIframeCardForm = (paymentProvider?: PaymentProvider) => {
  const [iframeForm, setIframeForm] = useState<{
    component: FunctionComponent<PaymentCardTpvIframeProps> | null
    height: number
  }>({ component: null, height: 0 })

  useEffect(() => {
    if (!paymentProvider) {
      setIframeForm({ component: null, height: 0 })
      return
    }

    setIframeForm(IFRAME_FORM[paymentProvider])
  }, [paymentProvider])

  return iframeForm
}
