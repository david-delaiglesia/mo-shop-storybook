import maestroInactiveImage from './assets/maestro-inactive.svg'
import maestroImage from './assets/maestro.svg'
import mastercardInactiveImage from './assets/mastercard-inactive.svg'
import mastercardImage from './assets/mastercard.svg'
import unknownImage from './assets/unknown.svg'
import visaInactiveImage from './assets/visa-inactive.svg'
import visaImage from './assets/visa.svg'

import { CreditCardType } from 'app/payment/interfaces'

import './PaymentMethodIcon.css'

interface PaymentMethodIconProps {
  creditCardType: CreditCardType
  isExpired?: boolean
}

const creditCardTypeIconMap: Record<
  CreditCardType,
  { active: string; inactive: string }
> = {
  [CreditCardType.UNKNOWN]: {
    active: unknownImage,
    inactive: unknownImage,
  },
  [CreditCardType.VISA]: {
    active: visaImage,
    inactive: visaInactiveImage,
  },
  [CreditCardType.MASTERCARD]: {
    active: mastercardImage,
    inactive: mastercardInactiveImage,
  },
  [CreditCardType.MAESTRO]: {
    active: maestroImage,
    inactive: maestroInactiveImage,
  },
}

export const PaymentMethodIcon = ({
  creditCardType,
  isExpired,
}: PaymentMethodIconProps) => {
  const icon =
    creditCardTypeIconMap[creditCardType] ||
    creditCardTypeIconMap[CreditCardType.UNKNOWN]

  return (
    <img
      className="payment-method-icon"
      src={isExpired ? icon.inactive : icon.active}
      aria-hidden
    />
  )
}
