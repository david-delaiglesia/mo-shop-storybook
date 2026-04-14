import { screen } from '@testing-library/react'

import { openLanguageSelector } from '../../helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home available languages', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should see all the available langauges', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()
    await screen.findByText('Novedades')
    openLanguageSelector()

    const languageList = screen.getByRole('list')

    expect(languageList).toHaveTextContent('Spanish')
    expect(languageList).toHaveTextContent('Valencian')
    expect(languageList).toHaveTextContent('Catalan')
    expect(languageList).toHaveTextContent('English')
    expect(languageList).toHaveTextContent('Basque')
  })
})
