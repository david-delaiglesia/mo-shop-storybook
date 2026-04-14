import { AddressClient } from '../client'
import { mockedAddresses } from './addresses.mock'

import { HttpWithErrorHandler } from 'services/http'

describe('AddressClient', () => {
  const userId = '07cc5a97-41a4-40a2-88bb-22c154b45784'

  beforeEach(() => {
    HttpWithErrorHandler.auth().patch = vi.fn()
    HttpWithErrorHandler.auth().get = vi.fn(() =>
      Promise.resolve(mockedAddresses),
    )
  })

  describe('makeDefault', () => {
    it('should make the address of user the default one', () => {
      const addressId = 12
      const expectedPath = `/customers/${userId}/addresses/${addressId}/make_default/`

      AddressClient.makeDefault(userId, addressId)

      expect(HttpWithErrorHandler.auth().patch).toHaveBeenCalledWith(
        expectedPath,
      )
    })
  })

  describe('getListByUserId', () => {
    it('should get all the address of the user', () => {
      const expectedPath = `/customers/${userId}/addresses/`

      AddressClient.getListByUserId(userId)

      expect(HttpWithErrorHandler.auth().get).toHaveBeenCalledWith(expectedPath)
    })
  })
})
