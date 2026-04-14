import { screen } from '@testing-library/react'

import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import { homeWithBannerProduct } from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

it('should show the text in the productBanner section', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithBannerProduct },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Lists')

  expect(screen.getByText('Es tendencia')).toBeInTheDocument()
  expect(screen.getByText('Lo más buscado')).toBeInTheDocument()
  expect(
    screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
  ).toBeInTheDocument()

  expect(screen.getByText('Paquete')).toBeInTheDocument()
  expect(screen.getByText('90 g')).toBeInTheDocument()

  expect(screen.getByText('0,85 €')).toBeInTheDocument()
  expect(screen.getByText('/unit')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Add to cart' }),
  ).toBeInTheDocument()
})

it('should show the image productBanner section', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithBannerProduct },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Lists')

  expect(
    screen.getByLabelText(
      'imagen del producto Fideos orientales Yakisoba sabor pollo Hacendado',
    ),
  ).toHaveProperty('src', 'http://images-server-url/image-file')
})

it('should display the correct typography for the price', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithBannerProduct },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Lists')

  expect(screen.getByText('0,85 €')).toHaveClass('headline1-b')
  expect(screen.getByText('0,85 €')).not.toHaveClass('subhead1-b')
})
