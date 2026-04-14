import { Cart } from '../../cart'
import { MIN_PURCHASE } from '../constants'

import { productBase, productBulkBase } from 'app/cart/__tests__/cart.mock'

describe('Cart', () => {
  describe('validatePurchase method', () => {
    it('should return false if the cart is empty', () => {
      const isValid = Cart.validatePurchase()

      expect(isValid).toBeFalsy()
    })

    it('should return false if the total of the cart is less than the minimum purchase', () => {
      const cart = {
        id: '1234abcd',
        products: { 123: { total: MIN_PURCHASE - 1 } },
      }

      const isValid = Cart.validatePurchase(cart)

      expect(isValid).toBeFalsy()
    })

    it('should return true if the total of the cart is more than the minimum purchase', () => {
      const cart = {
        id: '1234abcd',
        products: { 123: { total: MIN_PURCHASE + 1 } },
      }

      const isValid = Cart.validatePurchase(cart)

      expect(isValid).toBeTruthy()
    })

    it('should return true if the total of the cart is equal than the minimum purchase', () => {
      const cart = {
        id: '1234abcd',
        products: { 123: { total: MIN_PURCHASE } },
      }

      const isValid = Cart.validatePurchase(cart)

      expect(isValid).toBeTruthy()
    })

    describe('getProdgetTotalUnitsuctsAmount method', () => {
      it('should return 0 if the cart is empty', () => {
        const total = Cart.getTotalUnits()

        expect(total).toEqual(0)
      })

      it('should return the products amount', () => {
        const cart = {
          id: '1234abcd',
          products: {
            [productBase.id]: { quantity: 5, product: productBase },
            [productBulkBase.id]: { quantity: 300, product: productBulkBase },
          },
        }

        const total = Cart.getTotalUnits(cart)

        expect(total).toEqual(6)
      })
    })
  })
})
