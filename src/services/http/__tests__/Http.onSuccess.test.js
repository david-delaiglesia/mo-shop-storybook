import { Http } from '../../http'

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

it('should trigger the "then" callback if the request succeed', async () => {
  const onSuccess = vi.fn()

  await Http.auth().put('/foo').then(onSuccess)

  expect(onSuccess).toHaveBeenCalled()
})

it('should not trigger the "then" callback if the request fails', async () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      headers: new Headers(),
      json: () => Promise.resolve(),
    }),
  )
  const onSuccess = vi.fn()
  const onError = vi.fn()

  try {
    await Http.auth().put('/foo').then(onSuccess).catch(onError)
  } catch {
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  }
})
