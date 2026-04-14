import { vi } from 'vitest'

const headers = new Map()
headers.set('Content-Type', 'application/json')

const mockedHttpResponse = {
  headers,
  body: null,
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue({}),
}

delete global.window.fetch
global.window.fetch = vi.fn().mockResolvedValue(mockedHttpResponse)
