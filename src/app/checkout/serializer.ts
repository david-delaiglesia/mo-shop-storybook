import { Checkout, CheckoutResponse } from './interfaces'

import { snakeCaseToCamelCase } from '@mercadona/mo.library.dashtil'

import { serializeAddress } from 'app/address/serializer'
import { serializeCart } from 'app/cart/serializer'
import { serializeSlot } from 'app/delivery-area/serializer'

export function serializeCheckout(
  checkout: CheckoutResponse | undefined,
): Checkout | undefined {
  if (!checkout) return

  return {
    ...snakeCaseToCamelCase<
      Omit<Checkout, 'address' | 'cart' | 'slot' | 'summary'>
    >(checkout),
    address: serializeAddress(checkout.address),
    cart: serializeCart(checkout.cart),
    slot: checkout.slot ? serializeSlot(checkout.slot) : null,
    summary: checkout.summary,
  }
}
