import { I18nClient } from '../client'

import { Cookie } from 'services/cookie'

const initialLanguage = 'eu'

vi.unmock('../client')
vi.unmock('i18next')

describe('i18n init', () => {
  it('should load default language on init', async () => {
    Cookie.get = vi.fn().mockReturnValue({ language: initialLanguage })

    await I18nClient.create(initialLanguage)

    const instance = I18nClient.getInstance()

    expect(instance.options.resources.eu).toBeDefined()
    expect(instance.options.resources.en).toBeDefined()
  })
})
