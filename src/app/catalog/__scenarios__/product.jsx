const productBase = {
  id: '8731',
  slug: 'fideos-orientales-yakisoba-sabor-pollo-hacendado-paquete',
  limit: 1000,
  badges: {
    is_water: false,
    requires_age_check: false,
  },
  published: true,
  packaging: 'Paquete',
  thumbnail:
    'https://sta-mercadona.imgix.net/20190828/31/8731/vlc1/8731_00_02.jpg?fit=crop&h=206&w=206',
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

const englishProductBase = {
  ...productBase,
  display_name: 'Hacendado Instant cup noodles Yakisoba chicken flavour',
}

const productBaseDetail = {
  ...productBase,
  details: {
    brand: 'Hacendado',
    origin: null,
    suppliers: [
      {
        name: 'Nissin Foods GmbH',
      },
    ],
    legal_name:
      'Preparado alimenticio instantáneo de fideos de trigo con salsa Yakisoba con sabor a pollo.',
    description: 'Descripción Fideos orientales Yakisoba sabor pollo',
    counter_info: null,
    danger_mentions: null,
    alcohol_by_volume: null,
    mandatory_mentions:
      'Este envase contiene 1 porción de 150 g de producto preparado.',
    production_variant: null,
    usage_instructions:
      '1. Retire las dos tapas y el sobre. Llene el vaso con agua hirviendo hasta la línea interior.',
    storage_instructions: 'Mantener alejado de la humedad y de la luz',
  },
  photos: [
    {
      zoom: 'fideos-orientales-first-image.jpg?fit=crop&h=1600&w=1600',
      regular: 'fideos-orientales-first-image.jpg?fit=crop&h=600&w=600',
      thumbnail: 'fideos-orientales-first-image.jpg?fit=crop&h=300&w=300',
      perspective: 2,
    },
    {
      zoom: 'fideos-orientales-second-image.jpg?fit=crop&h=1600&w=1600',
      regular: 'fideos-orientales-second-image.jpg?fit=crop&h=600&w=600',
      thumbnail: 'fideos-orientales-second-image.jpg?fit=crop&h=300&w=300',
      perspective: 10,
    },
  ],
  share_url:
    'https://sta.tech.mercadona.es/product/8731/fideos-orientales-yakisoba-sabor-pollo-hacendado-paquete',
}

const productBaseDetailWithNutritionInformation = {
  ...productBase,
  details: {
    brand: 'Hacendado',
    origin: null,
    suppliers: [
      {
        name: 'Nissin Foods GmbH',
      },
    ],
    legal_name:
      'Preparado alimenticio instantáneo de fideos de trigo con salsa Yakisoba con sabor a pollo.',
    description: 'Descripción Fideos orientales Yakisoba sabor pollo',
    counter_info: null,
    danger_mentions: null,
    alcohol_by_volume: null,
    mandatory_mentions:
      'Este envase contiene 1 porción de 150 g de producto preparado.',
    production_variant: null,
    usage_instructions:
      '1. Retire las dos tapas y el sobre. Llene el vaso con agua hirviendo hasta la línea interior.',
    storage_instructions: 'Mantener alejado de la humedad y de la luz',
  },
  photos: [
    {
      zoom: 'fideos-orientales-first-image.jpg?fit=crop&h=1600&w=1600',
      regular: 'fideos-orientales-first-image.jpg?fit=crop&h=600&w=600',
      thumbnail: 'fideos-orientales-first-image.jpg?fit=crop&h=300&w=300',
      perspective: 2,
    },
    {
      zoom: 'fideos-orientales-second-image.jpg?fit=crop&h=1600&w=1600',
      regular: 'fideos-orientales-second-image.jpg?fit=crop&h=600&w=600',
      thumbnail: 'fideos-orientales-second-image.jpg?fit=crop&h=300&w=300',
      perspective: 10,
    },
  ],
  share_url:
    'https://sta.tech.mercadona.es/product/8731/fideos-orientales-yakisoba-sabor-pollo-hacendado-paquete',
  origin: 'Japan',
  nutrition_information: {
    allergens:
      'Puede contener <strong>crustáceos y productos a base de crustáceos</strong>. Puede contener <strong>pescado y productos a base de pescado</strong>. Puede contener <strong>granos de sésamo y productos a base de granos de sésamo</strong>. Contiene <strong>cereales que contengan gluten</strong>. Puede contener <strong>apio y productos derivados</strong>. Contiene <strong>moluscos y productos a base de moluscos</strong>.',
    ingredients:
      'Fideos 83,0% [harina de <strong>trigo</strong>, aceite de palma, sal, agentes de tratamiento de la harina (E500, E451), estabilizante (E501), espesante (E412), antioxidante (E306)], Sazonador líquido 16,1% [azúcar, agua, aceite de colza, salsa de <strong>soja</strong> (agua, habas de <strong>soja</strong>, sal, <strong>trigo</strong>) 8,8% en el sazonador líquido, potenciadores del sabor (E621, E635), colorante (E150c), dextrosa, melaza, vinagre, sal, especias, proteína vegetal hidrolizada, tomate en polvo, corrector de acidez: ácido cítrico, aromas], cebolleta. Puede contener trazas de <strong>apio</strong>, <strong>crustáceos</strong>, <strong>pescado</strong>, <strong>leche</strong>, <strong>moluscos</strong>, <strong>mostaza</strong> y <strong>sésamo</strong>.',
  },
}

const productWithBulk = {
  ...productBase,
  id: '3317',
  display_name: 'Uva blanca con semillas',
  price_instructions: {
    ...productBase.price_instructions,
    is_pack: false,
    min_bunch_amount: 0.2,
    increment_bunch_amount: 0.1,
    selling_method: 1,
  },
}

const productWithPack = {
  ...productBase,
  id: '71502',
  display_name: 'Plataforma mopa grande abrillantadora Bosque Verde',
  price_instructions: {
    ...productBase.price_instructions,
    is_pack: true,
  },
}

const unpublishedProduct = {
  ...productBase,
  id: '73420',
  display_name: 'Laca de uñas 1 capa y listo Deliplus 891 mostaza',
  published: false,
}

const outOfStockProduct = {
  ...productBase,
  id: '73420',
  display_name: 'Laca de uñas 1 capa y listo Deliplus 891 mostaza',
  published: false,
  status: 'temporarily_unavailable',
}

const productBaseWithUnavailableDay = (dayNumber) => ({
  ...productBase,
  unavailable_weekdays: [dayNumber],
})

const productBaseWithUnavailableFromDate = (date) => ({
  ...productBase,
  unavailable_weekdays: [],
  unavailable_from: date,
})

const productBaseWithUnavailableFromDateAndUnavailableWeekdaysDate = (
  unavailableFrom,
  unavailableWeekday,
) => ({
  ...productBase,
  unavailable_weekdays: [unavailableWeekday.getDay()],
  unavailable_from: unavailableFrom,
})

const productBaseWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate = (
  unavailableFrom,
  unavailableWeekdays,
) => ({
  ...productBase,
  unavailable_weekdays: unavailableWeekdays.map((day) => day.getDay()),
  unavailable_from: unavailableFrom,
})

const productBaseDetailWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate =
  (unavailableFrom, unavailableWeekdays) => ({
    ...productBaseDetail,
    unavailable_weekdays: unavailableWeekdays.map((day) => day.getDay()),
    unavailable_from: unavailableFrom,
  })

const productBaseDetailWithUnavailableSunday = {
  ...productBaseDetail,
  unavailable_weekdays: [0],
}

const productBaseDetailWithUnavailableMondayWednesday = {
  ...productBaseDetail,
  unavailable_weekdays: [1, 3],
}

const productBaseDetailWithUnavailableFromDate = (date) => ({
  ...productBaseDetail,
  unavailable_weekdays: [],
  unavailable_from: date,
})

const productBaseDetailWithoutUnavailableFromDate = {
  ...productBaseDetail,
  unavailable_weekdays: [],
}

const waterProduct = {
  id: '28491',
  ean: '8437008011004',
  slug: 'agua-mineral-bronchales-pack-6',
  brand: 'Bronchales',
  limit: 1000,
  badges: {
    is_water: true,
    requires_age_check: false,
  },
  origin: 'Manantial Bronchales',
  photos: [
    {
      zoom: 'https://sta-mercadona.imgix.net/20200202/91/28491/vlc1/28491_00_01.jpg?fit=crop&h=1600&w=1600',
      regular:
        'https://sta-mercadona.imgix.net/20200202/91/28491/vlc1/28491_00_01.jpg?fit=crop&h=600&w=600',
      thumbnail:
        'https://sta-mercadona.imgix.net/20200202/91/28491/vlc1/28491_00_01.jpg?fit=crop&h=300&w=300',
      perspective: 1,
    },
  ],
  details: {
    brand: 'Bronchales',
    origin: 'Manantial Bronchales',
    suppliers: [
      {
        name: 'Agua De Bronchales, S.A.',
      },
    ],
    legal_name: 'Agua mineral natural',
    description: 'Agua mineral Bronchales mediana mineralización muy débil',
    counter_info: null,
    danger_mentions: null,
    alcohol_by_volume: null,
    mandatory_mentions: 'Mineralización muy débil.',
    production_variant: null,
    usage_instructions: null,
    storage_instructions: null,
  },
  packaging: 'Pack-6',
  published: true,
  share_url:
    'https://sta.tech.mercadona.es/product/28491/agua-mineral-bronchales-pack-6',
  thumbnail:
    'https://sta-mercadona.imgix.net/20200202/91/28491/vlc1/28491_00_01.jpg?fit=crop&h=300&w=300',
  categories: [
    {
      id: 18,
      name: 'Agua y refrescos',
      level: 0,
      order: 8,
      categories: [
        {
          id: 156,
          name: 'Agua',
          level: 1,
          order: 8,
          categories: [
            {
              id: 525,
              name: 'Agua sin gas',
              level: 2,
              order: 8,
            },
          ],
        },
      ],
    },
  ],
  extra_info: [null],
  display_name: 'Agua mineral Bronchales',
  is_variable_weight: false,
  price_instructions: {
    iva: 10,
    is_new: false,
    is_pack: true,
    pack_size: 1.0,
    unit_name: 'botellas',
    unit_size: 18.0,
    bulk_price: '0.50',
    unit_price: '3.00',
    approx_size: false,
    size_format: 'l',
    total_units: 6,
    unit_selector: true,
    bunch_selector: false,
    drained_weight: null,
    selling_method: 0,
    price_decreased: false,
    reference_price: '0.50',
    min_bunch_amount: 1.0,
    reference_format: 'L',
    increment_bunch_amount: 1.0,
  },
  nutrition_information: {
    allergens: null,
    ingredients: 'Composición química mg/l;',
  },
}

const unpublishedWaterProduct = {
  ...waterProduct,
  published: false,
}

const unpublishedWaterProductWith100Liters = {
  ...waterProduct,
  id: '28411',
  published: false,
  display_name: 'Agua mineral 100 litros',
  price_instructions: {
    ...waterProduct.price_instructions,
    unit_size: 100,
  },
}

const waterProductWith100Liters = {
  ...waterProduct,
  id: '28492',
  display_name: 'Agua mineral Bronchales 100 litros',
  price_instructions: {
    ...waterProduct.price_instructions,
    unit_size: 100,
  },
}

const recommendedProduct = {
  ...productBase,
  id: '66895',
  display_name: 'Cerveza IPA aromática & amarga Especialidades 1897',
}

const productWithAgeVerification = {
  ...productBase,
  id: '28775',
  display_name: 'Ginebra London dry gin Tanqueray',
  badges: {
    is_water: false,
    requires_age_check: true,
  },
  price_instructions: {
    ...productBase.price_instructions,
    unit_price: '14.99',
  },
}

const productXSelling = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: '3119',
      slug: 'pera-conferencia-pieza',
      limit: 1000,
      badges: {
        is_water: false,
        requires_age_check: false,
      },
      published: true,
      packaging: 'Pieza',
      share_url:
        'https://sta.tech.mercadona.es/product/3119/pera-conferencia-pieza',
      thumbnail:
        'https://sta-mercadona.imgix.net/20190919/19/3119/vlc1/3119_00_02.jpg?fit=crop&h=300&w=300',
      display_name: 'Pera conferencia',
      price_instructions: {
        iva: 4,
        is_new: false,
        is_pack: false,
        pack_size: null,
        unit_name: null,
        unit_size: 0.19,
        bulk_price: '1.59',
        unit_price: '0.30',
        approx_size: true,
        size_format: 'kg',
        total_units: null,
        drained_weight: null,
        selling_method: 0,
        price_decreased: false,
        reference_price: '1.59',
        min_bunch_amount: 1.0,
        reference_format: 'kg',
        increment_bunch_amount: 1.0,
      },
    },
  ],
}

