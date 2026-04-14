import { snakeCaseToCamelCase } from '@mercadona/mo.library.dashtil'

import { serializeAddress } from 'app/address/serializer'
import { serializeSlot } from 'app/delivery-area/serializer'
import { serializePaymentMethod } from 'app/payment/serializer'

export function serializeOrders(orders) {
  if (!orders) {
    return
  }

  return {
    orders: orders.results.map(serializeOrder),
    nextPage: orders.next_page,
  }
}

export function serializeOrder(order) {
  if (!order) {
    return
  }

  return {
    ...snakeCaseToCamelCase(order),
    ...order,
    status: order.status_ui,
    address: serializeAddress(order.address),
    slot: order.slot ? serializeSlot(order.slot) : null,
    paymentMethod: serializePaymentMethod(order.payment_method),
    warehouse: order.warehouse_code,
  }
}

export function serializePreparedOrderLines(lines) {
  return {
    results: lines.results.map(serializePreparedOrderLine),
    nextPage: lines.next_page,
  }
}

function serializePreparedOrderLine(line) {
  return {
    product: line.product,
    orderedQuantity: line.ordered_quantity,
    preparedQuantity: line.prepared_quantity,
    preparationResult: line.preparation_result,
    originalPriceInstructions: line.original_price_instructions,
    totalPreparedPrice: line.total_prepared_price,
  }
}

export function serializeProductDetail(product) {
  const { share_url: shareUrl, ...rest } = product
  return {
    ...rest,
    shareUrl,
  }
}
