import { render } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'
import { configure, matchers } from 'wrapito'

import { emptyCart } from 'app/cart/__scenarios__/cart'
import { user } from 'app/user/__scenarios__/user'
import { Storage } from 'services/storage'

const { VITE_API_HOST: defaultHost } = import.meta.env

configure({
  defaultHost,
  mount: render,
  portals: ['modal-info', 'aria-live-portal'],
  handleQueryParams: true,
  extend: {
    withLogin: (
      { addResponses },
      [{ cart = emptyCart, user: overrideUser } = {}],
    ) => {
      Storage.setItem('user', { uuid: '1', token: 'user-token' })
      addResponses([
        { path: '/customers/1/', responseBody: { ...user, ...overrideUser } },
        { path: '/customers/1/cart/', responseBody: cart },
      ])
    },
    withUserArea: ({ addResponses }, [otherResponses] = []) => {
      const defaultResponses = [
        {
          path: '/customers/1/home/',
          responseBody: {
            sections: [],
          },
        },
        {
          path: '/customers/1/orders/5/lines/prepared/',
          responseBody: {
            results: [
              {
                product: 'Whatever',
                ordered_quantity: 1,
                prepared_quantity: 1,
                preparation_result: 'something',
                original_price_instructions: 65,
                total_prepared_price: 70,
              },
            ],
            next_page: null,
          },
        },
      ]
      otherResponses.length !== 0
        ? addResponses([...defaultResponses, ...otherResponses])
        : addResponses(defaultResponses)
    },
  },
})

expect.extend(matchers)
