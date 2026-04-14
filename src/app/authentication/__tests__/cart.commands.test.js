import { actionTypes } from '../actions'
import {
  login,
  logout,
  register,
  updateDeliveryArea,
  updatePostalCode,
} from '../commands'
import { vi } from 'vitest'

import * as CartActions from 'app/cart/actions'
import * as CartCommands from 'app/cart/commands'
import { Cookie } from 'services/cookie'
import { Session } from 'services/session'
import { Support } from 'services/support'
import { Tracker } from 'services/tracker'

describe('Authentication Commands', () => {
  const store = {
    dispatch: vi.fn(),
  }

  const user = {}

  beforeEach(() => {
    store.dispatch.mockClear()
    vi.spyOn(CartCommands, 'getFromStoreAndUpdateCart').mockImplementation()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('updateDeliveryArea', () => {
    const warehouse = 'vlc1'
    const postalCode = '46021'

    beforeEach(() => {
      Cookie.get = vi.fn().mockReturnValue({ postalCode })
    })

    it('should update the session', () => {
      updateDeliveryArea({ warehouse, postalCode }, { dispatch: vi.fn() })

      const session = Session.get()
      expect(session.warehouse).toEqual(warehouse)
      expect(session.postalCode).toEqual(postalCode)
      expect(Tracker.setUserProperties).toHaveBeenCalledWith({ warehouse })
      expect(Tracker.setUserProperties).toHaveBeenCalledWith({
        postal_code: postalCode,
      })
    })
  })

  describe('updatePostalCode', () => {
    const postalCode = '28025'

    beforeEach(() => {
      Cookie.get = vi.fn().mockReturnValue({ postalCode })
    })

    it('should update the session', () => {
      updatePostalCode(postalCode, { dispatch: vi.fn() })

      const session = Session.get()
      expect(session.postalCode).toEqual(postalCode)
    })
  })

  describe('register', () => {
    const auth = { uuid: '04ec648a-bae9-4a99-b769-9c342e393f7c' }

    it('should create the session', () => {
      Session.saveUser = vi.fn()

      register(user, auth, store)

      const loginAction = expect.objectContaining({
        type: actionTypes.CREATE_SESSION,
      })
      expect(Session.saveUser).toHaveBeenCalledWith(
        expect.objectContaining(auth),
      )
      expect(store.dispatch).toHaveBeenCalledWith(loginAction)
    })

    it('should save the logged user', () => {
      register(user, auth, store)

      const setLoggedUserAction = expect.objectContaining({
        type: 'SET_LOGGED_USER',
      })
      expect(store.dispatch).toHaveBeenCalledWith(setLoggedUserAction)
    })

    it('should retrieve the cart', async () => {
      await register(user, auth, store)

      expect(CartCommands.getFromStoreAndUpdateCart).toHaveBeenCalled()
    })
  })

  // TODO upgrading to node 16 broke this step
  describe('login', () => {
    const store = {
      dispatch: vi.fn(),
      getState: vi
        .fn()
        .mockReturnValue({ cart: { products: [] }, session: {} }),
    }
    it.skip('should update the session', () => {
      login(user, store)

      const loginAction = expect.objectContaining({
        type: actionTypes.CREATE_SESSION,
      })
      expect(store.dispatch).toHaveBeenCalledWith(loginAction)
    })

    it.skip('should save the logged user', () => {
      login(user, store)

      const setLoggedUserAction = expect.objectContaining({
        type: 'SET_LOGGED_USER',
      })
      expect(store.dispatch).toHaveBeenCalledWith(setLoggedUserAction)
    })
  })

  describe('logout', () => {
    delete global.window.location
    global.window.location = {
      reload: vi.fn(),
    }

    it('should remove the session', () => {
      Session.remove = vi.fn()

      logout(store)

      const logoutAction = expect.objectContaining({
        type: actionTypes.REMOVE_SESSION,
      })
      expect(Session.remove).toHaveBeenCalled()
      expect(store.dispatch).toHaveBeenCalledWith(logoutAction)
    })

    it('should remove the logged user', () => {
      logout(store)

      const setLoggedUserAction = expect.objectContaining({
        type: 'REMOVE_LOGGED_USER',
      })
      expect(store.dispatch).toHaveBeenCalledWith(setLoggedUserAction)
    })

    it('should clean the cart', () => {
      const mockClearCart = vi.fn()
      vi.spyOn(CartActions, 'clearCart').mockImplementation(() => {
        return mockClearCart()
      })

      logout(store)

      expect(mockClearCart).toHaveBeenCalled()
    })

    it('should logout from zendesk', () => {
      logout(store)

      expect(Support.logout).toHaveBeenCalled()
    })
  })
})
