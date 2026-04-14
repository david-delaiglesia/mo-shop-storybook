import checkDefault from './assets/check-default.svg'
import checkSelected from './assets/check-selected.svg'
import classNames from 'classnames'

import { StatusWarningIcon } from '@mercadona/mo.library.icons'

import { PaymentMethodUtil } from 'app/payment/PaymentMethodUtil'
import {
  PaymentMethod,
  PaymentMethodExpirationStatus,
} from 'app/payment/interfaces'

import './PaymentMethodCell.css'

export interface PaymentMethodCellProps {
  paymentMethod: PaymentMethod
  isSelected?: boolean
  onSelect: () => void
}

export const PaymentMethodCell = ({
  paymentMethod,
  onSelect,
  isSelected,
}: PaymentMethodCellProps) => {
  const isExpired =
    paymentMethod.expirationStatus === PaymentMethodExpirationStatus.EXPIRED

  const handleClick = () => {
    if (!isExpired) {
      onSelect()
    }
  }

  return (
    <div
      role="radio"
      className={classNames(
        'payment-method-cell',
        `payment-method-cell--${paymentMethod.expirationStatus}`,
      )}
      onClick={handleClick}
      aria-disabled={isExpired}
      aria-checked={isSelected}
      aria-label={PaymentMethodUtil.getAriaLabel(paymentMethod)}
      tabIndex={isExpired ? -1 : 0}
    >
      <div className="payment-method-cell__content">
        <img
          className="payment-method-cell__icon"
          src={paymentMethod.uiContent.icon.url}
          aria-hidden
        />
        <span className="payment-method-cell__title body1-b">
          {paymentMethod.uiContent.title}
        </span>
        <span className="payment-method-cell__subtitle">
          {paymentMethod.uiContent.subtitle}
        </span>
      </div>

      {isExpired && <StatusWarningIcon size={24} />}

      {!isExpired && (
        <img src={isSelected ? checkSelected : checkDefault} aria-hidden />
      )}
    </div>
  )
}
