import { useEffect, useRef } from 'react'

import { PaymentAuthentication } from 'app/payment/interfaces'

export interface PaymentCardTpvIframeProps {
  paymentParams: PaymentAuthentication['params']
}

export const PaymentCardTpvIframe = ({
  paymentParams,
}: PaymentCardTpvIframeProps) => {
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    formRef.current?.submit()
  }, [paymentParams])

  const { URL_Base, ...restOfParams } = paymentParams

  return (
    <iframe
      title="payment-card-tpv-iframe"
      name="payment-card-tpv-iframe"
      className="payment-card-tpv-iframe"
    >
      <form
        ref={formRef}
        target="payment-card-tpv-iframe"
        name="form"
        action={URL_Base}
        method="POST"
      >
        {Object.entries(restOfParams).map(([paramName, paramValue]) => (
          <input
            key={paramName}
            type="hidden"
            name={paramName}
            value={paramValue}
          />
        ))}
      </form>
    </iframe>
  )
}
