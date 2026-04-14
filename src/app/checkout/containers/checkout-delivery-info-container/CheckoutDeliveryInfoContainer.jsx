import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { func } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { AddressNotInWarehouseException } from 'app/address'
import { AddressClient } from 'app/address/client'
import { getCartAndSaveInStore } from 'app/cart/commands'
import { getCart } from 'app/cart/selectors'
import { BlinkingProductModal } from 'app/catalog/components/blinking-product-modal'
import { CART_MODE } from 'app/catalog/metrics'
import { CheckoutClient } from 'app/checkout/client'
import { CheckoutAddressNotInWarehouseModal } from 'app/checkout/components/checkout-address-not-in-warehouse-modal'
import { CheckoutSlotNotAvailableModal } from 'app/checkout/components/checkout-slot-not-available-modal'
import { useCheckoutContext } from 'app/checkout/contexts/CheckoutContext'
import { useCheckoutSlotResetContext } from 'app/checkout/contexts/CheckoutSlotResetContext'
import {
  SlotNotBookedException,
  SlotTakenException,
} from 'app/checkout/exceptions'
import { OrderDelivery } from 'app/order/components/order-delivery'
import { handleManagedError } from 'app/shared/exceptions'
import {
  sendContinueUnavailableDayProductAlert,
  sendPickAnotherDayUnavailableDayProductAlert,
  sendUnavailableDayProductAlertViewMetrics,
} from 'app/shared/metrics'
import { useUserState } from 'app/user/selectors'
import { ProductService } from 'domain/product/'
import { cancelCheckout } from 'pages/create-checkout/actions'
import { PATHS } from 'pages/paths'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { clearPendingAction } from 'wrappers/feedback/actions'