const productWithoutXSelling = {
  next_page: null,
  results: [],
}

const xSellingWithTooManyProducts = {
  count: 6,
  next: null,
  previous: null,
  results: [
    { ...productBase, id: '1' },
    { ...productBase, id: '2' },
    { ...productBase, id: '3' },
    { ...productBase, id: '4' },
    { ...productBase, id: '5' },
    { ...productBase, id: '6' },
  ],
}

const productListWithAllFormats = [
  {
    ...productBase,
    id: '40351',
    display_name: 'Pintalabios Velvet Nudes mate Deliplus 01 nude claro',
    packaging: null,
    price_instructions: {
      ...productBase.price_instructions,
      is_pack: false,
      pack_size: null,
      unit_name: null,
      unit_size: 1,
      approx_size: false,
      size_format: 'ud',
      total_units: null,
      drained_weight: null,
      selling_method: 0,
      min_bunch_amount: 1,
    },
  },
  {
    ...productBase,
    id: '40352',
    display_name: 'Banana',
    packaging: null,
    price_instructions: {
      ...productBase.price_instructions,
      is_pack: false,
      pack_size: null,
      unit_name: null,
      unit_size: 0.09,
      approx_size: true,
      size_format: 'kg',
      total_units: null,
      drained_weight: null,
      selling_method: 0,
      min_bunch_amount: 1,
    },
  },
  {
    ...productBase,
    id: '40353',
    display_name: 'Judía verde redonda',
    packaging: 'Bandeja',
    price_instructions: {
      ...productBase.price_instructions,
      is_pack: false,
      pack_size: null,
      unit_name: null,
      unit_size: 0.5,
      approx_size: false,
      size_format: 'kg',
      total_units: null,
      drained_weight: null,
      selling_method: 0,
      min_bunch_amount: 1,
    },
  },
  {
    ...productBase,
    id: '40354',
    display_name: 'Patata',
    packaging: 'Pieza',
    price_instructions: {
      ...productBase.price_instructions,
      is_pack: false,
      pack_size: null,
      unit_name: null,
      unit_size: 0.25,
      approx_size: true,
      size_format: 'kg',
      total_units: null,
      drained_weight: null,
      selling_method: 0,
      min_bunch_amount: 1,
    },
  },
  {
    ...productBase,
    id: '18086',
    display_name: 'Atún en aceite de girasol Hacendado',
    packaging: 'Lata',
    price_instructions: {
      ...productBase.price_instructions,
      is_pack: false,
      pack_size: null,
      unit_name: null,
      unit_size: 0.9,
      approx_size: false,
      size_format: 'kg',
      total_units: null,
      drained_weight: 0.65,
      selling_method: 0,
      min_bunch_amount: 1,
    },
  },
  {
    ...productBase,
    id: '24291',
    display_name: 'Chipirón puntilla',
    packaging: 'Paquete',
    price_instructions: {
      ...productBase.price_instructions,
      is_pack: false,
      pack_size: null,
      unit_name: null,
      unit_size: null,
      approx_size: false,
      size_format: 'kg',
      total_units: null,
      drained_weight: 0.45,
      selling_method: 0,
      min_bunch_amount: 1,
    },
  },
  {
    ...productBase,
    id: '24350',
    display_name: 'Filete de salmón rosado',
    packaging: 'Pieza',
    price_instructions: {
      ...productBase.price_instructions,
      is_pack: false,
      pack_size: null,
      unit_name: null,
      unit_size: null,
      approx_size: true,
      size_format: 'kg',
      total_units: null,
      drained_weight: 0.3,
      selling_method: 0,
      min_bunch_amount: 1,
    },
  },
  {
    ...productBase,
    id: '47540',
    display_name: 'Papel higiénico acolchado',
    packaging: 'Paquete',
    price_instructions: {
      ...productBase.price_instructions,
      is_pack: false,
      pack_size: null,
      unit_name: 'rollos',
      unit_size: 1,
      approx_size: false,
      size_format: 'ud',
      total_units: 6,
      drained_weight: null,
      selling_method: 0,
      min_bunch_amount: 1,
    },
  },
  {
    ...productBase,
    id: '84814',
    display_name: 'Pan estrellado',
    packaging: null,
    price_instructions: {
      ...productBase.price_instructions,
      is_pack: false,
      pack_size: null,
      unit_name: 'ud.',
      unit_size: 0.09,
      approx_size: false,
      size_format: 'kg',
      total_units: 1,
      drained_weight: null,
      selling_method: 0,
      min_bunch_amount: 1,
    },
  },
  {
    ...productBase,
    id: '85773',
    display_name: 'Rosquillas al cacao',
    packaging: null,
    price_instructions: {
      ...productBase.price_instructions,
      is_pack: false,
      pack_size: null,
      unit_name: 'ud.',
      unit_size: 0.064,
      approx_size: true,
      size_format: 'kg',
      total_units: 2,
      drained_weight: null,
      selling_method: 0,
      min_bunch_amount: 1,
    },
  },
  {
    ...productBase,
    id: '10768',
    display_name: 'Leche semidesnatada',
    packaging: null,
    price_instructions: {
      ...productBase.price_instructions,
      is_pack: true,
      pack_size: 1,
      unit_name: 'bricks',
      unit_size: 6,
      approx_size: false,
      size_format: 'l',
      total_units: 6,
      drained_weight: null,
      selling_method: 0,
      min_bunch_amount: 1,
    },
  },
  {
    ...productBase,
    id: '14050',
    display_name: 'Galletas rellenas de naranja',
    packaging: 'Caja',
    price_instructions: {
      ...productBase.price_instructions,
      is_pack: false,
      pack_size: null,
      unit_name: 'bandejas',
      unit_size: 0.3,
      approx_size: false,
      size_format: 'kg',
      total_units: 2,
      drained_weight: null,
      selling_method: 0,
      min_bunch_amount: 1,
    },
  },
  {
    ...productBase,
    id: '24430',
    display_name: 'Lomos de salmón de Noruega',
    packaging: 'Paquete',
    price_instructions: {
      ...productBase.price_instructions,
      is_pack: false,
      pack_size: null,
      unit_name: 'ud.',
      unit_size: null,
      approx_size: false,
      size_format: 'kg',
      total_units: 2,
      drained_weight: 0.25,
      selling_method: 0,
      min_bunch_amount: 1,
    },
  },
  {
    ...productWithBulk,
    id: '69827',
    display_name: 'Judía verde plana',
    packaging: 'Granel',
    price_instructions: {
      ...productWithBulk.price_instructions,
      is_pack: false,
      pack_size: null,
      unit_name: null,
      unit_size: 1,
      approx_size: true,
      size_format: 'kg',
      total_units: null,
      drained_weight: null,
      selling_method: 1,
      min_bunch_amount: 0.15,
    },
  },
]

