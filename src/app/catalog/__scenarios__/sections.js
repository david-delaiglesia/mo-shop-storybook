import { productBase } from './product'

const newArrivals = {
  title: 'Novedades',
  source: 'new-arrivals',
  items: [
    {
      ...productBase,
    },
  ],
}

export { newArrivals }
