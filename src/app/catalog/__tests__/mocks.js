const mockedProduct = {
  id: '3298',
  slug: 'papilla-platano-mandarina-pera',
  ean: '8480000032980',
  brand: 'Hacendado',
  limit: 1000,
  badges: {
    is_water: false,
    requires_age_check: false,
  },
  share_url:
    'https://sta.tech.mercadona.es/product/3298/papilla-platano-mandarina-pera',
  published: true,
  origin: null,
  photos: [
    {
      zoom: 'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_00_01.jpg?fit=crop&h=1600&w=1600',
      regular:
        'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_00_01.jpg?fit=crop&h=600&w=600',
      thumbnail:
        'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_00_01.jpg?fit=crop&h=206&w=206',
      perspective: 1,
    },
    {
      zoom: 'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_01_08.jpg?fit=crop&h=1600&w=1600',
      regular:
        'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_01_08.jpg?fit=crop&h=600&w=600',
      thumbnail:
        'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_01_08.jpg?fit=crop&h=206&w=206',
      perspective: 8,
    },
    {
      zoom: 'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_02_04.jpg?fit=crop&h=1600&w=1600',
      regular:
        'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_02_04.jpg?fit=crop&h=600&w=600',
      thumbnail:
        'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_02_04.jpg?fit=crop&h=206&w=206',
      perspective: 4,
    },
    {
      zoom: 'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_03_07.jpg?fit=crop&h=1600&w=1600',
      regular:
        'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_03_07.jpg?fit=crop&h=600&w=600',
      thumbnail:
        'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_03_07.jpg?fit=crop&h=206&w=206',
      perspective: 7,
    },
    {
      zoom: 'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_04_02.jpg?fit=crop&h=1600&w=1600',
      regular:
        'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_04_02.jpg?fit=crop&h=600&w=600',
      thumbnail:
        'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_04_02.jpg?fit=crop&h=206&w=206',
      perspective: 2,
    },
  ],
  details: {
    brand: 'Hacendado',
    origin: null,
    suppliers: [
      {
        name: 'Alimentación y Nutrición Familiar, S.L.U.',
      },
    ],
    legal_name: 'Alimento infantil. Puré de frutas.',
    description: 'Papilla plátano, mandarina y pera +4 meses Hacendado',
    counter_info: 'Contiene gluten. Contien sésamo.',
    danger_mentions: null,
    alcohol_by_volume: null,
    mandatory_mentions:
      'A partir de 4 meses. Envasado en atmósfera protectora.',
    production_variant: null,
    usage_instructions:
      'Abrir el tarrito, remover con una cuchara y consumir directamente. Boca ancha muy cómoda',
    storage_instructions:
      'Una vez abierto mantener en refrigeración y consumir en un máximo de 24 horas.',
  },
  packaging: 'Pack-4',
  thumbnail:
    'https://sta-mercadona.imgix.net/20190702/98/3298/vlc1/3298_00_01.jpg?fit=crop&h=206&w=206',
  categories: [
    {
      id: 24,
      name: 'Bebé',
      level: 0,
      categories: [
        {
          id: 216,
          name: 'Alimentación infantil',
          level: 1,
          categories: [
            {
              id: 693,
              name: 'Tarritos de fruta',
              level: 2,
            },
          ],
        },
      ],
    },
  ],
  extra_info: ['Modelo sujeto a disponibilidad.'],
  display_name: 'Papilla plátano, mandarina y pera',
  is_variable_weight: false,
  price_instructions: {
    iva: 10,
    is_new: false,
    is_pack: true,
    pack_size: 0.13,
    unit_name: 'tarritos',
    unit_size: 0.52,
    bulk_price: '3.56',
    unit_price: '1.85',
    approx_size: false,
    size_format: 'kg',
    total_units: 4,
    drained_weight: null,
    price_decreased: false,
    reference_price: '3.56',
    min_bunch_amount: 1.0,
    reference_format: 'kg',
    increment_bunch_amount: 1.0,
    selling_method: 0,
  },
  usage_instructions:
    'Abrir el tarrito, remover con una cuchara y consumir directamente. Boca ancha muy cómoda',
  storage_instructions:
    'Una vez abierto mantener en refrigeración y consumir en un máximo de 24 horas.',
  nutrition_information: {
    allergens: null,
    ingredients: `
      Pera 22%, zumo de mandarina 22%, manzana,
       plátano 16,5%, zanahoria, zumo de uva a partir de concentrado,
       almidón y vitamina C
      `,
  },
}

const mockedProductWithoutPhotos = {
  ...mockedProduct,
  photos: [],
}

const mockedBulkProduct = {
  ...mockedProduct,
  price_instructions: {
    ...mockedProduct.price_instructions,
    is_pack: false,
    min_bunch_amount: 0.2,
    increment_bunch_amount: 0.1,
    selling_method: 1,
  },
}

export { mockedProduct, mockedProductWithoutPhotos, mockedBulkProduct }
