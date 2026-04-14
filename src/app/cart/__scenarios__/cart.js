import {
  productBase,
  productBaseDetailWithUnavailableMondayWednesday,
  productBaseWithUnavailableFromDate,
  productBaseWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate,
  productBaseWithUnavailableFromDateAndUnavailableWeekdaysDate,
  productWithAgeVerification,
  unpublishedProduct,
  unpublishedProductWithAgeVerification,
  waterProduct,
} from 'app/catalog/__scenarios__/product'

const cart = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product: productBase,
      quantity: 2,
      sources: [],
    },
  ],
  summary: {
    total: '1.7',
  },
  products_count: 1,
}

const cartWithSources = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product: productBase,
      quantity: 1,
      sources: ['+CT'],
    },
  ],
}

const cartWithDifferentQuantity = {
  ...cart,
  lines: [
    {
      product: productBase,
      quantity: 4,
      sources: [],
    },
  ],
  summary: {
    total: '3.4',
  },
}

const cartWithUnpublishedProduct = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product: unpublishedProduct,
      quantity: 1,
      sources: ['+CT'],
    },
  ],
}

const cartWithOneUnpublishedProduct = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product: unpublishedProduct,
      quantity: 1,
      sources: ['+CT'],
    },
    {
      product: waterProduct,
      quantity: 1,
      sources: ['+CT'],
    },
  ],
}

const emptyCart = {
  ...cart,
  lines: [],
  summary: {
    total: '0.00',
  },
}

const expensiveCart = {
  ...cart,
  lines: [
    {
      product: productBase,
      quantity: 200,
      sources: [],
    },
  ],
  summary: {
    total: '200',
  },
}

const expensiveCartRequest = {
  cart: {
    id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
    lines: [
      {
        quantity: 200,
        product_id: '8731',
        sources: [],
      },
    ],
  },
}

const cartWithOngoingOrder = {
  ...expensiveCart,
  open_order_id: 44051,
}

const mergedCart = {
  id: '57e2fd9e-d5ce-4f4e-964a-b629fe3c831e',
  lines: [
    {
      product: productBase,
      quantity: 200,
      sources: [],
    },
    {
      product: waterProduct,
      quantity: 1,
      sources: [],
    },
  ],
}

const mergedCartWithBlinkingProduct = {
  id: '57e2fd9e-d5ce-4f4e-964a-b629fe3c831e',
  lines: [
    {
      product: productBaseDetailWithUnavailableMondayWednesday,
      quantity: 1,
      sources: [],
    },
    {
      product: waterProduct,
      quantity: 2,
      sources: [],
    },
  ],
}

const mergedCartWithUnavailableFromBlinkingProduct = (date) => ({
  id: '57e2fd9e-d5ce-4f4e-964a-b629fe3c831e',
  lines: [
    {
      product: productBaseWithUnavailableFromDate(date),
      quantity: 1,
      sources: [],
    },
    {
      product: waterProduct,
      quantity: 2,
      sources: [],
    },
  ],
})

const mergedCartWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct = (
  unavailableFrom,
  unavailableWeekday,
) => ({
  id: '57e2fd9e-d5ce-4f4e-964a-b629fe3c831e',
  lines: [
    {
      product: productBaseWithUnavailableFromDateAndUnavailableWeekdaysDate(
        unavailableFrom,
        unavailableWeekday,
      ),
      quantity: 1,
      sources: [],
    },
    {
      product: waterProduct,
      quantity: 2,
      sources: [],
    },
  ],
})

const mergedCartWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct =
  (unavailableFrom, unavailableWeekdays) => ({
    id: '57e2fd9e-d5ce-4f4e-964a-b629fe3c831e',
    lines: [
      {
        product:
          productBaseWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate(
            unavailableFrom,
            unavailableWeekdays,
          ),
        quantity: 1,
        sources: [],
      },
      {
        product: waterProduct,
        quantity: 2,
        sources: [],
      },
    ],
  })

const mergedCartWithExceededProducts = {
  id: '57e2fd9e-d5ce-4f4e-964a-b629fe3c831e',
  lines: [
    {
      product: productBase,
      quantity: 1002,
      sources: [],
    },
    {
      product: waterProduct,
      quantity: 1,
      sources: [],
    },
  ],
}

const mergedCartRequest = {
  cart: {
    id: '57e2fd9e-d5ce-4f4e-964a-b629fe3c831e',
    lines: [
      {
        quantity: 200,
        product_id: productBase.id,
        sources: [],
      },
      {
        quantity: 1,
        product_id: waterProduct.id,
        sources: [],
      },
    ],
  },
}

const mergedCartWithExceededProductsRequest = {
  cart: {
    id: '57e2fd9e-d5ce-4f4e-964a-b629fe3c831e',
    lines: [
      {
        quantity: 1000,
        product_id: productBase.id,
        sources: [],
      },
      {
        quantity: 1,
        product_id: waterProduct.id,
        sources: [],
      },
    ],
  },
}

const ageVerificationCart = {
  ...cart,
  lines: [
    {
      product: productWithAgeVerification,
      quantity: 4,
      sources: [],
    },
  ],
}

const repeatOrderLines = [
  {
    product: productBase,
    quantity: 2,
    sources: ['+RO', '+RO'],
  },
  {
    product: waterProduct,
    quantity: 3,
    sources: ['+RO', '+RO', '+RO'],
  },
]

const repeatOrderLinesWith12Water = [
  {
    product: productBase,
    quantity: 50,
    sources: ['+RO', '+RO'],
  },
  {
    product: waterProduct,
    quantity: 12,
    sources: ['+RO', '+RO', '+RO'],
  },
]

const localCart = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product_id: '28757',
      quantity: 1,
      sources: ['+RO'],
    },
  ],
}

const localCartWithUnpublishedProduct = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product_id: '73420',
      quantity: 1,
      sources: ['+RO'],
    },
  ],
}

const validatedLocalCart = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product: { ...productBase, id: '28757' },
      quantity: 1,
      sources: ['+RO'],
    },
  ],
  summary: {
    total: '1.7',
  },
  products_count: 1,
}

const emptyLocalCart = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [],
}

const ageVerificationWithUnpublishedProductCart = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product: unpublishedProductWithAgeVerification,
      quantity: 1,
      sources: ['+CT'],
    },
    {
      product: waterProduct,
      quantity: 20,
      sources: [],
    },
  ],
}

export {
  cart,
  emptyCart,
  cartWithDifferentQuantity,
  cartWithOngoingOrder,
  cartWithUnpublishedProduct,
  cartWithOneUnpublishedProduct,
  expensiveCart,
  expensiveCartRequest,
  mergedCart,
  mergedCartWithExceededProducts,
  mergedCartWithExceededProductsRequest,
  mergedCartRequest,
  ageVerificationCart,
  cartWithSources,
  repeatOrderLines,
  repeatOrderLinesWith12Water,
  localCart,
  localCartWithUnpublishedProduct,
  validatedLocalCart,
  emptyLocalCart,
  mergedCartWithBlinkingProduct,
  ageVerificationWithUnpublishedProductCart,
  mergedCartWithUnavailableFromBlinkingProduct,
  mergedCartWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct,
  mergedCartWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct,
}
