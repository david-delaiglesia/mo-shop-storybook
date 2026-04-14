import { snakeCaseToCamelCase } from '@mercadona/mo.library.dashtil'

function serializePaymentMethod(paymentMethod) {
  if (!paymentMethod) return

  return snakeCaseToCamelCase(paymentMethod)
}

function serializePaymentMethods(response) {
  return response.results.map(serializePaymentMethod)
}

export { serializePaymentMethod, serializePaymentMethods }
