import { screen } from '@testing-library/react'

import { wrap } from 'wrapito'

import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'

it('should show web migration label in STA', async () => {
  import.meta.env.NODE_ENV = 'test'

  const responses = [{ path: '/home/', responseBody: homeWithGrid }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Novedades')

  expect(screen.getByText('WEB-MIGRATION')).toBeInTheDocument()
})
