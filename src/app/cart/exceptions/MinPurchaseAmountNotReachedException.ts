import { CustomExceptionExtendable, RawException } from 'app/shared/exceptions'

interface ExtraFields {
  detail: string
}

type RawMinPurchaseAmountNotReachedException = RawException & ExtraFields

export const MinPurchaseAmountNotReachedException = {
  code: 'min_purchase_amount_in_cart_not_reached_error',

  isException(exception): exception is RawMinPurchaseAmountNotReachedException {
    return exception.code === this.code
  },

  toJSON(extraFields) {
    return { code: this.code, ...extraFields }
  },
} as const satisfies CustomExceptionExtendable<ExtraFields>