const CheckoutDeliveryInfoContainer = ({
  incrementEditMode,
  decrementEditMode,
}) => {
  const { t } = useTranslation()
  const flagCheckoutSlotNotAvailable = useFlag(
    knownFeatureFlags.CHECKOUT_SLOT_NOT_AVAILABLE,
  )
  const flagCheckoutAddressNotInWarehouse = useFlag(
    knownFeatureFlags.CHECKOUT_ADDRESS_NOT_IN_WAREHOUSE,
  )

  const history = useHistory()
  const { checkout, refetchCheckout } = useCheckoutContext()
  const { slotResetRequested, clearSlotReset } = useCheckoutSlotResetContext()
  const [isEditing, setEditMode] = useState(false)
  const [selectedSlot, selectSlot] = useState(checkout.slot)
  const [selectedDay, selectDay] = useState()
  const [selectedAddress, setSelectedAddress] = useState({})
  const [blinkingProductsList, setBlinkingProductsList] = useState([])
  const session = useSelector((state) => state.session)
  const user = useUserState()
  const cart = useSelector(getCart)
  const dispatch = useDispatch()

  const [showSlotNotAvailableModal, setShowSlotNotAvailableModal] =
    useState(false)
  const [showAddressNotInWarehouseModal, setShowAddressNotInWarehouseModal] =
    useState(false)

  useEffect(() => {
    if (!checkout.address || !checkout.slot) {
      setEditMode(true)
      manageSectionsInEditMode(true)
    }
  }, [])

  useEffect(() => {
    if (!slotResetRequested) return
    selectSlot(null)
    setSectionAsIsEditing(true)
    clearSlotReset()
  }, [slotResetRequested])

  useEffect(() => {
    if (!selectedDay) return
    checkBlinkingProducts(selectedDay)
  }, [selectedDay])

  const confirmAddress = async (address) => {
    await AddressClient.makeDefault(session.uuid, address.id)
    refetchCheckout()
    setSelectedAddress(address)
    selectSlot(null)
  }

  const confirmSlot = async () => {
    setEditMode(false)
    manageSectionsInEditMode(false)

    try {
      const deliveryInfo = { address: selectedAddress, slot: selectedSlot }
      await CheckoutClient.updateDeliveryInfo(
        session.uuid,
        checkout.id,
        deliveryInfo,
      )

      refetchCheckout()
    } catch (error) {
      const errorHandler = handleManagedError(error)

      if (flagCheckoutSlotNotAvailable) {
        errorHandler
          .on(SlotNotBookedException, () => setShowSlotNotAvailableModal(true))
          .on(SlotTakenException, () => setShowSlotNotAvailableModal(true))
      }

      if (flagCheckoutAddressNotInWarehouse) {
        errorHandler.on(AddressNotInWarehouseException, () =>
          setShowAddressNotInWarehouseModal(true),
        )
      }

      await errorHandler.run()
      selectSlot(null)
      setEditMode(true)
      manageSectionsInEditMode(true)
    } finally {
      dispatch(clearPendingAction())
    }
  }

  const setSectionAsIsEditing = (isEditing) => {
    setEditMode(isEditing)
    manageSectionsInEditMode(isEditing)
  }

  const manageSectionsInEditMode = (isEditing) => {
    if (isEditing) {
      return incrementEditMode()
    }
    decrementEditMode()
  }

  function checkBlinkingProducts(day) {
    const blinkingProducstMatchList =
      ProductService.getBlinkingProductsDayMatch(checkout.cart.products, day)

    setBlinkingProductsList(blinkingProducstMatchList)

    if (blinkingProducstMatchList.length) {
      const blinkingProductsIdsList = blinkingProducstMatchList.map(
        ({ product }) => product.id,
      )

      sendUnavailableDayProductAlertViewMetrics(
        cart.id,
        blinkingProductsIdsList,
        day,
        CART_MODE.PURCHASE,
      )
    }
  }

  function pickAnotherDayForBlinkingProducts() {
    const blinkingProductsIdsList = blinkingProductsList.map(
      ({ product }) => product.id,
    )

    setBlinkingProductsList([])
    selectDay()
    sendPickAnotherDayUnavailableDayProductAlert(
      cart.id,
      blinkingProductsIdsList,
      selectedDay,
      CART_MODE.PURCHASE,
    )
  }

  async function confirmRemoveBlinkingProducts() {
    const blinkingProductsIdsList = blinkingProductsList.map(
      ({ product }) => product.id,
    )

    setBlinkingProductsList([])

    await CheckoutClient.removeBlinkingProducts(
      user.uuid,
      checkout.id,
      blinkingProductsIdsList,
    )

    dispatch(createThunk(getCartAndSaveInStore)())

    refetchCheckout()

    sendContinueUnavailableDayProductAlert(
      cart.id,
      blinkingProductsIdsList,
      selectedDay,
      CART_MODE.PURCHASE,
    )
  }

  return (
    <>
      <OrderDelivery
        checkout={checkout}
        selectedAddress={selectedAddress}
        selectAddress={setSelectedAddress}
        confirmAddress={confirmAddress}
        selectedSlot={selectedSlot}
        selectSlot={selectSlot}
        selectedDay={selectedDay}
        selectDay={selectDay}
        confirmSlot={confirmSlot}
        setEditMode={setSectionAsIsEditing}
        isEditing={isEditing}
      />
      <BlinkingProductModal
        title={t('availability_advice.title_checkout')}
        primaryActionText={t('availability_advice.choose_another_day_button')}
        secondaryActionText={t(
          'availability_advice.continue_without_products_button',
        )}
        blinkingProductsList={blinkingProductsList}
        primaryAction={pickAnotherDayForBlinkingProducts}
        secondaryAction={confirmRemoveBlinkingProducts}
        selectedDay={selectedDay}
      />

      {showSlotNotAvailableModal && (
        <CheckoutSlotNotAvailableModal
          checkoutId={checkout.id}
          onClose={() => setShowSlotNotAvailableModal(false)}
          onAction={() => setShowSlotNotAvailableModal(false)}
        />
      )}

      {showAddressNotInWarehouseModal && (
        <CheckoutAddressNotInWarehouseModal
          onAction={() => {
            dispatch(cancelCheckout())
            history.push(PATHS.HOME)
          }}
        />
      )}
    </>
  )
}

CheckoutDeliveryInfoContainer.propTypes = {
  incrementEditMode: func.isRequired,
  decrementEditMode: func.isRequired,
}

export { CheckoutDeliveryInfoContainer }
