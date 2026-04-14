import {
  productWithAgeVerification,
  productWithBulk,
  productWithPack,
} from 'app/catalog/__scenarios__/product'

const orderCart = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      id: 1,
      product: productWithBulk,
      quantity: 2,
      original_price_instructions: {
        ...productWithBulk.price_instructions,
        bulk_price: '10.55',
      },
      sources: [],
    },
    {
      id: 2,
      product: productWithPack,
      quantity: 3,
      original_price_instructions: {
        ...productWithPack.price_instructions,
      },
      sources: [],
    },
  ],
}
const orderCartWithOneProduct = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      id: 2,
      product: productWithPack,
      quantity: 1,
      original_price_instructions: {
        ...productWithPack.price_instructions,
      },
      sources: [],
    },
  ],
}

const orderCartWithValidPrice = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      id: 1,
      product: productWithBulk,
      quantity: 20,
      original_price_instructions: {
        ...productWithBulk.price_instructions,
        bulk_price: '10.55',
      },
      sources: [],
    },
    {
      id: 2,
      product: productWithPack,
      quantity: 3,
      original_price_instructions: {
        ...productWithPack.price_instructions,
      },
      sources: [],
    },
  ],
}

const orderCartDraft = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  origin: 'from_merge_cart',
  lines: [
    {
      id: 1,
      product: productWithBulk,
      quantity: 5,
      original_price_instructions: {
        ...productWithBulk.price_instructions,
        bulk_price: '10.55',
      },
      sources: [],
    },
    {
      id: 2,
      product: productWithPack,
      quantity: 3,
      original_price_instructions: {
        ...productWithPack.price_instructions,
      },
      sources: [],
    },
  ],
}

const orderCartWithAlcohol = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      id: 1,
      product: productWithAgeVerification,
      quantity: 30,
      original_price_instructions: {
        ...productWithAgeVerification.price_instructions,
      },
      sources: [],
    },
  ],
}

export {
  orderCart,
  orderCartWithValidPrice,
  orderCartDraft,
  orderCartWithOneProduct,
  orderCartWithAlcohol,
}
