import { Product } from '../../product'

describe('Product', () => {
  const product = {
    price_instructions: {
      unit_price: '3.25',
      bulk_price: '2.00',
      min_bunch_amount: 0.1,
    },
    badges: {
      is_water: false,
    },
  }

  describe('isPack method', () => {
    it('should return true if the product is pack', () => {
      const product = { price_instructions: { is_pack: true } }

      expect(Product.isPack(product)).toBeTruthy()
    })

    it('should return false if the product is not pack', () => {
      const product = { price_instructions: { is_pack: false } }

      expect(Product.isPack(product)).toBeFalsy()
    })
  })

  describe('isBulk method', () => {
    it('should return false if the product is not bulk', () => {
      product.price_instructions.selling_method = 0

      const isBulk = Product.isBulk(product)

      expect(isBulk).toBeFalsy()
    })

    it('should return true if the product is bulk', () => {
      product.price_instructions.selling_method = 1

      const isBulk = Product.isBulk(product)

      expect(isBulk).toBeTruthy()
    })
  })

  describe('getPrice method', () => {
    it('should return the unit price if the product is not bulk', () => {
      product.price_instructions.selling_method = 0

      const price = Product.getPrice(product)
      const expectedPrice = '3,25'

      expect(price).toEqual(expectedPrice)
    })

    it('should return the bunch price if the product is bulk', () => {
      product.price_instructions.selling_method = 1

      const price = Product.getPrice(product)
      const expectedPrice = '0,20'

      expect(price).toEqual(expectedPrice)
    })
  })

  describe('getSize method', () => {
    it('should return the unit size of the product', () => {
      const unitSize = 0.45
      product.price_instructions = {
        ...product.price_instructions,
        unit_size: unitSize,
      }

      const size = Product.getSize(product)

      expect(size).toEqual(unitSize)
    })
  })

  describe('isWater method', () => {
    it('should return true if the product is water', () => {
      product.badges.is_water = true

      const isWater = Product.isWater(product)

      expect(isWater).toBeTruthy()
    })

    it('should return false if the product is not water', () => {
      product.badges.is_water = false

      const isWater = Product.isWater(product)

      expect(isWater).toBeFalsy()
    })
  })
})
