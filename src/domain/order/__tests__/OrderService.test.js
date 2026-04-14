import { OrderService } from '../OrderService'

describe('OrderService', () => {
  const order = [
    { quantity: 1, product: { id: '1234' } },
    { quantity: 1, product: { id: '1234' } },
    { quantity: 1, product: { id: '6549' } },
  ]

  describe('mergeOrderLinesWithSameProduct method', () => {
    it('should merge order lines if have the same product', () => {
      const orderLines = OrderService.mergeOrderLinesWithSameProduct(order)

      const expectedOrderLines = [
        { quantity: 2, product: { id: '1234' } },
        { quantity: 1, product: { id: '6549' } },
      ]
      expect(orderLines).toEqual(expectedOrderLines)
    })
  })
})
