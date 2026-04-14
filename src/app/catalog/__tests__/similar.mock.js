import { waterProductWith100Liters } from 'app/catalog/__scenarios__/product'

export const similarNoResults = {
  next_page: 0,
  results: [],
}

export const similarResults = {
  next_page: null,
  results: [
    {
      id: '28745',
      slug: 'ron-dominicano-anejo-superior-brugal-botella',
      limit: 1000,
      badges: {
        is_water: false,
        requires_age_check: true,
      },
      packaging: 'Botella',
      published: true,
      share_url:
        'https://sta.tech.mercadona.es/product/28745/ron-dominicano-anejo-superior-brugal-botella',
      thumbnail:
        'https://sta-mercadona.imgix.net/20200128/45/28745/vlc1/28745_00_02.jpg?fit=crop&h=300&w=300',
      categories: [
        {
          id: 19,
          name: 'Bodega',
          level: 0,
          order: 15,
          categories: [
            {
              id: 19,
              name: 'Licores',
              level: 0,
              order: 15,
            },
          ],
        },
      ],
      display_name: 'Ron dominicano añejo superior Brugal',
      price_instructions: {
        iva: 21,
        is_new: false,
        is_pack: false,
        pack_size: null,
        unit_name: null,
        unit_size: 0.7,
        bulk_price: '19.50',
        unit_price: '13.65',
        approx_size: false,
        size_format: 'l',
        total_units: null,
        unit_selector: true,
        bunch_selector: false,
        drained_weight: null,
        selling_method: 0,
        price_decreased: false,
        reference_price: '19.50',
        min_bunch_amount: 1.0,
        reference_format: 'L',
        increment_bunch_amount: 1.0,
      },
    },
    {
      id: '28856',
      slug: 'ron-anejo-almirante-botella',
      limit: 1,
      badges: {
        is_water: false,
        requires_age_check: true,
      },
      packaging: 'Botella',
      published: true,
      share_url:
        'https://sta.tech.mercadona.es/product/28856/ron-anejo-almirante-botella',
      thumbnail:
        'https://sta-mercadona.imgix.net/20200128/56/28856/vlc1/28856_00_02.jpg?fit=crop&h=300&w=300',
      categories: [
        {
          id: 19,
          name: 'Bodega',
          level: 0,
          order: 15,
        },
      ],
      display_name: 'Ron añejo Almirante',
      price_instructions: {
        iva: 21,
        is_new: false,
        is_pack: false,
        pack_size: null,
        unit_name: null,
        unit_size: 1.0,
        bulk_price: '7.40',
        unit_price: '7.40',
        approx_size: false,
        size_format: 'l',
        total_units: null,
        unit_selector: true,
        bunch_selector: false,
        drained_weight: null,
        selling_method: 0,
        price_decreased: false,
        reference_price: '7.40',
        min_bunch_amount: 1.0,
        reference_format: 'L',
        increment_bunch_amount: 1.0,
      },
    },
    waterProductWith100Liters,
  ],
}

export const cartSubstituted = {
  id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
  lines: [
    {
      quantity: 1,
      product_id: '28745',
      sources: ['+SC', '+SC', '-SC'],
    },
    {
      quantity: 2,
      product_id: '3317',
      sources: [],
    },
    {
      quantity: 3,
      product_id: '71502',
      sources: [],
    },
  ],
}
