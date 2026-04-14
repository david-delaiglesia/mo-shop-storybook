import { createPortal } from 'react-dom'
import { useHistory } from 'react-router-dom'

import AuthenticateUserLayout from 'authenticate-user/components/authenticate-user-layout'
import CheckUser from 'authenticate-user/components/check-user'
import CommercialImage from 'authenticate-user/components/commercial-image'
import { Login } from 'authenticate-user/components/login'
import PasswordRecovery from 'authenticate-user/components/password-recovery'
import SignUp from 'authenticate-user/components/sign-up'
import Modal from 'components/modal'
import { AuthenticateUserContainer } from 'containers/authenticate-user-container'
import { URL_PARAMS } from 'pages/paths'
import { Session } from 'services/session'

const SignInModal = () => {
  const { postalCode, uuid } = Session.get()
  const history = useHistory()
  const { location } = history
  const searchParams = new URLSearchParams(location.search)

  const closeModal = () => {
    searchParams.delete(URL_PARAMS.AUTHENTICATE_USER)
    history.push({
      pathname: location.pathname,
      search: searchParams.toString(),
    })
  }

  if (!searchParams.has(URL_PARAMS.AUTHENTICATE_USER)) {
    return null
  }

  if (!postalCode || uuid) {
    history.push({ pathname: location.pathname, search: '' })
  }

  return createPortal(
    <AuthenticateUserLayout>
      <Modal onClose={closeModal} isFocusDisabled>
        <CommercialImage />
        <AuthenticateUserContainer
          close={closeModal}
          checkUserComponent={CheckUser}
          signUpComponent={SignUp}
          loginComponent={Login}
          passwordRecoveryComponent={PasswordRecovery}
        />
      </Modal>
    </AuthenticateUserLayout>,
    document.getElementById('modal-info'),
  )
}

export { SignInModal }
