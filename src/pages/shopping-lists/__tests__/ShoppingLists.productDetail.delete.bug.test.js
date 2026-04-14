import { screen } from '@testing-library/react'

import { wrap } from 'wrapito'

import { App } from 'app'
import { englishHomeWithRecommendations } from 'app/catalog/__scenarios__/home'
import { cloneDeep } from 'utils/objects'

it('adds the default quantity when opening detail from shopping list', async () => {
  const homeDetailCopy = cloneDeep(englishHomeWithRecommendations)
  homeDetailCopy.sections[1].content.items[0].published = false

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/customers/1/home/', responseBody: homeDetailCopy }])
    .withLogin()
    .mount()

  await screen.findByText('Recommended for you')

  expect(
    screen.queryByRole('button', {
      name: 'remove_product_aria',
    }),
  ).not.toBeInTheDocument()
})
