import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Category', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should redirect to the first category detail', async () => {
    const responses = [
      {
        path: '/categories/?lang=en&wh=vlc1',
        responseBody: categories,
        catchParams: true,
      },
      {
        path: '/categories/112/?lang=en&wh=vlc1',
        responseBody: categoryDetail,
        catchParams: true,
      },
    ]
    wrap(App).atPath('/categories').withNetwork(responses).withLogin().mount()

    await screen.findAllByText('Aceite, vinagre y sal')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/categories/?lang=en&wh=vlc1'),
        method: 'GET',
      }),
    )
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/categories/112/?lang=en&wh=vlc1'),
        method: 'GET',
      }),
    )
  })
})
