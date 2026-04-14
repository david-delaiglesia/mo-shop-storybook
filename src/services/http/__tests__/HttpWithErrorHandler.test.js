import { HttpWithErrorHandler, NetworkError } from '../../http'

import { I18nClient } from 'app/i18n/client'

describe('HttpWithErrorHandler Service', () => {
  const lang = 'es'
  I18nClient.getCurrentLanguage = () => lang

  const path = '/my/path/'
  const options = {}

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should add the credentials to the request', async () => {
    const optionsWithHeaders = { authorization: expect.any(String) }

    await HttpWithErrorHandler.auth().get(path, options)

    const expectedRequest = expect.objectContaining({
      url: expect.stringContaining(path),
      headers: { map: expect.objectContaining(optionsWithHeaders) },
    })
    expect(fetch).toHaveBeenCalledWith(expectedRequest)
  })

  it('should not add the credentials to the request', async () => {
    const optionsWithoutHeaders = { authorization: null }

    await HttpWithErrorHandler.get(path, options)

    const expectedRequest = expect.objectContaining({
      url: expect.stringContaining(path),
      headers: { map: expect.not.objectContaining(optionsWithoutHeaders) },
    })
    expect(fetch).toHaveBeenCalledWith(expectedRequest)
  })

  it('should have the language as query string by default', async () => {
    await HttpWithErrorHandler.put(path, options)

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

    await HttpWithErrorHandler.put(path, optionsWithParams)

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

    await HttpWithErrorHandler.put(path, optionsWithParams)

    const queryString = `?lang=value`
    const expectedRequest = expect.objectContaining({
      url: expect.stringContaining(path + queryString),
    })
    expect(fetch).toHaveBeenCalledWith(expectedRequest)
  })

  it('should catch the network error by default', async () => {
    const error = { status: 400, message: '' }
    fetch.mockRejectedValue(error)
    const subscriber = vi.fn()
    NetworkError.subscribe(subscriber)

    await HttpWithErrorHandler.post(path)

    expect(subscriber).toHaveBeenCalledWith(error)
  })

  it('should not catch the network error', async () => {
    const error = { status: 400, message: '' }
    fetch.mockRejectedValue(error)
    const subscriber = vi.fn()
    NetworkError.subscribe(subscriber)
    const optionsWithCatch = {
      ...options,
      shouldCatchErrors: false,
    }

    try {
      await HttpWithErrorHandler.put(path, optionsWithCatch)
    } catch {
      expect(subscriber).not.toHaveBeenCalled()
    }
  })
})
