import { createSession } from 'app/authentication/actions'
import { AuthClient } from 'app/authentication/client'
import { updatePostalCode } from 'app/authentication/commands'
import { setLoggedUser } from 'app/user/actions'
import { Session } from 'services/session'
import { Support } from 'services/support'
import { Tracker } from 'services/tracker'

class DEPRECATED_Session {
  static async setInitialState(store) {
    const { postalCode, uuid } = Session.get()

    if (postalCode) {
      updatePostalCode(postalCode, store)
    }

    if (!uuid) {
      return Session.remove()
    }

    try {
      const user = await AuthClient.getUserData(uuid)
      Support.identify(user)
      store.dispatch(createSession(user))
      store.dispatch(setLoggedUser(user))
      Tracker.identifyExistingUser(uuid)

      const token = Session.getToken()
      Session.saveUser({ uuid, token })
    } catch {
      Session.remove()
    }
  }
}

export default DEPRECATED_Session
