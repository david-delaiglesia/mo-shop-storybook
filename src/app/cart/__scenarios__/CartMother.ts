import { CartResponse } from '../interfaces'

import { ProductMother } from 'app/products/__scenarios__/ProductMother'

export const CartMother = {
  empty: (): CartResponse => {
    return {
      id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      lines: [],
    }
  },

  simple: (): CartResponse => {
    return {
      id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      lines: [
        {
          id: 1,
          product: ProductMother.yakisobaNoodles(),
          product_id: ProductMother.yakisobaNoodles().id,
          quantity: 5,
          original_price_instructions:
            ProductMother.yakisobaNoodles().price_instructions,
        },
        {
          id: 2,
          product: ProductMother.bunchOfGrapes(),
          product_id: ProductMother.bunchOfGrapes().id,
          quantity: 5,
          original_price_instructions:
            ProductMother.bunchOfGrapes().price_instructions,
        },
      ],
    }
  },
}
