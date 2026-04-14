import { CartService } from '../../cart'

describe('CartService', () => {
  const product = {
    id: '123',
    badges: { is_water: true },
    price_instructions: { unit_size: 1 },
  }

  const waterLimit = 100

  describe('canAddProduct method', () => {
    it('should return true if the cart has less water than the limit', () => {
      const products = { [product.id]: { ...product } }
      const cart = {
        id: '1234abcd',
        products: { [product.id]: { ...product, quantity: 1 } },
      }
      const increment = 12

      const canAddProduct = CartService.canAddProduct({
        cart,
        products,
        product,
        increment,
        waterLimit,
      })

      expect(canAddProduct).toBeTruthy()
    })

    it('should return false if the cart has more water than the limit', () => {
      const products = { [product.id]: { ...product } }
      const cart = { id: '1234abcd', products: {} }
      const increment = 1000

      const canAddProduct = CartService.canAddProduct({
        cart,
        products,
        product,
        increment,
        waterLimit,
      })

      expect(canAddProduct).toBeFalsy()
    })

    it('should return true if the product is not water', () => {
      const product = {
        id: '123',
        badges: { is_water: false },
        price_instructions: { unit_size: 1 },
      }
      const products = { [product.id]: { ...product } }
      const cart = {
        id: '1234abcd',
        products: { [product.id]: { ...product, quantity: 1 } },
      }
      const increment = 1000

      const canAddProduct = CartService.canAddProduct({
        cart,
        products,
        product,
        increment,
        waterLimit,
      })

      expect(canAddProduct).toBeTruthy()
    })
  })
})