const unpublishedProductWithAgeVerification = {
  ...productBase,
  id: '28775',
  display_name: 'Ginebra London dry gin Tanqueray',
  badges: {
    is_water: false,
    requires_age_check: true,
  },
  price_instructions: {
    ...productBase.price_instructions,
    unit_price: '14.99',
  },
  published: false,
}

const productAvailableInVlcNotInMad = {
  id: '67154',
  slug: 'cerveza-tostada-turia-pack-12',
  limit: 999,
  badges: {
    is_water: false,
    requires_age_check: true,
  },
  packaging: 'Pack-12',
  published: true,
  share_url:
    'https://sta.tech.mercadona.es/product/67154/cerveza-tostada-turia-pack-12',
  thumbnail:
    'https://sta-mercadona.imgix.net/images/4aa14c98b380a373330f28eb66fcd427.jpg?fit=crop&h=300&w=300',
  categories: [
    {
      id: 19,
      name: 'Bodega',
      level: 0,
      order: 15,
    },
  ],
  display_name: 'Cerveza tostada Turia',
  price_instructions: {
    iva: 21,
    is_new: false,
    is_pack: true,
    pack_size: 0.25,
    unit_name: 'botellines',
    unit_size: 3,
    bulk_price: '2.04',
    unit_price: '6.12',
    approx_size: false,
    size_format: 'l',
    total_units: 12,
    unit_selector: true,
    bunch_selector: false,
    drained_weight: null,
    selling_method: 0,
    price_decreased: false,
    reference_price: '2.040',
    min_bunch_amount: 1,
    reference_format: 'L',
    previous_unit_price: '6.96',
    increment_bunch_amount: 1,
  },
  unavailable_weekdays: [],
}
const cocaColaProductBarcelona = {
  id: '27348',
  slug: 'refresco-coca-cola-pack-2',
  limit: 999,
  badges: {
    is_water: false,
    requires_age_check: false,
  },
  packaging: 'Pack-2',
  published: true,
  share_url:
    'https://sta.tech.mercadona.es/product/27348/refresco-coca-cola-pack-2',
  thumbnail:
    'https://sta-mercadona.imgix.net/images/1c6c9390743b38ad5042c4428763a88c.jpg?fit=crop&h=300&w=300',
  categories: [
    {
      id: 18,
      name: 'Agua y refrescos',
      level: 0,
      order: 8,
    },
  ],
  display_name: 'Refresco Coca-Cola',
  unavailable_from: null,
  price_instructions: {
    iva: 21,
    is_new: false,
    is_pack: true,
    pack_size: 2,
    unit_name: 'botellas',
    unit_size: 4,
    bulk_price: '1.16',
    unit_price: '4.64',
    approx_size: false,
    size_format: 'l',
    total_units: 2,
    unit_selector: true,
    bunch_selector: false,
    drained_weight: null,
    selling_method: 0,
    price_decreased: false,
    reference_price: '1.160',
    min_bunch_amount: 1,
    reference_format: 'L',
    previous_unit_price: '        4.74',
    increment_bunch_amount: 1,
  },
  unavailable_weekdays: [],
}

