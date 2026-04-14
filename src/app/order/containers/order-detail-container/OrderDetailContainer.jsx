import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router'

import { AppConfig } from '../../../../config'
import { OrderCancelContainer } from '../order-cancel-container'
import { OrderContactInfoContainer } from '../order-contact-info-container'
import { OrderProductsInfoContainer } from '../order-products-info-container'
import OrderServiceRatingContainer from '../order-service-rating-container'
import { KNOWN_ERRORS } from './constants'

import { createThunk } from '@mercadona/mo.library.dashtil'
import { Button } from '@mercadona/mo.library.shop-ui/button'

import orderEditedImage from 'app/assets/order-edited@2x.png'
import {
  AutomaticInvoiceConfirmedModal,
  AutomaticInvoiceModal,
  InvoiceClient,
  InvoicesMetrics,
  useInvoiceAutomation,
} from 'app/invoice'
import { OrderMetrics } from 'app/order/OrderMetrics'
import { OrderClient } from 'app/order/client'
import { InvoiceConfirmationModal } from 'app/order/components/invoice-confirmation-modal'
import { InvoiceRequestModal } from 'app/order/components/invoice-request-modal'
import { OrderDetailHeader } from 'app/order/components/order-detail-header'
import OrderDetailLayout from 'app/order/components/order-detail-layout'
import { OrderInfo } from 'app/order/components/order-info'
import { PersonalIdNotRegisteredModal } from 'app/order/components/personal-id-not-registered-modal'
import { PersonalIdStillNotRegisteredModal } from 'app/order/components/personal-id-still-not-registered'
import { OrderDeliveryInfoContainer } from 'app/order/containers/order-delivery-info-container'
import { OrderPaymentInfoContainer } from 'app/order/containers/order-payment-info-container'
import { useOrderContext } from 'app/order/contexts/OrderContext'
import {
  EDIT_PURCHASE_PRODUCTS_SOURCES,
  sendEditPurchaseCompletedAlertViewMetrics,
  sendEditPurchaseProductsMetrics,
  sendRepeatPurchaseClickMetrics,
} from 'app/order/metrics'
import { showAlert } from 'app/shared/alert/actions'
import { showRepeatPurchaseAlert } from 'app/shared/alert/commands'
import { useUser } from 'app/user'
import WaitingResponse from 'components/waiting-response'
import { Order } from 'domain/order'
import { Payment } from 'domain/payment'
import { HTTP_STATUS } from 'services/http'
import { showFile } from 'utils/files'
import { clearPendingAction } from 'wrappers/feedback/actions'

import './OrderDetailContainer.css'

