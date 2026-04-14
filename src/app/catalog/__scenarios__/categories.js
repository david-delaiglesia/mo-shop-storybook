import {
  cocaColaProductBarcelona,
  cocaColaProductValencia,
  productBase,
  waterProduct,
} from './product'

const categories = {
  next: null,
  count: 26,
  results: [
    {
      id: 12,
      name: 'Aceite, especias y salsas',
      order: 7,
      layout: 2,
      published: true,
      categories: [
        {
          id: 112,
          name: 'Aceite, vinagre y sal',
          order: 7,
          layout: 1,
          published: true,
          is_extended: false,
        },
        {
          id: 115,
          name: 'Especias',
          order: 7,
          layout: 1,
          published: true,
          is_extended: false,
        },
      ],
      is_extended: false,
    },
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
    {
      id: 13,
      name: 'Arroz, legumbres y pasta',
      order: 10,
      layout: 2,
      published: true,
      categories: [
        {
          id: 118,
          name: 'Arroz',
          order: 10,
          layout: 1,
          published: true,
          is_extended: false,
        },
        {
          id: 121,
          name: 'Legumbres',
          order: 10,
          layout: 1,
          published: true,
          is_extended: false,
        },
        {
          id: 120,
          name: 'Pasta y fideos',
          order: 10,
          layout: 1,
          published: true,
          is_extended: false,
        },
      ],
      is_extended: false,
    },
  ],
  previous: null,
}
const categoriesWithSoda = {
  next: null,
  count: 26,
  results: [
    {
      id: 18,
      name: 'Agua y refrescos',
      order: 8,
      layout: 2,
      published: true,
      categories: [
        {
          id: 156,
          name: 'Agua',
          order: 8,
          layout: 1,
          published: true,
          is_extended: false,
        },
        {
          id: 163,
          name: 'Isotónico y energético',
          order: 8,
          layout: 1,
          published: true,
          is_extended: false,
        },
        {
          id: 158,
          name: 'Refresco de cola',
          order: 8,
          layout: 1,
          published: true,
          is_extended: false,
        },
        {
          id: 159,
          name: 'Refresco de naranja y de limón',
          order: 8,
          layout: 1,
          published: true,
          is_extended: false,
        },
        {
          id: 161,
          name: 'Tónica y bitter',
          order: 8,
          layout: 1,
          published: true,
          is_extended: false,
        },
        {
          id: 162,
          name: 'Refresco de té y sin gas',
          order: 8,
          layout: 1,
          published: true,
          is_extended: false,
        },
      ],
      is_extended: false,
    },
  ],
  previous: null,
}

const categoriesWithTwoSubcategories = {
  next: null,
  count: 26,
  results: [
    {
      id: 12,
      name: 'Aceite, especias y salsas',
      order: 7,
      layout: 2,
      published: true,
      categories: [
        {
          id: 112,
          name: 'Aceite, vinagre y sal',
          order: 7,
          layout: 1,
          published: true,
          is_extended: false,
        },
        {
          id: 115,
          name: 'Especias',
          order: 8,
          layout: 1,
          published: true,
          is_extended: false,
        },
      ],
      is_extended: false,
    },
  ],
  previous: null,
}

const categoryDetail = {
  id: 112,
  name: 'Aceite, vinagre y sal',
  order: 7,
  layout: 1,
  published: true,
  categories: [
    {
      id: 420,
      name: 'Aceite de oliva',
      order: 7,
      layout: 2,
      products: [
        {
          ...productBase,
        },
      ],
      published: true,
      is_extended: false,
    },
  ],
  is_extended: false,
}

const categoryDetailCocaColaValencia = {
  id: 158,
  name: 'Refresco de cola',
  order: 8,
  layout: 1,
  published: true,
  categories: [
    {
      id: 530,
      name: 'Aceite de oliva',
      order: 7,
      layout: 2,
      products: [cocaColaProductValencia],
      published: true,
      is_extended: false,
    },
  ],
  is_extended: false,
}

const categoryDetailCocaColaBarcelona = {
  id: 158,
  name: 'Refresco de cola',
  order: 8,
  layout: 1,
  published: true,
  categories: [
    {
      id: 530,
      name: 'Aceite de oliva',
      order: 7,
      layout: 2,
      products: [cocaColaProductBarcelona],
      published: true,
      is_extended: false,
    },
  ],
  is_extended: false,
}

const categoryDetailWithBlinkingProductDay = (dayNumber) => ({
  ...categoryDetail,
  categories: [
    {
      ...categoryDetail.categories[0],
      products: [
        {
          ...productBase,
          unavailable_weekdays: [dayNumber],
        },
      ],
    },
  ],
})

const categoryDetailWithBlinkingProductUnavailableFrom = (date) => ({
  ...categoryDetail,
  categories: [
    {
      ...categoryDetail.categories[0],
      products: [
        {
          ...productBase,
          unavailable_weekdays: [],
          unavailable_from: date,
        },
      ],
    },
  ],
})

const categoryDetailWithBlinkingProductUnavailableFromAnUnavailableWeekday = (
  unavailableFrom,
  unavailableWeekday,
) => ({
  ...categoryDetail,
  categories: [
    {
      ...categoryDetail.categories[0],
      products: [
        {
          ...productBase,
          unavailable_weekdays: [unavailableWeekday.getDay()],
          unavailable_from: unavailableFrom,
        },
      ],
    },
  ],
})

const categoryDetailWithBlinkingProductWithoutUnavailableFrom = {
  ...categoryDetail,
  categories: [
    {
      ...categoryDetail.categories[0],
      products: [
        {
          ...productBase,
          unavailable_weekdays: [],
        },
      ],
    },
  ],
}

const speciesCategoryDetail = {
  id: 115,
  name: 'Especias',
  order: 8,
  layout: 1,
  published: true,
  categories: [
    {
      id: 420,
      name: 'Hierbas',
      order: 7,
      layout: 2,
      products: [
        {
          ...productBase,
        },
      ],
      published: true,
      is_extended: false,
    },
  ],
  is_extended: false,
}

const babyFoodSubcategoryDetail = {
  id: 216,
  name: 'Alimentación infantil',
  order: 14,
  layout: 1,
  published: true,
  is_extended: false,
  categories: [
    {
      id: 691,
      name: 'Tarritos salados',
      order: 14,
      layout: 2,
      published: true,
      is_extended: false,
      products: [{ ...waterProduct }],
    },
  ],
}

export {
  categories,
  categoryDetail,
  categoryDetailWithBlinkingProductDay,
  speciesCategoryDetail,
  categoriesWithTwoSubcategories,
  babyFoodSubcategoryDetail,
  categoryDetailWithBlinkingProductUnavailableFrom,
  categoryDetailWithBlinkingProductWithoutUnavailableFrom,
  categoryDetailWithBlinkingProductUnavailableFromAnUnavailableWeekday,
  categoryDetailCocaColaValencia,
  categoryDetailCocaColaBarcelona,
  categoriesWithSoda,
}
