import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { Support } from 'services/support'

configure({
  changeRoute: (route) => history.push(route),
})

it('should open the chat when open the help path', async () => {
  const responses = [{ path: '/home/', responseBody: homeWithGrid }]
  wrap(App).atPath('/help').withNetwork(responses).mount()

  await screen.findByText('Novedades')

  expect(Support.openWidget).toHaveBeenCalled()
})