const OrderDetailContainer = () => {
  const history = useHistory()
  const location = useLocation()
  const urlParams = useParams()
  const dispatch = useDispatch()

  const [order, setOrder] = useState(null)
  const {
    order: orderFromContext,
    refetchOrder,
    isLoading: isOrderLoading,
  } = useOrderContext()
  useEffect(() => {
    if (orderFromContext) setOrder(orderFromContext)
  }, [orderFromContext])

  const { t } = useTranslation()
  const [isInvoiceRequestModalVisible, setIsInvoiceRequestModalVisible] =
    useState(false)
  const [documentNumber, setDocumentNumber] = useState('')
  const [isInvoiceRequestButtonLoading, setIsInvoiceRequestButtonLoading] =
    useState(false)
  const [
    isPersonalIdNotRegisteredModalVisible,
    setIsPersonalIdNotRegisteredModalVisible,
  ] = useState(false)
  const [
    isInvoiceConfirmationModalVisible,
    setIsInvoiceConfirmationModalVisible,
  ] = useState()
  const [shouldShowInvoiceAutomationFlow, setShouldShowInvoiceAutomationFlow] =
    useState(false)
  const [isInvoiceAutomationModalVisible, setIsInvoiceAutomationModalVisible] =
    useState(false)
  const [
    isInvoiceAutomationConfirmedModalVisible,
    setIsInvoiceAutomationConfirmedModalVisible,
  ] = useState(false)
  const [
    isPersonalIdStillNotRegisteredModalVisible,
    setIsPersonalIdStillNotRegisteredModalVisible,
  ] = useState(false)

  const { refetch: refetchUser } = useUser()

  const [isEditionModeActive, setIsEditionModeActive] = useState(false)
  const { userUuid, cart } = useSelector(({ cart, session }) => ({
    cart,
    userUuid: session.uuid,
  }))
  const orderId = urlParams.id

  const { automateInvoice, automateInvoiceCancel } = useInvoiceAutomation()

  useEffect(() => {
    if (location.state && location.state.hasEditedProducts) {
      showPurchaseEditedModalVisibility()
      cleanRouteState()
    }

    if (isOrderLoading) return

    triggerMetrics()
  }, [isOrderLoading])

  useEffect(() => {
    if (isInvoiceConfirmationModalVisible) {
      refetchOrder()
    }
  }, [isInvoiceConfirmationModalVisible])

  useEffect(() => {
    if (isInvoiceConfirmationModalVisible) {
      InvoicesMetrics.invoiceRequestConfirmationView(order.id)
    }
  }, [isInvoiceConfirmationModalVisible])

  useEffect(() => {
    if (isInvoiceRequestModalVisible) {
      InvoicesMetrics.invoiceRequestView(order.id)
    }
  }, [isInvoiceRequestModalVisible])

  useEffect(() => {
    if (isPersonalIdNotRegisteredModalVisible) {
      InvoicesMetrics.invoiceRegistrationView(documentNumber, order.id)
    }
  }, [isPersonalIdNotRegisteredModalVisible])

  useEffect(() => {
    if (isPersonalIdStillNotRegisteredModalVisible) {
      InvoicesMetrics.invoiceRegistrationNotCompletedAlert()
    }
  }, [isPersonalIdStillNotRegisteredModalVisible])

  useEffect(() => {
    if (isEditionModeActive && isInvoiceConfirmationModalVisible) {
      InvoicesMetrics.invoiceEditConfirmationView(order.id)
    }
  }, [isEditionModeActive, isInvoiceConfirmationModalVisible])

  useEffect(() => {
    if (isInvoiceAutomationModalVisible) {
      InvoicesMetrics.invoiceAutomationView(
        InvoicesMetrics.USER_FLOW.FIRST_INVOICE,
      )
    }
  }, [isInvoiceConfirmationModalVisible])

  useEffect(() => {
    if (isInvoiceAutomationConfirmedModalVisible) {
      InvoicesMetrics.invoiceAutomationConfirmationView(
        InvoicesMetrics.USER_FLOW.FIRST_INVOICE,
      )
    }
  }, [isInvoiceAutomationConfirmedModalVisible])

  useEffect(() => {
    if (isPersonalIdNotRegisteredModalVisible) {
      window.addEventListener('focus', handleOnReconfirmInvoiceRequest)

      return () => {
        window.removeEventListener('focus', handleOnReconfirmInvoiceRequest)
      }
    }
  }, [isPersonalIdNotRegisteredModalVisible])

  const triggerMetrics = () => {
    OrderMetrics.purchaseView({
      order: orderFromContext,
    })
  }

  const cleanRouteState = () => {
    history.replace(`/user-area/orders/${orderId}`, {
      hasEditedProducts: false,
    })
  }

  const showPurchaseEditedModalVisibility = () => {
    sendEditPurchaseCompletedAlertViewMetrics()

    dispatch(
      showAlert({
        title: 'alert_purchase_modification_title',
        description: 'alert_purchase_modification_body',
        imageSrc: orderEditedImage,
        confirmButtonText: 'alert_purchase_modification_button',
      }),
    )
  }

  const getTicketOrder = async () => {
    const ticketBody = await OrderClient.getTicket(userUuid, orderId)
    dispatch(clearPendingAction())

    if (!ticketBody) {
      return
    }

    const ticketName = `Receipt-${orderId}.pdf`
    showFile(ticketBody, ticketName)
  }

  const repeatPurchase = (source) => {
    sendRepeatPurchaseClickMetrics({ cart, order, source })
    const showRepeatPurchaseAlertThunk = createThunk(showRepeatPurchaseAlert)
    dispatch(showRepeatPurchaseAlertThunk({ cart, order }))
  }

  const goToEditOrder = () => {
    sendEditPurchaseProductsMetrics({
      orderId,
      source: EDIT_PURCHASE_PRODUCTS_SOURCES.PURCHASE,
    })
    history.push({
      pathname: `/orders/${order.id}/edit/products`,
      state: { from: location.pathname },
    })
  }

  const updateOrder = (orderInfoToUpdate) => {
    setOrder({
      ...order,
      ...orderInfoToUpdate,
    })
    refetchOrder()
  }

  const invoiceRequestClient = async () => {
    return await InvoiceClient.invoiceRequest({
      customerId: userUuid,
      orderId: order.id,
      documentNumber,
    })
  }

  const modifyInvoiceClient = async () => {
    return await InvoiceClient.modifyInvoice({
      customerId: userUuid,
      orderId: order.id,
      documentNumber,
    })
  }

  const handleErrors = async (error, onHandleModalError) => {
    if (error.status === HTTP_STATUS.NOT_FOUND) {
      const errorDetail = await error.json()
      if (errorDetail?.code === KNOWN_ERRORS.PERSONAL_ID_NOT_REGISTERED) {
        onHandleModalError()
      }
    }
  }

  const handleOnConfirmInvoiceModalError = () => {
    setIsPersonalIdNotRegisteredModalVisible(true)
    setIsInvoiceRequestModalVisible(false)
    setIsInvoiceRequestButtonLoading(false)
  }

  const handleOnReconfirmInvoiceModalError = () => {
    setIsPersonalIdStillNotRegisteredModalVisible(true)
    setIsPersonalIdNotRegisteredModalVisible(false)
  }

  const handleOnConfirmInvoiceRequest = async (client) => {
    setIsInvoiceRequestButtonLoading(true)
    try {
      const response = await client()
      setShouldShowInvoiceAutomationFlow(!!response?.showAutomateModal)
      setIsInvoiceConfirmationModalVisible(true)
      setIsInvoiceRequestModalVisible(false)
      setIsInvoiceRequestButtonLoading(false)
    } catch (error) {
      handleErrors(error, handleOnConfirmInvoiceModalError)
    }
  }

  const handleOnReconfirmInvoiceRequest = async () => {
    setIsPersonalIdNotRegisteredModalVisible(false)
    try {
      const response = isEditionModeActive
        ? await modifyInvoiceClient()
        : await invoiceRequestClient()
      setShouldShowInvoiceAutomationFlow(!!response?.showAutomateModal)
      setIsInvoiceConfirmationModalVisible(true)
    } catch (error) {
      handleErrors(error, handleOnReconfirmInvoiceModalError)
    }
  }

  if (!order) {
    return <WaitingResponse />
  }

  const handleInvoiceRequest = async () => {
    setIsEditionModeActive(false)

    if (!order.is_bill_requested) {
      InvoicesMetrics.invoiceRequestClick(order.id)
      setIsInvoiceRequestModalVisible(true)
      return
    }

    const { personalId } = await InvoiceClient.getInvoiceDocument({
      customerId: userUuid,
      orderId: order.id,
    })

    setDocumentNumber(personalId)
    setIsInvoiceRequestModalVisible(true)
  }

  const handleInvoiceConfirmationConfirm = () => {
    setIsInvoiceConfirmationModalVisible(false)

    if (shouldShowInvoiceAutomationFlow) {
      setIsInvoiceAutomationModalVisible(true)
    }
  }

  const handleInvoiceAutomationConfirm = async () => {
    InvoicesMetrics.invoiceAutomationChangeClick({
      userFlow: InvoicesMetrics.USER_FLOW.FIRST_INVOICE,
      active: true,
      document: documentNumber,
    })
    setIsInvoiceAutomationModalVisible(false)
    await automateInvoice(documentNumber)
    refetchUser()
    setIsInvoiceAutomationConfirmedModalVisible(true)
  }

  const handleInvoiceAutomationCancel = async () => {
    InvoicesMetrics.invoiceAutomationChangeClick({
      userFlow: InvoicesMetrics.USER_FLOW.FIRST_INVOICE,
      active: false,
      document: documentNumber,
    })
    setIsInvoiceAutomationModalVisible(false)
    await automateInvoiceCancel()
    refetchUser()
  }

  const canBeRated = Order.canBeRated(order)
  const isCancelable = Order.isCancelable(order)
  const isCancelled = Order.isCancelled(order)
  const isPaymentOk = Payment.isDone(order.payment_status)

  return (
    <Fragment>
      <OrderDetailLayout>
        <OrderDetailHeader
          order={order}
          getTicket={getTicketOrder}
          editProducts={goToEditOrder}
          toggleRepeatModal={() => repeatPurchase('purchase_view')}
        />
        {canBeRated && (
          <OrderServiceRatingContainer
            updateOrder={updateOrder}
            order={order}
          />
        )}
        <OrderInfo />
        <OrderProductsInfoContainer
          key={order.products_count}
          editOrderLines={goToEditOrder}
          order={order}
          showProducts={location.search === '?products'}
          toggleRepeatModal={() => repeatPurchase('product_list_view')}
        />

        <div className="order-detail-container__delivery-payment-group">
          <OrderDeliveryInfoContainer updateOrder={updateOrder} order={order} />
          <OrderContactInfoContainer updateOrder={updateOrder} order={order} />
          <OrderPaymentInfoContainer />
        </div>
        <div
          data-testid="order-actions-container"
          className={`order-detail-container__order-actions ${
            !isCancelable && 'order-detail-container__cancelable-order-actions'
          }`}
        >
          {isCancelable && <OrderCancelContainer />}
          {!isCancelled && (
            <Button
              onClick={handleInvoiceRequest}
              icon="invoice"
              variant="text"
            >
              {order.is_bill_requested
                ? t('invoices.requested_invoice.title')
                : t('invoices.request_invoice.title')}
            </Button>
          )}
        </div>
        {isInvoiceRequestModalVisible && (
          <InvoiceRequestModal
            documentNumber={documentNumber}
            isInvoiceRequestButtonLoading={isInvoiceRequestButtonLoading}
            setDocumentNumber={setDocumentNumber}
            onClose={() => {
              setIsInvoiceRequestModalVisible(false)
              isEditionModeActive
                ? InvoicesMetrics.invoiceEditCancelClick(order.id)
                : InvoicesMetrics.invoiceRequestCancelClick()
            }}
            onConfirm={() => {
              handleOnConfirmInvoiceRequest(invoiceRequestClient)
              InvoicesMetrics.invoiceConfirmDocumentClick(
                order.id,
                documentNumber,
              )
            }}
            onConfirmEdition={() => {
              handleOnConfirmInvoiceRequest(modifyInvoiceClient)
              InvoicesMetrics.invoiceEditDocumentClick(order.id, documentNumber)
            }}
            isBillRequested={order.is_bill_requested}
            isPaymentOk={isPaymentOk}
            isEditionModeActive={isEditionModeActive}
            onEditClick={() => {
              order.is_bill_requested && setIsEditionModeActive(true)
              InvoicesMetrics.invoiceEditClick(order.id)
            }}
            sendInvoicesPortalMetrics={() =>
              InvoicesMetrics.invoiceLoginLinkClick()
            }
          />
        )}
        {isInvoiceConfirmationModalVisible && (
          <InvoiceConfirmationModal
            onConfirm={handleInvoiceConfirmationConfirm}
          />
        )}
        {isPersonalIdNotRegisteredModalVisible && (
          <PersonalIdNotRegisteredModal
            onClose={() => {
              setIsPersonalIdNotRegisteredModalVisible(false)
              InvoicesMetrics.invoiceRegistrationCancelClick()
            }}
            sendInvoicesPortalMetrics={() =>
              InvoicesMetrics.invoiceRegistrationLinkClick()
            }
          />
        )}
        {isPersonalIdStillNotRegisteredModalVisible && (
          <PersonalIdStillNotRegisteredModal
            onClose={() => {
              setIsPersonalIdStillNotRegisteredModalVisible(false)
              InvoicesMetrics.invoiceRegistrationNotCompletedExitClick()
            }}
            onRetry={() => {
              setIsPersonalIdStillNotRegisteredModalVisible(false)
              setIsInvoiceRequestModalVisible(true)
              InvoicesMetrics.invoiceRegistrationNotCompletedRetryClick()
            }}
          />
        )}
      </OrderDetailLayout>

      {isInvoiceAutomationModalVisible && (
        <AutomaticInvoiceModal
          onConfirm={handleInvoiceAutomationConfirm}
          onCancel={handleInvoiceAutomationCancel}
        />
      )}

      {isInvoiceAutomationConfirmedModalVisible && (
        <AutomaticInvoiceConfirmedModal
          onClose={() => {
            setIsInvoiceAutomationConfirmedModalVisible(false)
          }}
          onGoToPortalClick={() => {
            setIsInvoiceAutomationConfirmedModalVisible(false)
            window.open(AppConfig.INVOICES_PORTAL, '_blank')
          }}
        />
      )}
    </Fragment>
  )
}

export { OrderDetailContainer }
