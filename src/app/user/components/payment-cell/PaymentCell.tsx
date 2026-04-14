import { Ref } from 'react'

import classNames from 'classnames'

import { PaymentMethod } from 'app/payment'
import { PaymentMethodUtil } from 'app/payment/PaymentMethodUtil'
import { ElementCell } from 'app/user/components/element-cell'
import { Card } from 'domain/card'
import { TAB_INDEX } from 'utils/constants'

import './PaymentCell.css'

interface PaymentCellProps {
  innerRef?: Ref<HTMLDivElement>
  paymentMethod: PaymentMethod
  onDelete: () => void
  onSetPermanent: () => void
}

export const PaymentCell = ({
  innerRef,
  paymentMethod,
  onDelete,
  onSetPermanent,
}: PaymentCellProps) => {
  return (
    <ElementCell
      onSetDefault={onSetPermanent}
      onDelete={onDelete}
      disabled={Card.isExpired(paymentMethod)}
      isDefault={paymentMethod.defaultCard}
    >
      <div
        ref={innerRef}
        className={classNames(
          'payment-cell__content',
          `payment-cell__content--${paymentMethod.expirationStatus}`,
        )}
        aria-label={PaymentMethodUtil.getAriaLabel(paymentMethod)}
        tabIndex={TAB_INDEX.ENABLED}
      >
        <img
          className="payment-cell__icon"
          src={paymentMethod.uiContent.icon.url}
          aria-hidden
        />
        <span className="payment-cell__title body1-b">
          {paymentMethod.uiContent.title}
        </span>
        <span className="payment-cell__subtitle">
          {paymentMethod.uiContent.subtitle}
        </span>
      </div>
    </ElementCell>
  )
}
