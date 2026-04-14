import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import { Card } from '@mercadona/mo.library.shop-ui/card'

import { useAccessibilityFeedback } from 'app/accessibility'
import { useAddresses } from 'app/address'
import { AddressClient } from 'app/address/client'
import { AddressEmptyCTA } from 'app/address/components/address-empty-cta'
import { AddressList } from 'app/address/components/address-list'
import { AddressFormContainer } from 'app/address/containers/address-form-container'
import { AddressMetrics } from 'app/address/metrics'
import { useSession } from 'app/authentication'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import AddElement from 'app/user/components/add-element'
import WaitingResponse from 'components/waiting-response'
import { clearPendingAction } from 'wrappers/feedback/actions'

export const AddressListContainer = () => {
  const { uuid: customerId } = useSession()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { setFeedbackText } = useAccessibilityFeedback()

  const { addresses, hasAddresses, isLoading, refetchAddresses } =
    useAddresses()
  const [openAddressForm, setOpenAddressForm] = useState(false)

  const setPermanentAddress = async (addressId) => {
    const address = addresses.find((address) => address.id === addressId)
    AddressMetrics.makeDefaultAddressClick(address)

    await AddressClient.makeDefault(customerId, addressId)

    dispatch(clearPendingAction())
    await refetchAddresses()
  }

  const deleteAddress = async (addressIdToDelete) => {
    const address = addresses.find(
      (address) => address.id === addressIdToDelete,
    )
    AddressMetrics.deleteAddressClick(address)

    await AddressClient.remove(customerId, addressIdToDelete)
    setFeedbackText(t('user_area.addresses.delete_address_success'))
    await refetchAddresses()

    dispatch(hideAlert())
    dispatch(clearPendingAction())
  }

  const openDeleteAddressAlert = (addressIdToDelete) => {
    dispatch(
      showAlert({
        mood: 'destructive',
        title: 'alerts.delete_address.title',
        description: 'alerts.delete_address.message',
        confirmButtonText: 'button.delete',
        confirmButtonAction: () => deleteAddress(addressIdToDelete),
        secondaryActionText: 'button.cancel',
        secondaryAction: () => dispatch(hideAlert()),
        handleLoading: true,
      }),
    )
  }

  const openForm = () => {
    setOpenAddressForm(true)
  }

  const closeForm = () => {
    setOpenAddressForm(false)
  }

  if (isLoading) {
    return (
      <div className="address-list__loader">
        <WaitingResponse />
      </div>
    )
  }

  if (!hasAddresses && !openAddressForm) {
    return <AddressEmptyCTA onClick={openForm} />
  }

  return (
    <Fragment>
      {!openAddressForm && (
        <Fragment>
          <h2 className="address-list__title subhead1-b">
            {t('user_area.addresses.selected_address.title')}
          </h2>
          <AddElement
            onClick={openForm}
            text={'user_area.addresses.add_address'}
          />
        </Fragment>
      )}
      {openAddressForm && (
        <Card status={Card.STATUSES.ACTIVE}>
          <AddressFormContainer
            title="user_area.addresses.empty_message"
            showMargins={true}
            userUuid={customerId}
            success={refetchAddresses}
            hasAddresses={() => hasAddresses}
            onConfirm={closeForm}
            onClose={closeForm}
            addresses={addresses}
          />
        </Card>
      )}

      <AddressList
        addresses={addresses}
        onPermanentAddress={setPermanentAddress}
        onDeleteAddress={openDeleteAddressAlert}
      />
    </Fragment>
  )
}
