import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import { AppConfig } from 'config'
import { func, string } from 'prop-types'

import {
  ADDRESS_ACCURACY,
  AddressConfirmationModal,
  AddressMetrics,
  AddressOutOfDeliveryException,
  AddressOutOfDeliveryModal,
  AddressWrongPostalCodeModal,
  CoordinatesOutsideAllowedCountryException,
  CoordinatesOutsideAllowedCountryModal,
  InaccurateAddressModal,
  PostalCodeWithoutServiceException,
  PostalCodeWithoutServiceModal,
  useAddressAccuracy,
  useAddressForward,
  useAddressSuggestion,
  useAddressValidation,
  useSaveAddress,
} from 'app/address'
import { useSession } from 'app/authentication'
import { DeliveryAreaClient } from 'app/delivery-area/client'
import { handleManagedError } from 'app/shared/exceptions'
import { FlowIdProvider, useFlowIdContext } from 'app/shared/flow-id'
import { AddressForm } from 'components/address-form'
import { FORM_MODE } from 'components/address-form/AddressForm'
import { Address } from 'domain/address'
import { PostalCode } from 'domain/postal-code'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import ScriptLoader from 'utils/script-loader'
import { clearPendingAction } from 'wrappers/feedback/actions'

const AddressFormContainerComponent = ({
  title,
  success,
  onConfirm,
  onClose,
  hasAddresses,
}) => {
  const { postalCode: onboardingCp } = useSession()
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const { flowId } = useFlowIdContext()

  const { saveAddress } = useSaveAddress()
  const { getAddressAccuracy } = useAddressAccuracy()
  const { getAddressSuggestion } = useAddressSuggestion()
  const { getAddressForward } = useAddressForward()
  const { getAddressValidation } = useAddressValidation()

  const flagAddressPostalCodeCorrection = useFlag(
    knownFeatureFlags.ADDRESS_POSTAL_CODE_CORRECTION,
  )

  const [addressFormData, setAddressFormData] = useState(() => ({
    address_suggestion: undefined,
    address_name: undefined,
    address_number: undefined,
    address_detail: undefined,
    postal_code: undefined,
    town: undefined,
    comments: undefined,
    latitude: null,
    longitude: null,
  }))
  const [isAddressEnteredManually, setIsAddressEnteredManually] =
    useState(false)

  const [formFlowMetric, setFormFlowMetric] = useState('autocomplete')

  const [addressFormErrors, setAddressFormErrors] = useState({})

  const [formMode, setFormMode] = useState(FORM_MODE.SINGLE)

  const [isConfirmDirectionModalVisible, setIsConfirmDirectionModalVisible] =
    useState(false)
  const [confirmDirectionModalBounds, setConfirmDirectionModalBounds] =
    useState(null)

  const [isInaccurateModalVisible, setIsInaccurateModalVisible] =
    useState(false)
  const [
    isCoordinatesOutsideAllowedCountryModalVisible,
    setIsCoordinatesOutsideAllowedCountryModalVisible,
  ] = useState(false)
  const [
    isAddressOutOfDeliveryModalVisible,
    setIsAddressOutOfDeliveryModalVisible,
  ] = useState(false)
  const [
    isPostalCodeWithoutServiceModalVisible,
    setIsPostalCodeWithoutServiceModalVisible,
  ] = useState(false)
  const [wrongPostalCodeModal, setWrongPostalCodeModal] = useState(null)

  const [state, setState] = useState({
    permanent_address: true,
    isGoogleMapsLoaded: false,
  })

  const loadGeocoder = async () => {
    await ScriptLoader.loadScript(
      'GoogleMaps',
      `https://maps.googleapis.com/maps/api/js?key=${AppConfig.GOOGLE_API_KEY}&language=${i18n.language}&libraries=places`,
    )

    setState((currentState) => ({
      ...currentState,
      isGoogleMapsLoaded: true,
    }))
  }

  useEffect(() => {
    loadGeocoder()
  }, [])

  useEffect(() => {
    if (isConfirmDirectionModalVisible) {
      AddressMetrics.addressMapView(
        flowId,
        {
          street: addressFormData.address_name,
          number: addressFormData.address_number,
          postalCode: addressFormData.postal_code,
          town: addressFormData.town,
        },
        formFlowMetric,
      )
    }
  }, [isConfirmDirectionModalVisible])

  const addressSaver = async (newAddress, omitCheck = false) => {
    let accuracyFlowMetric = formFlowMetric

    if (isAddressEnteredManually && !omitCheck) {
      const addressAccuracy = await getAddressAccuracy(newAddress)
      accuracyFlowMetric = addressAccuracy.flow
      setFormFlowMetric(addressAccuracy.flow)
      setConfirmDirectionModalBounds(addressAccuracy.bounds)

      if (
        addressAccuracy.accuracy === ADDRESS_ACCURACY.LOW ||
        addressAccuracy.accuracy === ADDRESS_ACCURACY.MEDIUM
      ) {
        dispatch(clearPendingAction())
        setIsInaccurateModalVisible(true)
        return
      }

      if (addressAccuracy.accuracy === ADDRESS_ACCURACY.HIGH) {
        newAddress.latitude = addressAccuracy.location.latitude
        newAddress.longitude = addressAccuracy.location.longitude

        if (
          flagAddressPostalCodeCorrection &&
          addressAccuracy.suggestedPostalCode
        ) {
          dispatch(clearPendingAction())
          setWrongPostalCodeModal({
            isOpen: true,
            address: {
              street: newAddress.street,
              number: newAddress.number,
              detail: newAddress.detail || '',
              suggestedPostalCode: addressAccuracy.suggestedPostalCode,
              town: newAddress.town,
            },
          })
          return
        }
      }
    }

    saveAddress(newAddress, {
      onSuccess(result) {
        AddressMetrics.addressSaved(
          newAddress.flowId,
          result?.id,
          accuracyFlowMetric,
        )
        success({
          ...result,
          detail: result.addressDetail,
        })
        dispatch(clearPendingAction())

        onConfirm?.()
      },
      async onError(error) {
        dispatch(clearPendingAction())

        await handleManagedError(error)
          .on(AddressOutOfDeliveryException, () =>
            setIsAddressOutOfDeliveryModalVisible(true),
          )
          .on(CoordinatesOutsideAllowedCountryException, () =>
            setIsCoordinatesOutsideAllowedCountryModalVisible(true),
          )
          .on(PostalCodeWithoutServiceException, () =>
            setIsPostalCodeWithoutServiceModalVisible(true),
          )
          .run()
      },
    })
  }

  const handleTrySubmit = async () => {
    const newAddress = Address.build({
      flowId,
      street: addressFormData.address_name,
      number: addressFormData.address_number,
      postalCode: addressFormData.postal_code,
      town: addressFormData.town,
      detail: addressFormData.address_detail,
      comments: addressFormData.comments,
      latitude: addressFormData.latitude,
      longitude: addressFormData.longitude,
    })

    AddressMetrics.addressFormSaveClick(newAddress, isAddressEnteredManually)
  }

  const handleSaveAddress = async (overridePostalCode) => {
    const newAddress = Address.build({
      flowId,
      street: addressFormData.address_name,
      number: addressFormData.address_number,
      postalCode: overridePostalCode ?? addressFormData.postal_code,
      town: addressFormData.town,
      detail: addressFormData.address_detail,
      comments: addressFormData.comments,
      latitude: addressFormData.latitude,
      longitude: addressFormData.longitude,
    })

    if (!flagAddressPostalCodeCorrection) {
      try {
        await DeliveryAreaClient.validate(newAddress.postalCode)
      } catch {
        dispatch(clearPendingAction())
        setIsPostalCodeWithoutServiceModalVisible(true)
        return
      }
    }

    await addressSaver(newAddress)
  }

  const onSuggestionSelect = async (suggestion) => {
    setFormMode(FORM_MODE.LOADING)

    const addressFromSuggestion = await getAddressSuggestion(suggestion.placeId)

    setIsAddressEnteredManually(false)
    setAddressFormErrors({})
    setAddressFormData((currentState) => ({
      ...currentState,
      address_name: addressFromSuggestion.street ?? '',
      address_number: addressFromSuggestion.number ?? '',
      town: addressFromSuggestion.town ?? '',
      postal_code: addressFromSuggestion.postalCode ?? '',
      comments: addressFromSuggestion.comments ?? '',
      latitude: addressFromSuggestion.latitude,
      longitude: addressFromSuggestion.longitude,
    }))

    AddressMetrics.addressFormView({
      flowId,
      streetName: addressFromSuggestion.street,
      streetNumber: addressFromSuggestion.number,
      postalCode: addressFromSuggestion.postalCode,
      town: addressFromSuggestion.town,
      comments: addressFromSuggestion.comments,
    })

    setFormMode(FORM_MODE.FULL)
  }

  const onManuallyAddressSelect = () => {
    setFormMode(FORM_MODE.LOADING)
    setIsAddressEnteredManually(true)
    setFormMode(FORM_MODE.FULL)
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setAddressFormData((currentState) => ({
      ...currentState,
      [name]: value,
    }))

    if (name === 'postal_code') {
      handleChangePostalCode(value)
    }
  }

  const handleInputBlur = (event) => {
    const { name } = event.target

    if (name === 'address_name') {
      if (!isAddressEnteredManually) {
        setIsAddressEnteredManually(true)
        AddressMetrics.addressManualModeActivated(flowId, {
          streetName: addressFormData.address_name,
        })
      }
    }

    if (name === 'address_number') {
      if (!isAddressEnteredManually) {
        setIsAddressEnteredManually(true)
        AddressMetrics.addressManualModeActivated(flowId, {
          streetNumber: addressFormData.address_number,
        })
      }
    }

    if (name === 'postal_code') {
      if (!isAddressEnteredManually) {
        setIsAddressEnteredManually(true)
        AddressMetrics.addressManualModeActivated(flowId, {
          zipCode: addressFormData.postal_code,
        })
      }
    }

    if (name === 'town') {
      if (addressFormData.town && isAddressEnteredManually) {
        AddressMetrics.manualAddressTownEdited(
          flowId,
          addressFormData.postal_code,
          addressFormData.town,
        )
      }

      if (!isAddressEnteredManually) {
        setIsAddressEnteredManually(true)
        AddressMetrics.addressManualModeActivated(flowId, {
          town: addressFormData.town,
        })
      }
    }
  }

  const fillTown = async (postalCode) => {
    const forward = await getAddressForward({ postalCode })

    if (forward?.town) {
      setAddressFormData((currentState) => ({
        ...currentState,
        town: forward.town,
      }))
      AddressMetrics.manualAddressTownFilled(flowId, postalCode, forward.town)
    }

    if (!forward?.town) {
      AddressMetrics.addressTownNotFoundWithPostalCode(flowId, postalCode)
    }
  }

  const handleChangePostalCode = (postalCodeValue) => {
    setAddressFormErrors((currentState) => ({
      ...currentState,
      postal_code: null,
    }))

    const isPostalCodeValid = PostalCode.isValidFormat(postalCodeValue)

    if (isPostalCodeValid) {
      fillTown(postalCodeValue)
      return
    }

    if (!isPostalCodeValid && postalCodeValue) {
      setAddressFormErrors((currentState) => ({
        ...currentState,
        postal_code: {
          message: 'validation_errors.wrong_pc_format',
          type: 'error',
        },
      }))
    }

    if (addressFormData.town) {
      setAddressFormData((currentState) => ({
        ...currentState,
        town: '',
      }))
    }
  }

  const handleSuggestionClear = () => {
    setAddressFormData((currentState) => ({
      ...currentState,
      address_suggestion: '',
    }))
  }

  const handleInaccurateAddressModal = () => {
    AddressMetrics.addressNotFoundModalClick(flowId)
    setIsInaccurateModalVisible(false)
    setIsConfirmDirectionModalVisible(true)
  }

  const handleConfirmationModalConfirm = async ({ address, zoomLevel }) => {
    const hasSelectedLocation = !!address.town && !!address.postal_code

    if (!flagAddressPostalCodeCorrection && address.postal_code) {
      try {
        await getAddressValidation({
          latitude: address.latitude,
          longitude: address.longitude,
          postalCode: address.postal_code,
        })
      } catch (error) {
        dispatch(clearPendingAction())

        await handleManagedError(error)
          .on(AddressOutOfDeliveryException, () =>
            setIsAddressOutOfDeliveryModalVisible(true),
          )
          .on(CoordinatesOutsideAllowedCountryException, () =>
            setIsCoordinatesOutsideAllowedCountryModalVisible(true),
          )
          .on(PostalCodeWithoutServiceException, () =>
            setIsPostalCodeWithoutServiceModalVisible(true),
          )
          .run()

        return
      }
    }

    const newAddress = Address.build({
      flowId,
      street: addressFormData.address_name,
      number: addressFormData.address_number,
      postalCode: address.postal_code || addressFormData.postal_code,
      town: address.town || addressFormData.town,
      detail: addressFormData.address_detail,
      comments: addressFormData.comments,
      latitude: address.latitude ?? addressFormData.latitude,
      longitude: address.longitude ?? addressFormData.longitude,
    })

    AddressMetrics.addressMapSaveClick(
      flowId,
      newAddress,
      hasSelectedLocation ? 'map' : 'form',
      zoomLevel,
      formFlowMetric,
    )
    await addressSaver(newAddress, true)
  }

  const handleGoBack = () => {
    setFormMode(FORM_MODE.SINGLE)
    setAddressFormData((currentState) => ({
      ...currentState,
      address_name: '',
      address_number: '',
      address_detail: '',
      postal_code: '',
      town: '',
      comments: '',
    }))
  }

  const handleAddressConfirmationModalPinChange = (pinLocation) =>
    AddressMetrics.addressMapPinDrop({
      flowId,
      userFlow: formFlowMetric,
      latitude: pinLocation.latitude,
      longitude: pinLocation.longitude,
      postalCode: pinLocation.postalCode,
      locality: pinLocation.town,
      zoomLevel: pinLocation.zoomLevel,
      continueButtonEnabled: true,
    })

  return (
    <>
      <AddressForm
        isGoogleMapsLoaded={state.isGoogleMapsLoaded}
        formMode={formMode}
        isAddressEnteredManually={isAddressEnteredManually}
        address={addressFormData}
        errors={addressFormErrors}
        title={title}
        hasAddresses={hasAddresses()}
        onInputChange={handleInputChange}
        onInputBlur={handleInputBlur}
        onSuggestionClear={handleSuggestionClear}
        onClose={onClose}
        onTrySubmit={handleTrySubmit}
        onSubmit={handleSaveAddress}
        onSuggestSelect={onSuggestionSelect}
        onManuallyAddressSelect={onManuallyAddressSelect}
        enteredManually={isAddressEnteredManually}
        onboardingCp={onboardingCp}
        onConfirm={() => {
          onConfirm?.() ?? AddressMetrics.addressAlertSaveButtonClick(flowId)
        }}
        onGoBack={handleGoBack}
      />

      {isInaccurateModalVisible && (
        <InaccurateAddressModal onClick={handleInaccurateAddressModal} />
      )}
      {isCoordinatesOutsideAllowedCountryModalVisible && (
        <CoordinatesOutsideAllowedCountryModal
          onClick={() =>
            setIsCoordinatesOutsideAllowedCountryModalVisible(false)
          }
        />
      )}
      {isAddressOutOfDeliveryModalVisible && (
        <AddressOutOfDeliveryModal
          onClick={() => setIsAddressOutOfDeliveryModalVisible(false)}
        />
      )}
      {isPostalCodeWithoutServiceModalVisible && (
        <PostalCodeWithoutServiceModal
          onClick={() => setIsPostalCodeWithoutServiceModalVisible(false)}
        />
      )}
      {wrongPostalCodeModal?.isOpen && (
        <AddressWrongPostalCodeModal
          {...wrongPostalCodeModal.address}
          onSave={() => {
            setAddressFormData((current) => ({
              ...current,
              postal_code: wrongPostalCodeModal.address.suggestedPostalCode,
            }))
            setWrongPostalCodeModal(null)
            handleSaveAddress(wrongPostalCodeModal.address.suggestedPostalCode)
          }}
          onEdit={() => {
            setWrongPostalCodeModal(null)
          }}
        />
      )}

      {isConfirmDirectionModalVisible && (
        <AddressConfirmationModal
          userFlow={formFlowMetric}
          defaultBounds={confirmDirectionModalBounds}
          onClose={() => {
            setIsConfirmDirectionModalVisible(false)
          }}
          onConfirm={handleConfirmationModalConfirm}
          onPinChange={handleAddressConfirmationModalPinChange}
        />
      )}
    </>
  )
}

const propTypes = {
  onClose: func,
  onConfirm: func,
  success: func,
  hasAddresses: func.isRequired,
  title: string,
}

export const AddressFormContainer = (props) => (
  <FlowIdProvider>
    <AddressFormContainerComponent {...props} />
  </FlowIdProvider>
)

AddressFormContainerComponent.propTypes = propTypes
AddressFormContainer.propTypes = propTypes
