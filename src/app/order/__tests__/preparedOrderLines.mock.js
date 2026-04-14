const product = {
  id: '245',
  display_name: 'Aceite de oliva suave botella 1 l',
  thumbnail:
    'https://storage.googleapis.com/itg_statics_mimercadona/media/product_images/40/4240/4240.jpg',
  badges: {
    refrigerated: false,
    frozen: false,
    sugar_free: false,
    watermilk: false,
    gluten_free: false,
    lactose_free: false,
    is_water: false,
  },
  price_instructions: {
    unit_size: 1.0,
    bulk_price: '4.15',
    min_bulk_amount: 0.5,
    size_aprox: false,
    weight_drained: false,
    increment_bulk_amount: 0.25,
    unit_price: '4.15',
    bulk_measure: 'l',
    selling_method: 0,
  },
}

export const mockedCompleteOrderLine = [
  {
    product: {
      ...product,
      id: '245',
    },
    quantity: 2,
    ordered_quantity: 5,
    prepared_quantity: 5,
    preparation_result: 'complete',
  },
]

export const mockedNotAvailableOrderLine = [
  {
    product: {
      ...product,
      id: '246',
    },
    quantity: 2,
    ordered_quantity: 5,
    prepared_quantity: 0,
    preparation_result: 'not_available',
  },
]

export const mockedIncompleteOrderLine = [
  {
    product: {
      ...product,
      id: '247',
    },
    quantity: 2,
    ordered_quantity: 5,
    prepared_quantity: 3,
    preparation_result: 'incomplete',
  },
]

export const mockedPendingOrderLine = [
  {
    product: {
      ...product,
      id: '248',
    },
    quantity: 2,
    ordered_quantity: 5,
    prepared_quantity: null,
    preparation_result: 'pending',
  },
]

export const manyOrderLines = [
  ...mockedNotAvailableOrderLine,
  ...mockedIncompleteOrderLine,
  ...mockedCompleteOrderLine,
]
