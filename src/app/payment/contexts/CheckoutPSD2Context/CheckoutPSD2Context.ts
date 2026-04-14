import { createContext } from 'react'

import { PaymentAuthentication } from 'app/payment/interfaces'

export const CheckoutPSD2Context = createContext<{
  getPsd2TokenAuthnCardParams: () => Promise<{
    paymentAuthentication: PaymentAuthentication
    okUrl: string
    koUrl: string
  }>
} | null>(null)
