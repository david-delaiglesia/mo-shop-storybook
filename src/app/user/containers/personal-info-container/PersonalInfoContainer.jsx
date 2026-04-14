import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import PersonalInfo from '../../components/personal-info'
import { ChangeEmailModalContainer } from '../change-email-modal-container'
import ChangeFullNameModalContainer from '../change-full-name-modal-container'
import changePasswordImage from './assets/password-link@2x.png'

import { AuthClient, AuthMetrics } from 'app/authentication'
import { showAlert } from 'app/shared/alert/actions'
import { setAccountDeletionRequest } from 'app/user/actions'
import {
  sendChangeEmailClickMetrics,
  sendPersonalInfoViewMetrics,
} from 'app/user/metrics'

const PersonalInfoContainer = () => {
  const [isNameModalVisible, setIsNameModalVisible] = useState(false)
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false)
  const user = useSelector(({ user }) => user)
  const dispatch = useDispatch()

  useEffect(() => {
    sendPersonalInfoViewMetrics()
  }, [])

  const recoverPassword = async () => {
    const { email } = user
    const response = await AuthClient.recoverPassword({ email })
    if (!response) {
      return
    }

    showResetPasswordModal()
  }

  const accountRemovalRequest = async () => {
    dispatch(setAccountDeletionRequest())
    const response = await AuthClient.removalRequest(user.uuid)

    if (!response) {
      return
    }
  }

  const toggleNameModalVisibility = () => {
    setIsNameModalVisible(!isNameModalVisible)
  }

  const toggleEmailModalVisibility = () => {
    sendChangeEmailClickMetrics(user.email)
    setIsEmailModalVisible(!isEmailModalVisible)
  }

  const showResetPasswordModal = () => {
    AuthMetrics.resetPasswordRequestClick()
    const alertOptions = {
      title: 'alerts.reset_password.title',
      description: {
        key: 'alerts.reset_password.message',
        interpolation: { email: user.email },
      },
      imageSrc: changePasswordImage,
      primaryActionText: 'alerts.reset_password.confirm_button',
    }
    dispatch(showAlert(alertOptions))
  }

  if (!user.email) {
    return null
  }

  return (
    <div>
      <PersonalInfo
        user={user}
        onChangeFullNameButtonClick={toggleNameModalVisibility}
        onChangeEmailButtonClick={toggleEmailModalVisibility}
        onResetPasswordButtonClick={recoverPassword}
        onRequestAccountRemoval={accountRemovalRequest}
      />
      {isNameModalVisible && (
        <ChangeFullNameModalContainer
          onClose={toggleNameModalVisibility}
          user={user}
        />
      )}
      {isEmailModalVisible && (
        <ChangeEmailModalContainer onClose={toggleEmailModalVisibility} />
      )}
    </div>
  )
}

export { PersonalInfoContainer }
