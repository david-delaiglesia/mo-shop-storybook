import { ProductResponse, SellingMethod } from '../interfaces'

const productBase: ProductResponse = {
  id: '8731',
  slug: 'fideos-orientales-yakisoba-sabor-pollo-hacendado-paquete',
  limit: 1000,
  badges: {
    is_water: false,
    requires_age_check: false,
  },
  published: true,
  packaging: 'Paquete',
  thumbnail: 'fideos-orientales-yakisoba.jpg',
  display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
  categories: [
    {
      id: 13,
      name: 'Arroz, legumbres y pasta',
      level: 0,
      order: 10,
      categories: [
        {
          id: 120,
          name: 'Pasta y fideos',
          level: 1,
          order: 10,
        },
      ],
    },
  ],
  price_instructions: {
    iva: 10,
    is_new: false,
    is_pack: false,
    pack_size: null,
    unit_name: null,
    unit_size: 0.09,
    bulk_price: '9.44',
    unit_price: '0.85',
    approx_size: false,
    size_format: 'kg',
    total_units: null,
    drained_weight: null,
    price_decreased: false,
    reference_price: '9.44',
    min_bunch_amount: 1,
    reference_format: 'kg',
    increment_bunch_amount: 1,
    selling_method: 0,
  },
}

export const ProductMother = {
  /**
   * Product by default
   */
  yakisobaNoodles: (): ProductResponse => {
    return productBase
  },

  /**
   * Product with bunch price
   */
  bunchOfGrapes: (): ProductResponse => {
    return {
      ...productBase,
      id: '3317',
      display_name: 'Uva blanca con semillas',
      slug: 'uva-blanca-con-semillas',
      price_instructions: {
        ...productBase.price_instructions,
        is_pack: false,
        min_bunch_amount: 0.2,
        increment_bunch_amount: 0.1,
        selling_method: SellingMethod.BUNCH,
        bulk_price: '10.55',
      },
    }
  },
}
