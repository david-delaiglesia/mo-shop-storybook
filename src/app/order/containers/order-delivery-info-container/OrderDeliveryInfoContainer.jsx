import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { func } from 'prop-types'

import {
  AddressNotInWarehouseException,
  OrderAddressNotInWarehouseModal,
} from 'app/address'
import orderEditedImage from 'app/assets/order-edited@2x.png'
import { getCart } from 'app/cart/selectors'
import { BlinkingProductModal } from 'app/catalog/components/blinking-product-modal'
import { CART_MODE } from 'app/catalog/metrics'
import { SlotNotBookedException, SlotTakenException } from 'app/checkout'
import { OrderMetrics, OrderSlotNotAvailableModal } from 'app/order'
import { OrderClient } from 'app/order/client'
import { OrderDelivery } from 'app/order/components/order-delivery'
import { showAlert } from 'app/shared/alert/actions'
import { handleManagedError } from 'app/shared/exceptions'
import {
  sendContinueUnavailableDayProductAlert,
  sendPickAnotherDayUnavailableDayProductAlert,
  sendUnavailableDayProductAlertViewMetrics,
} from 'app/shared/metrics'
import { CheckoutPropTypes } from 'domain/checkout'
import { Order } from 'domain/order'
import { ProductService } from 'domain/product/'
import { getDay } from 'utils/dates'
import { clearPendingAction } from 'wrappers/feedback/actions'

const OrderDeliveryInfoContainer = ({ order, updateOrder }) => {
  const [isEditing, setEditMode] = useState(false)
  const [showSlotNotAvailableModal, setShowSlotNotAvailableModal] =
    useState(false)
  const [showAddressNotInWarehouseModal, setShowAddressNotInWarehouseModal] =
    useState(false)
  const [selectedSlot, selectSlot] = useState(order.slot)
  const [selectedDay, selectDay] = useState()
  const [selectedAddress, selectAddress] = useState(order.address)
  const [preparedLines, setPreparedLines] = useState([])
  const [blinkingProductsList, setBlinkingProductsList] = useState([])
  const session = useSelector((state) => state.session)
  const cart = useSelector(getCart)
  const dispatch = useDispatch()

  const { t } = useTranslation()

  useEffect(() => {
    selectDay()
  }, [selectedAddress])

  useEffect(() => {
    getOrderLines(order)
  }, [])

  const confirmAddress = (address) => {
    if (address.id !== selectedAddress.id) selectSlot(null)
    selectAddress(address)
  }

  const getOrderLines = async () => {
    const preparedLines = await OrderClient.getPreparedLines(
      session.uuid,
      order.id,
    )

    setPreparedLines(preparedLines.results)
  }

  const handleConfirmChangesOnAddressOrSlot = () => {
    if (!order.slot) return
    if (
      order.slot.id === selectedSlot.id &&
      order.address.id === selectedAddress.id
    )
      return

    dispatch(
      showAlert({
        title: 'alert_purchase_modification_title',
        description: 'alert_purchase_modification_body',
        imageSrc: orderEditedImage,
        confirmButtonText: 'alert_purchase_modification_button',
      }),
    )
  }

  const confirmSlot = async () => {
    setEditMode(false)

    try {
      const deliveryInfo = { address: selectedAddress, slot: selectedSlot }
      const updatedOrder = await OrderClient.updateDeliveryInfo(
        session.uuid,
        order.id,
        deliveryInfo,
      )
      handleConfirmChangesOnAddressOrSlot()
      updateOrder(updatedOrder)
    } catch (error) {
      await handleManagedError(error)
        .on(SlotNotBookedException, () => setShowSlotNotAvailableModal(true))
        .on(SlotTakenException, () => setShowSlotNotAvailableModal(true))
        .on(AddressNotInWarehouseException, () => {
          setShowAddressNotInWarehouseModal(true)
          selectAddress(order.address)
          OrderMetrics.addressNotChangedError({
            orderId: order.id,
            currentAddressId: order.address.id,
            newAddressId: selectedAddress.id,
          })
        })
        .run()
      selectSlot(null)
      setEditMode(true)
      return
    } finally {
      dispatch(clearPendingAction())
    }
  }

  const changeDay = (day) => {
    selectDay(day)
    checkBlinkingProducts(day)
  }

  const checkBlinkingProducts = (day) => {
    const blinkingProducstMatchList =
      ProductService.getBlinkingProductsDayMatch(preparedLines, day)

    setBlinkingProductsList(blinkingProducstMatchList)

    if (blinkingProducstMatchList.length) {
      const blinkingProductsIdsList = blinkingProducstMatchList.map(
        ({ product }) => product.id,
      )

      sendUnavailableDayProductAlertViewMetrics(
        cart.id,
        blinkingProductsIdsList,
        day,
        CART_MODE.EDIT,
        order.id,
      )
    }
  }

  const pickAnotherDayforBlinkingProducts = () => {
    const blinkingProductsIdsList = blinkingProductsList.map(
      ({ product }) => product.id,
    )

    setBlinkingProductsList([])
    selectDay(getDay(order.slot.start))

    sendPickAnotherDayUnavailableDayProductAlert(
      cart.id,
      blinkingProductsIdsList,
      selectedDay,
      CART_MODE.EDIT,
      order.id,
    )
  }

  const confirmRemoveBlinkingProducts = async () => {
    const blinkingProductsIdsList = blinkingProductsList.map(
      ({ product }) => product.id,
    )

    setBlinkingProductsList([])

    const updatedOrder = await OrderClient.removeBlinkingProducts(
      session.uuid,
      order.id,
      blinkingProductsIdsList,
    )

    updateOrder(updatedOrder)
    getOrderLines()
    sendContinueUnavailableDayProductAlert(
      cart.id,
      blinkingProductsIdsList,
      selectedDay,
      CART_MODE.EDIT,
      order.id,
    )
  }

  return (
    <Fragment>
      <OrderDelivery
        checkout={order}
        selectedAddress={selectedAddress}
        selectAddress={selectAddress}
        confirmAddress={confirmAddress}
        selectedSlot={selectedSlot}
        selectSlot={selectSlot}
        selectedDay={selectedDay}
        selectDay={changeDay}
        confirmSlot={confirmSlot}
        setEditMode={setEditMode}
        isEditing={isEditing}
        showEditButton={Order.isEditable(order)}
      />
      <BlinkingProductModal
        title={t('availability_advice.title_checkout')}
        primaryActionText={t('availability_advice.choose_another_day_button')}
        secondaryActionText={t(
          'availability_advice.continue_without_products_button',
        )}
        blinkingProductsList={blinkingProductsList}
        primaryAction={pickAnotherDayforBlinkingProducts}
        secondaryAction={confirmRemoveBlinkingProducts}
        selectedDay={selectedDay}
      />

      {showSlotNotAvailableModal && (
        <OrderSlotNotAvailableModal
          orderId={order.id}
          onClose={() => setShowSlotNotAvailableModal(false)}
          onAction={() => setShowSlotNotAvailableModal(false)}
        />
      )}

      {showAddressNotInWarehouseModal && (
        <OrderAddressNotInWarehouseModal
          onClose={() => setShowAddressNotInWarehouseModal(false)}
        />
      )}
    </Fragment>
  )
}

OrderDeliveryInfoContainer.propTypes = {
  order: CheckoutPropTypes.isRequired,
  updateOrder: func.isRequired,
}

export { OrderDeliveryInfoContainer }
