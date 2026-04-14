import { AuthClient } from '../client'

import { user } from 'app/user/__scenarios__/user'
import { HttpWithErrorHandler } from 'services/http'

describe('AuthClient', () => {
  describe('updateContactInfo method', () => {
    beforeEach(() => {
      HttpWithErrorHandler.post = vi.fn(() =>
        Promise.resolve({ auth: {}, customer: user }),
      )
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should update the customer contact info of an order', () => {
      const userInfo = {
        name: 'Aurelia',
        last_name: 'Paucek',
        password: 'fake-password',
        email: 'Fae_Wuckert@hotmail.com',
        current_postal_code: '58058',
      }
      const expectedPath = '/customers/actions/create_and_authenticate/'
      const expectedOptions = {
        body: JSON.stringify(userInfo),
        shouldCatchErrors: false,
      }

      AuthClient.register(userInfo)

      expect(HttpWithErrorHandler.post).toHaveBeenCalledWith(
        expectedPath,
        expectedOptions,
      )
    })
  })
})