const cocaColaProductValencia = {
  id: '27348',
  slug: 'refresco-coca-cola-pack-2',
  limit: 999,
  badges: {
    is_water: false,
    requires_age_check: false,
  },
  packaging: 'Pack-2',
  published: true,
  share_url:
    'https://sta.tech.mercadona.es/product/27348/refresco-coca-cola-pack-2',
  thumbnail:
    'https://sta-mercadona.imgix.net/images/1c6c9390743b38ad5042c4428763a88c.jpg?fit=crop&h=300&w=300',
  categories: [
    {
      id: 18,
      name: 'Agua y refrescos',
      level: 0,
      order: 8,
    },
  ],
  display_name: 'Refresco Coca-Cola',
  unavailable_from: null,
  price_instructions: {
    iva: 21,
    is_new: false,
    is_pack: true,
    pack_size: 2,
    unit_name: 'botellas',
    unit_size: 4,
    bulk_price: '0.98',
    unit_price: '3.90',
    approx_size: false,
    size_format: 'l',
    total_units: 2,
    unit_selector: true,
    bunch_selector: false,
    drained_weight: null,
    selling_method: 0,
    price_decreased: false,
    reference_price: '0.975',
    min_bunch_amount: 1,
    reference_format: 'L',
    previous_unit_price: '        4.00',
    increment_bunch_amount: 1,
  },
  unavailable_weekdays: [],
}

