import { useEffect, useState } from 'react'

import SettingsCell from '../settings-cell'
import { func, shape, string } from 'prop-types'

import { Checkbox } from '@mercadona/mo.library.shop-ui/checkbox'
import { MediumModal } from '@mercadona/mo.library.shop-ui/modal'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import {
  sendAccountRemovalRequestClick,
  sendAccountRemovalRequestConfirmationView,
  sendAccountRemovalRequestSwitchClick,
  sendAccountRemovalRequestView,
} from 'app/user/metrics'
import { useUserDeletionRequest } from 'app/user/selectors'
import alertImage from 'system-ui/assets/img/default-alert@2x.png'
import mailImage from 'system-ui/assets/img/mail@2x.png'

import './assets/PersonalInfo.css'

const PersonalInfo = (props) => {
  const {
    user,
    onChangeFullNameButtonClick,
    onChangeEmailButtonClick,
    onResetPasswordButtonClick,
    onRequestAccountRemoval,
    t,
  } = props
  const hasRequestedAccountDeletion = useUserDeletionRequest()
  const [isDeleteCheckboxSelected, setIsDeleteCheckboxSelected] =
    useState(false)
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false)
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false)

  const mood = isDeleteCheckboxSelected ? 'destructive' : 'positive'
  const warningModalProps = {
    imageSrc: alertImage,
    title: t('user_area.personal_info.warning_modal.title'),
    description: t('user_area.personal_info.warning_modal.description'),
    primaryActionText: t('user_area.personal_info.warning_modal.delete_button'),
    disabled: !isDeleteCheckboxSelected,
    mood,
    primaryAction: () => {
      setIsWarningModalVisible(false)
      onRequestAccountRemoval()
      sendAccountRemovalRequestClick()
      setIsConfirmationModalVisible(true)
    },
    secondaryActionText: t(
      'user_area.personal_info.warning_modal.cancel_button',
    ),
    secondaryAction: () => {
      setIsWarningModalVisible(false)
      setIsDeleteCheckboxSelected(false)
    },
    hideModal: () => null,
  }
  const confirmationModalProps = {
    imageSrc: mailImage,
    title: t('user_area.personal_info.delete_account_modal.title'),
    description: t('user_area.personal_info.delete_account_modal.description'),
    primaryActionText: t('user_area.personal_info.delete_account_modal.button'),
    primaryAction: () => {
      setIsConfirmationModalVisible(false)
      setIsDeleteCheckboxSelected(false)
    },
    hideModal: () => null,
  }

  useEffect(() => {
    if (isWarningModalVisible) {
      sendAccountRemovalRequestView()
    }
  }, [isWarningModalVisible])

  useEffect(() => {
    if (isDeleteCheckboxSelected) {
      sendAccountRemovalRequestSwitchClick()
    }
  }, [isDeleteCheckboxSelected])

  useEffect(() => {
    if (isConfirmationModalVisible) {
      sendAccountRemovalRequestConfirmationView()
    }
  }, [isConfirmationModalVisible])

  return (
    <div className="personal-info">
      <FocusedElementWithInitialFocus>
        <h1 className="personal-info__header title1-b">
          {t('user_area.personal_info.title')}
        </h1>
      </FocusedElementWithInitialFocus>
      <ul>
        <SettingsCell
          title={t('user_area.personal_info.name.label')}
          description={t('user_area.personal_info.name.description')}
          value={`${user.name} ${user.last_name}`}
          actionName={t('button.edit')}
          onClick={onChangeFullNameButtonClick}
          datatest="edit-full-name"
        />
        <SettingsCell
          title={t('user_area.personal_info.email.label')}
          description={t('user_area.personal_info.email.description')}
          value={user.email}
          actionName={t('button.edit')}
          onClick={onChangeEmailButtonClick}
          datatest="edit-email"
        />
        <SettingsCell
          title={t('user_area.personal_info.password.label')}
          description={t('user_area.personal_info.password.description')}
          actionName={t('button.edit')}
          onClick={onResetPasswordButtonClick}
          datatest="edit-password"
        />
        <SettingsCell
          title={t('user_area.personal_info.delete_account.label')}
          description={t('user_area.personal_info.delete_account.description')}
          alternativeDescription={t(
            'user_area.personal_info.delete_account.warning_label',
          )}
          hasWarningText={hasRequestedAccountDeletion}
          actionName={t('button.delete')}
          mood="destructive"
          onClick={() => setIsWarningModalVisible(true)}
        />
        {isWarningModalVisible && (
          <MediumModal {...warningModalProps}>
            <label className="personal-info__warning-modal__checkbox-label">
              <Checkbox
                label={t('commons.policy_terms.text')}
                onChange={() =>
                  setIsDeleteCheckboxSelected(!isDeleteCheckboxSelected)
                }
                checked={isDeleteCheckboxSelected}
              />
              <p className="personal-info__warning-modal__checkbox-text">
                {t('user_area.personal_info.warning_modal.checkbox.label')}
              </p>
            </label>
          </MediumModal>
        )}
        {isConfirmationModalVisible && (
          <MediumModal {...confirmationModalProps} />
        )}
      </ul>
    </div>
  )
}

PersonalInfo.propTypes = {
  user: shape({
    name: string.isRequired,
    last_name: string.isRequired,
    email: string.isRequired,
  }).isRequired,
  onChangeFullNameButtonClick: func.isRequired,
  onChangeEmailButtonClick: func.isRequired,
  onResetPasswordButtonClick: func.isRequired,
  onRequestAccountRemoval: func.isRequired,
  t: func.isRequired,
}

export const PlainPersonalInfo = PersonalInfo

export default withTranslate(PersonalInfo)
