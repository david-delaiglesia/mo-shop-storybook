import { screen } from '@testing-library/react'

import { confirmRemoveProduct, removeProduct } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { recommendations } from 'app/catalog/__scenarios__/recommendations'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  Cookie.get = vi.fn(() => ({ language: 'en', postalCode: '46010' }))
})

afterEach(() => {
  vi.clearAllMocks()
  Storage.clear()
  localStorage.clear()
})

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

it('should remove a product from my regulars list', async () => {
  const responses = [
    {
      path: '/customers/1/recommendations/myregulars/',
      multipleResponses: [
        { responseBody: recommendations },
        { responseBody: [] },
      ],
    },
    {
      path: '/customers/1/recommendations/myregulars/products/8731/',
      method: 'delete',
    },
  ]
  wrap(App)
    .atPath('/shopping-lists/my-regulars')
    .withNetwork(responses)
    .withLogin()
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  removeProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  const alert = screen.getByRole('dialog', {
    name: "Don't show in My Essentials. If you remove an essential product it will disappear from the list until you buy it again.",
  })
  confirmRemoveProduct()
  await screen.findByText('Make your first order to see your essentials')

  expect(alert).not.toBeInTheDocument()
  expect(
    screen.queryByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
  ).not.toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'remove_from_my_regulars',
    {
      source: 'my_regulars_precision',
      display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
      id: '8731',
    },
  )
})

it('should remove an unpublished product from my regulars list', async () => {
  const recommendationsCopy = cloneDeep(recommendations)
  recommendationsCopy[0].product.published = false
  const responses = [
    {
      path: '/customers/1/recommendations/myregulars/',
      multipleResponses: [
        { responseBody: recommendationsCopy },
        { responseBody: [] },
      ],
    },
    {
      path: '/customers/1/recommendations/myregulars/products/8731/',
      method: 'delete',
    },
  ]
  wrap(App)
    .atPath('/shopping-lists/my-regulars')
    .withNetwork(responses)
    .withLogin()
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  removeProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  const alert = screen.getByRole('dialog', {
    name: "Don't show in My Essentials. If you remove an essential product it will disappear from the list until you buy it again.",
  })
  confirmRemoveProduct()
  await screen.findByText('Make your first order to see your essentials')

  expect(alert).not.toBeInTheDocument()
  expect(
    screen.queryByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
  ).not.toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'remove_from_my_regulars',
    {
      source: 'my_regulars_precision',
      display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
      id: '8731',
    },
  )
})