const packProductWithDrainedWeight = {
  ...productBase,
  id: '18086',
  display_name: 'Atún en aceite de girasol Hacendado',
  packaging: 'Lata',
  price_instructions: {
    iva: 10,
    is_new: false,
    is_pack: true,
    pack_size: 0.06,
    unit_name: 'latas',
    unit_size: 0.48,
    bulk_price: '10.21',
    unit_price: '4.90',
    approx_size: false,
    size_format: 'kg',
    total_units: 6,
    unit_selector: true,
    bunch_selector: false,
    drained_weight: 0.36,
    selling_method: 0,
    tax_percentage: '10.000',
    price_decreased: false,
    reference_price: '13.612',
    min_bunch_amount: 1.0,
    reference_format: 'kg',
    previous_unit_price: null,
    increment_bunch_amount: 1.0,
  },
}

export {
  productBase,
  englishProductBase,
  productBaseDetail,
  productWithBulk,
  productWithPack,
  productBaseWithUnavailableDay,
  productBaseDetailWithUnavailableSunday,
  productBaseDetailWithUnavailableMondayWednesday,
  unpublishedProduct,
  outOfStockProduct,
  waterProduct,
  unpublishedWaterProduct,
  waterProductWith100Liters,
  unpublishedWaterProductWith100Liters,
  recommendedProduct,
  productWithAgeVerification,
  productXSelling,
  productWithoutXSelling,
  xSellingWithTooManyProducts,
  productListWithAllFormats,
  unpublishedProductWithAgeVerification,
  productAvailableInVlcNotInMad,
  productBaseWithUnavailableFromDate,
  productBaseDetailWithUnavailableFromDate,
  productBaseDetailWithoutUnavailableFromDate,
  productBaseWithUnavailableFromDateAndUnavailableWeekdaysDate,
  productBaseWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate,
  productBaseDetailWithUnavailableFromDateAndMultipleUnavailableWeekdaysDate,
  cocaColaProductBarcelona,
  cocaColaProductValencia,
  productBaseDetailWithNutritionInformation,
  packProductWithDrainedWeight,
}
