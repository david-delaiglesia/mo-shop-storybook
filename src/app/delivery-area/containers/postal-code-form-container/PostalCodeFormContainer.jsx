import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { updatePostalCode } from 'app/authentication/commands'
import { closeDeliveryArea } from 'app/delivery-area/actions'
import { DeliveryAreaClient } from 'app/delivery-area/client'
import PostalCodeForm from 'app/delivery-area/components/postal-code-form'
import { OLD_SHOP_LANGUAGES_ID, OLD_URL } from 'app/delivery-area/constants'
import {
  sendChangePostalCodeCancelClickMetrics,
  sendChangePostalCodeSaveClickMetrics,
} from 'app/delivery-area/metrics'
import { I18nClient } from 'app/i18n/client'
import {
  getDefaultValidation,
  getPostalCodeValidation,
  getUpdatedFormValidation,
} from 'utils/input-validators'
import { clearPendingAction } from 'wrappers/feedback/actions'

function PostalCodeFormContainer() {
  const [isLoading, setIsLoading] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)
  const [form, setForm] = useState({
    fields: {
      postalCode: {
        value: undefined,
        validation: getDefaultValidation(),
        getValidation: getPostalCodeValidation,
      },
    },
    isValid: false,
  })
  const postalCode = useSelector((state) => state.session.postalCode)
  const dispatch = useDispatch()

  useEffect(() => {
    setForm(getUpdatedFormValidation(form, 'postalCode', postalCode))
  }, [])

  async function onSave(event) {
    event.preventDefault()

    if (!form.isValid) {
      return
    }

    sendChangePostalCodeSaveClickMetrics(
      postalCode,
      form.fields.postalCode.value,
    )

    if (!isAvailable) {
      const currentLanguage = I18nClient.getCurrentLanguage()
      window.location.assign(OLD_URL + OLD_SHOP_LANGUAGES_ID[currentLanguage])
      return
    }

    const newPostalCode = form.fields.postalCode.value
    try {
      setIsLoading(true)
      await DeliveryAreaClient.update(newPostalCode)
      setIsLoading(false)
      dispatch(createThunk(updatePostalCode)(newPostalCode))
      dispatch(closeDeliveryArea())
    } catch {
      setIsLoading(false)
      setIsAvailable(false)
    } finally {
      dispatch(clearPendingAction())
    }
  }

  function closeDeliveryAreaDialog() {
    sendChangePostalCodeCancelClickMetrics()
    dispatch(closeDeliveryArea())
  }

  function onChange(event) {
    const { name, value } = event.target

    setForm(getUpdatedFormValidation(form, name, value))
    setIsAvailable(true)
  }

  return (
    <div className="postal-code-form-container">
      <PostalCodeForm
        onSave={onSave}
        onCancel={closeDeliveryAreaDialog}
        onSaveButtonText={
          isAvailable ? 'button.save' : 'commons.postal_code_form.old_shop'
        }
        form={form}
        available={isAvailable}
        onChange={onChange}
        isLoading={isLoading}
      />
    </div>
  )
}

export { PostalCodeFormContainer }
