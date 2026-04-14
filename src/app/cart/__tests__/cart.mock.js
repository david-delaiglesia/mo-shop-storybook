import {
  productBase,
  unpublishedWaterProductWith100Liters,
} from 'app/catalog/__scenarios__/product'

const productBulkBase = {
  ...productBase,
  price_instructions: {
    ...productBase.price_instructions,
    selling_method: 1,
  },
  id: '3317',
  display_name: 'Uva blanca con semillas',
  slug: 'uva_blanca_con_semillas',
  categories: [
    {
      id: 1,
      name: 'Fruta y verdura',
      level: 0,
      order: 304,
    },
  ],
}

const productPackBase = {
  ...productBase,
  id: '71502',
  display_name: 'Plataforma mopa grande abrillantadora Bosque Verde',
  slug: 'plataforma_mopa_grande_abrillantadora_bosque_verde',
  price_instructions: {
    ...productBase.price_instructions,
    is_pack: true,
  },
  categories: [
    {
      id: 26,
      name: 'Limpieza y hogar',
      level: 0,
      order: 372,
    },
  ],
}

const cart = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  products: [
    {
      id: '3317',
      quantity: 2,
      sources: [],
    },
    {
      id: '71502',
      quantity: 3,
      sources: [],
    },
  ],
}

const cartRequest = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product_id: '3317',
      quantity: 2,
      sources: [],
    },
    {
      product_id: '71502',
      quantity: 3,
      sources: [],
    },
  ],
}
const alcoholProduct = {
  ...productBase,
  id: '28757',
  display_name: 'Ron dominicano añejo Ron Barceló',
  slug: 'ron_dominicano_añejo_ron_barceló',
  published: true,
  price_instructions: {
    ...productBase.price_instructions,
    unit_size: 1,
    bulk_price: '10',
    unit_price: '10',
    size_format: 'kg',
    reference_price: '10',
    reference_format: 'ud',
  },
  categories: [
    {
      id: 19,
      name: 'Bodega',
      level: 0,
      order: 15,
    },
  ],
}

const cartApiResponse = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product: productBulkBase,
      quantity: 2,
      sources: [],
    },
    {
      product: productPackBase,
      quantity: 3,
      sources: [],
    },
  ],
  summary: {
    total: '64.9',
  },
  products_count: 5,
}

const cartWithMultipleProductsApiResponse = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product: productBulkBase,
      quantity: 2,
      sources: [],
    },
    {
      product: productPackBase,
      quantity: 3,
      sources: [],
    },
    {
      product: alcoholProduct,
      quantity: 3,
      sources: [],
    },
  ],
  summary: {
    total: '64.9',
  },
  products_count: 5,
}
const cartWithVersionApiResponse = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product: productBulkBase,
      quantity: 2,
      sources: [],
      version: 3,
    },
    {
      product: productPackBase,
      quantity: 3,
      sources: [],
      version: 3,
    },
  ],
  summary: {
    total: '64.9',
  },
  products_count: 5,
}

const cartWithMinQuantity = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product: productPackBase,
      quantity: 3,
      sources: [],
    },
    {
      product: productBulkBase,
      quantity: 20,
      sources: [],
    },
  ],
  summary: {
    total: '64.9',
  },
  products_count: 5,
}

const productBaseWithQuantityLimit = {
  ...productBase,
  id: '4428',
  limit: 1,
}

const cartApiWithQuantityLimitResponse = {
  id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
  lines: [
    {
      product: productBaseWithQuantityLimit,
      quantity: 1,
      sources: [],
    },
  ],
  summary: {
    total: '64.9',
  },
  products_count: 1,
}

const unPublishedProduct = {
  ...productBase,
  id: '28757',
  display_name: 'Ron dominicano añejo Ron Barceló',
  slug: 'ron_dominicano_añejo_ron_barceló',
  published: false,
  price_instructions: {
    ...productBase.price_instructions,
    unit_size: 1,
    bulk_price: '10',
    unit_price: '10',
    size_format: 'kg',
    reference_price: '10',
    reference_format: 'ud',
  },
}

const unPublishedProductPack = {
  ...productBase,
  id: '71556',
  display_name: 'Champú Be Radiant Deliplus cabello apagado',
  slug: '/champu-be-radiant-deliplus-cabello-apagado-con-aceite-camelia-bote',
  published: false,
  price_instructions: {
    ...productBase.price_instructions,
    is_pack: true,
  },
}

const cartApiResponseWithUnpublished = {
  id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
  lines: [
    {
      product: unPublishedProduct,
      quantity: 1,
      sources: [],
    },
    ...cartApiResponse.lines,
  ],
  summary: {
    total: '64.9',
  },
  products_count: 5,
}

const cartApiResponseWithUnpublishedAndMinimumPrice = {
  id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
  lines: [
    {
      product: unPublishedProduct,
      quantity: 5,
      sources: [],
    },
    ...cartApiResponse.lines,
  ],
  summary: {
    total: '64.9',
  },
  products_count: 5,
}

const cartApiResponseWithTwoUnpublished = {
  id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
  products: [
    {
      product: unPublishedProduct,
      quantity: 1,
      sources: [],
    },
    {
      product: unPublishedProductPack,
      quantity: 5,
      sources: [],
    },
    ...cartApiResponse.lines,
  ],
  summary: {
    total: '64.9',
  },
  products_count: 5,
}

const cartWithWaterUnpublished = {
  id: '5529dc8b-0a94-4ae0-8145-de51923542c6',
  lines: [
    {
      product: unpublishedWaterProductWith100Liters,
      quantity: 1,
      sources: [],
    },
  ],
}

const emptyCart = {
  id: '16859a27-a6fb-4528-b83b-7b0f8521522c',
  lines: [],
  summary: {
    total: '0.00',
  },
  products_count: 0,
}

export {
  cart,
  cartRequest,
  emptyCart,
  cartApiResponse,
  cartWithVersionApiResponse,
  cartWithMinQuantity,
  cartApiResponseWithUnpublished,
  cartApiResponseWithTwoUnpublished,
  unPublishedProduct,
  productBase,
  productBulkBase,
  cartWithWaterUnpublished,
  cartWithMultipleProductsApiResponse,
  cartApiResponseWithUnpublishedAndMinimumPrice,
  cartApiWithQuantityLimitResponse,
}
