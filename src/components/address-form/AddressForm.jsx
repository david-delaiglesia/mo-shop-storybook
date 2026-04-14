import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '../../components/button'
import { GeosuggestInputContainer } from '../../containers/geosuggest-input-container'
import Input from '../../system-ui/input'
import { TextArea } from '../../system-ui/text-area'
import { containsOnlySpaces } from '../../utils/strings'
import withBlockCancelActions from '../../wrappers/block-cancel-actions'
import classNames from 'classnames'
import { bool, func, number, oneOf, shape, string } from 'prop-types'
import { compose } from 'redux'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import { AddressMetrics } from 'app/address'
import { ADDRESS_ALERT_TYPE } from 'app/address/constants'
import { AddressFormAlertContainer } from 'app/address/containers/address-form-alert-container'
import { useFlowIdContext } from 'app/shared/flow-id'
import WaitingResponse from 'components/waiting-response'
import { PostalCode } from 'domain/postal-code'
import { useEventListener } from 'hooks/useEventListener'
import { useFeedback } from 'wrappers/feedback/useFeedback'

import './AddressForm.css'

const EXCLUDED_POSTAL_CODE = '46004'

const isIncompleteAlertType = (alertType) => {
  return (
    alertType === ADDRESS_ALERT_TYPE.NO_DETAILS ||
    alertType === ADDRESS_ALERT_TYPE.NO_FLOOR_DOOR ||
    alertType === ADDRESS_ALERT_TYPE.NO_STREET_NUMBER
  )
}

export const FORM_MODE = {
  SINGLE: 'SINGLE',
  FULL: 'FULL',
  LOADING: 'LOADING',
}

