import { DeliveryAreaClient } from '../client'
import { vi } from 'vitest'

import { HttpWithErrorHandler } from 'services/http'

describe('DeliveryAreaClient', () => {
  const postalCode = '46001'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('update method', () => {
    beforeEach(() => {
      HttpWithErrorHandler.put = vi.fn()
    })

    it('should check if it is a valid postal code', async () => {
      const expectedPath = '/postal-codes/actions/change-pc/'
      const body = JSON.stringify({ new_postal_code: postalCode })
      const expectedOptions = { body, shouldCatchErrors: false }

      await DeliveryAreaClient.update(postalCode)

      expect(HttpWithErrorHandler.put).toHaveBeenCalledWith(
        expectedPath,
        expectedOptions,
      )
    })
  })

  describe('validate method', () => {
    beforeEach(() => {
      HttpWithErrorHandler.auth().get = vi.fn()
    })

    it('should update the postal code', async () => {
      const expectedPath = `/postal-codes/actions/retrieve-pc/${postalCode}/`
      const expectedOptions = { shouldCatchErrors: false }

      await DeliveryAreaClient.validate(postalCode)

      expect(HttpWithErrorHandler.auth().get).toHaveBeenCalledWith(
        expectedPath,
        expectedOptions,
      )
    })
  })

  describe('anonymousUpdate method', () => {
    beforeEach(() => {
      HttpWithErrorHandler.put = vi.fn()
    })

    it('should update the postal code of an anonymous user', async () => {
      const expectedPath = '/postal-codes/actions/change-pc/'
      const body = JSON.stringify({ new_postal_code: postalCode })
      const expectedOptions = expect.objectContaining({
        body,
        shouldCatchErrors: false,
      })

      await DeliveryAreaClient.anonymousUpdate(postalCode)

      expect(HttpWithErrorHandler.put).toHaveBeenCalledWith(
        expectedPath,
        expectedOptions,
      )
    })
  })
})
