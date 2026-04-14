import { Http } from '../../http'
import { DeliveryAreaPubSub } from '../DeliveryAreaPubSub'
import { NetworkError } from '../NetworkError'
import { HttpXHeaders } from '../constants'
import { vi } from 'vitest'

import { I18nClient } from 'app/i18n/client'
import { Session } from 'services/session'

vi.mock('../NetworkError', () => ({
  NetworkError: { publish: vi.fn() },
}))

vi.mock('../DeliveryAreaPubSub', () => ({
  DeliveryAreaPubSub: { publish: vi.fn() },
}))

describe('Http Service', () => {
  const lang = 'es'
  I18nClient.getCurrentLanguage = () => lang

  const path = '/my/path/'
  const options = {}

  beforeEach(() => {
    const response = {
      headers: new Headers(),
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    }

    delete global.fetch
    global.fetch = vi.fn().mockResolvedValue(response)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should add the credentials to the request', async () => {
    await Http.auth().get(path, options)

    const expectedRequest = expect.objectContaining({
      url: expect.stringContaining(path),
      headers: {
        map: expect.objectContaining({ authorization: 'Bearer undefined' }),
      },
    })
    expect(global.fetch).toHaveBeenCalledWith(expectedRequest)
  })

  it('should not add the credentials to the request', async () => {
    await Http.get(path, options)

    const expectedRequest = expect.objectContaining({
      url: expect.stringContaining(path),
      headers: { map: expect.not.objectContaining({ authorization: null }) },
    })
    expect(global.fetch).toHaveBeenCalledWith(expectedRequest)
  })

  it('should have the language as query string by default', async () => {
    await Http.put(path, options)

    const queryString = `?lang=${lang}`
    const expectedRequest = expect.objectContaining({
      url: expect.stringContaining(path + queryString),
    })
    expect(fetch).toHaveBeenCalledWith(expectedRequest)
  })

  it('should add params to the query string', async () => {
    const foo = 'value'
    const optionsWithParams = {
      ...options,
      params: { foo },
    }

    await Http.put(path, optionsWithParams)

    const queryString = `?lang=${lang}&wh=vlc1&foo=${foo}`
    const expectedRequest = expect.objectContaining({
      url: expect.stringContaining(path + queryString),
    })
    expect(fetch).toHaveBeenCalledWith(expectedRequest)
  })

  it('should allow to overwrite params to the query string', async () => {
    const lang = 'value'
    const optionsWithParams = {
      ...options,
      params: { lang },
    }

    await Http.put(path, optionsWithParams)

    const queryString = `?lang=value`
    const expectedRequest = expect.objectContaining({
      url: expect.stringContaining(path + queryString),
    })
    expect(fetch).toHaveBeenCalledWith(expectedRequest)
  })

  it('should call the network error pubsub if the warehouse has changed', async () => {
    const warehouse = 'vlc1'
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: new Headers({
          'x-customer-wh': warehouse,
        }),
        json: () => Promise.resolve(),
      }),
    )
    Session.get = vi.fn().mockReturnValue({ warehouse: 'mad1', isAuth: false })
    await Http.put(path)

    expect(NetworkError.publish).toHaveBeenCalledWith({
      status: 'warehouse-changed-new',
    })
  })

  it('should not call the network error pubsub if the warehouse is the same', async () => {
    const warehouse = 'vlc1'
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: new Headers({
          'x-customer-wh': warehouse,
        }),
        json: () => Promise.resolve(),
      }),
    )
    Session.get = vi.fn().mockReturnValue({ warehouse })
    await Http.put(path)

    expect(NetworkError.publish).not.toHaveBeenCalled()
  })

  it('should call the delivery area pubsub', async () => {
    const warehouse = 'vlc1'
    const postalCode = '46001'
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: new Headers({
          'x-customer-wh': warehouse,
          'x-customer-pc': postalCode,
        }),
        json: () => Promise.resolve(),
      }),
    )
    Session.get = vi.fn().mockReturnValue({ warehouse })

    await Http.put(path)

    expect(DeliveryAreaPubSub.publish).toHaveBeenCalledWith({
      warehouse,
      postalCode,
    })
  })

  it('should send know flags in x-experiment-variants header', async () => {
    vi.mock('@unleash/proxy-client-react', () => {
      return {
        UnleashClient: vi.fn(() => ({
          getAllToggles: vi.fn(() => [
            {
              name: 'flag1',
              enabled: true,
            },
            {
              name: 'flag2',
              enabled: true,
            },
            {
              name: 'flag3',
              enabled: false,
            },
          ]),
        })),
      }
    })
    vi.mock('services/feature-flags/constants', async (importOriginal) => {
      const original = await importOriginal()
      return {
        ...original,
        experiments: {
          experiment_active: ['flag1', 'flag2'],
          experiment_inactive: ['flag1', 'flag3'],
          experiment_non: ['flag1', 'flagNoExist'],
        },
      }
    })

    await Http.get(path, options)

    const expectedRequest = expect.objectContaining({
      headers: {
        map: expect.objectContaining({
          [HttpXHeaders.X_EXPERIMENT_VARIANTS]:
            'experiment_active=true;experiment_inactive=false;experiment_non=false',
        }),
      },
    })
    expect(global.fetch).toHaveBeenCalledWith(expectedRequest)
  })
})