const AddressForm = ({
  title,
  address,
  errors,
  hasAddresses,
  isAddressEnteredManually,
  onClose,
  onGoBack,
  onManuallyAddressSelect,
  onSuggestionClear,
  onInputChange,
  onInputBlur,
  isGoogleMapsLoaded,
  onSuggestSelect,
  onboardingCp,
  onSubmit: onSubmitWithoutFeedback,
  onTrySubmit,
  formMode,
}) => {
  const { t } = useTranslation()
  const { flowId } = useFlowIdContext()
  const { isFeedbackActive, startFeedback: submitWithFeedback } = useFeedback({
    callback: onSubmitWithoutFeedback,
  })

  const [state, setState] = useState({
    showAlert: false,
    alertType: undefined,
  })

  const formReference = useRef()
  const addressCommentsRef = useRef()
  const addressNumberRef = useRef()
  const addressDetailRef = useRef()

  const handleKeyPress = (event) => {
    const { key, target } = event
    const isValidTarget =
      target !== addressCommentsRef.current && target.type !== 'button'
    const isActionAllowed = isValidTarget && !isSubmitDisabled

    if (key === 'Enter' && isActionAllowed) {
      handleSubmit()
    }
  }

  useEventListener('keypress', handleKeyPress, formReference.current)

  useEffect(() => {
    AddressMetrics.addressSearchView(flowId)
  }, [])

  const resetAlerts = () => {
    setState((currentState) => ({
      ...currentState,
      showAlert: false,
      alertType: undefined,
    }))
  }

  const toggleAlert = () => {
    if (state.showAlert) {
      resetAlerts()
      return
    }

    const alertType = getAlertType()

    setState((currentState) => ({
      ...currentState,
      showAlert: true,
      alertType,
    }))

    if (isIncompleteAlertType(alertType)) {
      AddressMetrics.addressAlertIncompleteView(flowId, {
        streetNumber: address.address_number,
        floorDoor: address.address_detail,
        alertOrigin: alertType,
      })
    }
  }

  const getAlertType = () => {
    const {
      address_number: number,
      address_detail: floorDoor,
      postal_code: currentCp,
    } = address

    const hasDetails = number || floorDoor
    const potentiallyWrongAddress =
      onboardingCp !== EXCLUDED_POSTAL_CODE &&
      currentCp !== onboardingCp &&
      !hasAddresses

    if (!hasDetails) {
      return ADDRESS_ALERT_TYPE.NO_DETAILS
    }

    if (!number) {
      return ADDRESS_ALERT_TYPE.NO_STREET_NUMBER
    }

    if (potentiallyWrongAddress) {
      return ADDRESS_ALERT_TYPE.WRONG_TOWN
    }

    return ADDRESS_ALERT_TYPE.NO_FLOOR_DOOR
  }

  const handleAlertConfirm = () => {
    resetAlerts()

    if (isIncompleteAlertType(alertType)) {
      AddressMetrics.addressAlertIncompleteSaveClick(flowId)
    }

    submitWithFeedback()
  }

  const handleAlertCancel = () => {
    resetAlerts()

    if (isIncompleteAlertType(alertType)) {
      AddressMetrics.addressAlertIncompleteEditClick(flowId)
    }

    if (
      state.alertType === ADDRESS_ALERT_TYPE.NO_DETAILS ||
      state.alertType === ADDRESS_ALERT_TYPE.NO_STREET_NUMBER
    ) {
      addressNumberRef.current?.focus()
    }

    if (state.alertType === ADDRESS_ALERT_TYPE.NO_FLOOR_DOOR) {
      addressDetailRef.current?.focus()
    }
  }

  const isSubmitDisabled = useMemo(() => {
    const { address_name, postal_code, town } = address
    const hasRequiredFields = address_name && postal_code && town
    const isPostalCodeValid = PostalCode.isValidFormat(postal_code)
    const hasValidForm =
      hasRequiredFields &&
      !containsOnlySpaces(address_name) &&
      isPostalCodeValid

    return !hasValidForm
  }, [address.address_name, address.postal_code, address.town])

  const handleSubmit = () => {
    if (isFeedbackActive) {
      return
    }

    onTrySubmit()

    const showAlert =
      !address.address_number ||
      !address.address_detail ||
      (onboardingCp !== EXCLUDED_POSTAL_CODE &&
        address.postal_code !== onboardingCp &&
        !hasAddresses)

    if (showAlert) {
      return toggleAlert()
    }

    submitWithFeedback()
  }

  const { showAlert, alertType } = state
  const {
    address_suggestion,
    address_name,
    address_number,
    address_detail,
    postal_code,
    town,
  } = address

  return (
    <div className="address-form" ref={formReference}>
      {title && (
        <FocusedElementWithInitialFocus>
          <p className="address-form__title">{t(title)}</p>
        </FocusedElementWithInitialFocus>
      )}
      <div
        className={classNames('address-form__content', {
          'address-form__content--single': formMode === FORM_MODE.SINGLE,
          'address-form__content--full': formMode === FORM_MODE.FULL,
          'address-form__content--loading': formMode === FORM_MODE.LOADING,
        })}
      >
        <div className="address-form__data">
          {formMode === FORM_MODE.SINGLE && (
            <div className="address-form__address">
              {isGoogleMapsLoaded && (
                <GeosuggestInputContainer
                  inputValue={address_suggestion}
                  inputName="address_suggestion"
                  label="input.address_suggestion"
                  maxLength={100}
                  onChange={onInputChange}
                  onBlur={onInputBlur}
                  onSuggestSelect={onSuggestSelect}
                  onManuallyAddressSelect={onManuallyAddressSelect}
                  onClear={onSuggestionClear}
                />
              )}
            </div>
          )}

          {formMode === FORM_MODE.FULL && (
            <>
              <div className="address-form__address">
                <Input
                  name="address_name"
                  inputId="address_name"
                  label="input.address"
                  value={address_name}
                  onChange={onInputChange}
                  onBlur={onInputBlur}
                  autoComplete="off"
                  autoFocus={!address_name && !isAddressEnteredManually}
                  maxLength={100}
                />
              </div>
              <div className="address-form__group">
                <div className="address-form__address-number">
                  <Input
                    reference={addressNumberRef}
                    name="address_number"
                    inputId="address_number"
                    label="input.number"
                    datatest="address-number"
                    value={address_number}
                    onChange={onInputChange}
                    onBlur={onInputBlur}
                    autoComplete="off"
                    maxLength={10}
                  />
                </div>
                <div className="address-form__address-detail">
                  <Input
                    reference={addressDetailRef}
                    name="address_detail"
                    inputId="address_detail"
                    label="input.address_number"
                    datatest="address-detail"
                    value={address_detail}
                    onChange={onInputChange}
                    onBlur={onInputBlur}
                    autoComplete="off"
                    maxLength={40}
                  />
                </div>
              </div>
              <div className="address-form__group">
                <div className="address-form__postal-code">
                  <Input
                    name="postal_code"
                    inputId="postal_code"
                    label="input.postal_code"
                    datatest="address-postal-code"
                    value={postal_code}
                    onChange={onInputChange}
                    onBlur={onInputBlur}
                    maxLength={5}
                    autoComplete="off"
                    validation={errors.postal_code}
                  />
                </div>
                <div className="address-form__town">
                  <Input
                    name="town"
                    inputId="town"
                    label="input.town"
                    datatest="address-town"
                    value={town}
                    onChange={onInputChange}
                    onBlur={onInputBlur}
                    autoComplete="off"
                    maxLength={85}
                  />
                </div>
              </div>
              <div className="address-form__address-comments">
                <TextArea
                  value={address.comments}
                  maxLength={250}
                  rows={3}
                  name="comments"
                  input_id="comments"
                  label="input.address_comments"
                  onChange={onInputChange}
                  onBlur={onInputBlur}
                  reference={addressCommentsRef}
                  t={t}
                />
              </div>
            </>
          )}

          {formMode === FORM_MODE.LOADING && <WaitingResponse />}
        </div>
      </div>

      <div className="address-form__buttons">
        {formMode === FORM_MODE.SINGLE && hasAddresses && (
          <Button
            text="button.cancel"
            type="secondary"
            onClick={onClose}
            datatest="cancel-address-form"
          />
        )}

        {formMode === FORM_MODE.FULL && (
          <Button
            text="button.go_back"
            type="secondary"
            onClick={onGoBack}
            disabled={isFeedbackActive}
          />
        )}
        <Button
          className="address-form__save-button"
          text="button.save_changes"
          datatest="save-address-form"
          disabled={isSubmitDisabled}
          onClick={handleSubmit}
          activeFeedback={isFeedbackActive}
        />
      </div>

      {showAlert && (
        <AddressFormAlertContainer
          alertType={alertType}
          onCancel={handleAlertCancel}
          onConfirm={handleAlertConfirm}
          town={address.town}
        />
      )}
    </div>
  )
}

AddressForm.propTypes = {
  title: string,
  onSubmit: func.isRequired,
  onTrySubmit: func.isRequired,
  onClose: func,
  onGoBack: func,
  onInputChange: func.isRequired,
  onInputBlur: func,
  onSuggestSelect: func.isRequired,
  onManuallyAddressSelect: func.isRequired,
  onSuggestionClear: func.isRequired,
  address: shape({
    address_name: string,
    address_number: string,
    address_detail: string,
    address_comments: string,
    postal_code: string,
    id: number,
  }).isRequired,
  errors: shape({
    postal_code: string,
  }),
  hasAddresses: bool.isRequired,
  isAddressEnteredManually: bool,
  isGoogleMapsLoaded: bool.isRequired,
  onboardingCp: string.isRequired,
  formMode: oneOf(Object.values(FORM_MODE)),
}

const ComposedAddressForm = compose(withBlockCancelActions)(AddressForm)

export { ComposedAddressForm as AddressForm }
