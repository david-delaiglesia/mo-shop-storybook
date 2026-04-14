import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PaymentMethodCell } from '../payment-method-cell/PaymentMethodCell'
import { PaymentMethodTypeButton } from '../payment-method-type-button'
import { AddPaymentMethodModalCustomMode } from './AddPaymentMethodModalCustomMode'
import { ResolveOrderPaymentIncidentContent } from './components/ResolvePaymentIncidentContent'
import { ResolvePaymentIncidentPaymentMethodListContent } from './components/ResolvePaymentIncidentPaymentMethodListContent'

import { AddIcon } from '@mercadona/mo.library.icons'
import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Loader } from '@mercadona/mo.library.shop-ui/loader'
import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { useCheckoutContext } from 'app/checkout'
import { useOrderContext } from 'app/order/contexts/OrderContext'
import {
  PaymentAuthFlow,
  PaymentBizumForm,
  PaymentCardForm,
  PaymentMethod,
  PaymentMethodType,
  PaymentMetrics,
  useUserPaymentMethods,
} from 'app/payment'
import { getUniqueById } from 'utils/collections'

import './AddPaymentMethodModal.css'

export interface AddNewPaymentMethodBizumData {
  paymentMethodType: PaymentMethodType.BIZUM
  payload: {
    countryCode: string
    nationalNumber: string
  }
}
export interface AddNewPaymentMethodCardData {
  paymentMethodType: PaymentMethodType.CREDIT_CARD
  payload: {
    authenticationUuid: string
  }
}

export type HandleAddNewPaymentMethodData =
  | AddNewPaymentMethodBizumData
  | AddNewPaymentMethodCardData

interface AddPaymentMethodModalProps {
  title?: string
  initialMode?: AddPaymentMethodModalMode
  currentPaymentMethod?: PaymentMethod
  isLoading?: boolean
  paymentFlow?: PaymentAuthFlow
  onChangePaymentMethod?: (paymentMethod: PaymentMethod) => void
  onAddNewPaymentMethod: (data: HandleAddNewPaymentMethodData) => void
  onError: (data: AddNewPaymentMethodCardData) => void
  onClose: () => void
}

export type AddPaymentMethodModalMode =
  | PaymentMethodType
  | AddPaymentMethodModalCustomMode

export const AddPaymentMethodModal = ({
  title,
  initialMode = AddPaymentMethodModalCustomMode.CHOOSE,
  currentPaymentMethod,
  isLoading = false,
  paymentFlow,
  onChangePaymentMethod,
  onAddNewPaymentMethod,
  onError,
  onClose,
}: AddPaymentMethodModalProps) => {
  const { t } = useTranslation()
  const { order } = useOrderContext()
  const { checkout } = useCheckoutContext()

  const [mode, setMode] = useState<AddPaymentMethodModalMode>(initialMode)

  const shouldDisplayResolvePaymentIncidentDetails =
    mode === AddPaymentMethodModalCustomMode.RESOLVE_PAYMENT_INCIDENT ||
    mode == AddPaymentMethodModalCustomMode.RESOLVE_PAYMENT_PENDING

  const {
    paymentMethods: availablePaymentMethods,
    isLoading: isLoadingPaymentMethods,
  } = useUserPaymentMethods()
  const paymentMethods = getUniqueById([
    ...availablePaymentMethods,
    ...(currentPaymentMethod ? [currentPaymentMethod] : []),
  ])

  const titleByMode: Record<AddPaymentMethodModalMode, string> = {
    [AddPaymentMethodModalCustomMode.CURRENT_PAYMENT_METHODS_RESOLVE_PAYMENT_INCIDENT]:
      t('commons.order.order_payment.payment'),
    [AddPaymentMethodModalCustomMode.CURRENT_PAYMENT_METHODS]:
      title ?? t('payment_method.add_new_payment_method.title'),
    [AddPaymentMethodModalCustomMode.RESOLVE_PAYMENT_INCIDENT]:
      title ?? t('order.detail.status.payment_disrupted.title'),
    [AddPaymentMethodModalCustomMode.RESOLVE_PAYMENT_PENDING]:
      title ?? t('order.detail.status.payment_disrupted.title'),
    [AddPaymentMethodModalCustomMode.CHOOSE]: t(
      'payment_method.add_new_payment_method.title',
    ),
    [PaymentMethodType.BIZUM]: t('payment_method.add_new_payment_method.title'),
    [PaymentMethodType.CREDIT_CARD]: t(
      'payment_method.add_new_payment_method.title',
    ),
  }

  const subtitleByMode: Record<AddPaymentMethodModalMode, string> = {
    [AddPaymentMethodModalCustomMode.CURRENT_PAYMENT_METHODS_RESOLVE_PAYMENT_INCIDENT]:
      t('commons.order.order_payment.payment_list.options'),
    [AddPaymentMethodModalCustomMode.CURRENT_PAYMENT_METHODS]: '',
    [AddPaymentMethodModalCustomMode.RESOLVE_PAYMENT_INCIDENT]: '',
    [AddPaymentMethodModalCustomMode.RESOLVE_PAYMENT_PENDING]: '',
    [AddPaymentMethodModalCustomMode.CHOOSE]: t(
      'payment_method.add_new_payment_method.subtitle',
    ),
    [PaymentMethodType.BIZUM]: t(
      `payment_method_type.${PaymentMethodType.BIZUM}`,
    ),
    [PaymentMethodType.CREDIT_CARD]: t(
      `payment_method_type.${PaymentMethodType.CREDIT_CARD}`,
    ),
  }

  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(
    currentPaymentMethod?.id ?? null,
  )

  const handleConfirmChangePaymentMethod = () => {
    const selectedPaymentMethod = paymentMethods.find(
      (paymentMethod) => paymentMethod.id === selectedPaymentMethodId,
    )

    if (!selectedPaymentMethod) return

    PaymentMetrics.selectPaymentMethodClick({
      orderId: order?.id,
      paymentMethodId: selectedPaymentMethod.id,
      paymentMethod: selectedPaymentMethod.uiContent.title,
    })
    onChangePaymentMethod?.(selectedPaymentMethod)
  }

  const handleAddNewPaymentMethod = () => {
    PaymentMetrics.addPaymentMethodClick({
      orderId: order?.id,
      checkoutId: checkout?.id,
    })
    setMode(AddPaymentMethodModalCustomMode.CHOOSE)
  }

  useEffect(() => {
    if (
      mode === AddPaymentMethodModalCustomMode.CURRENT_PAYMENT_METHODS &&
      !isLoadingPaymentMethods
    ) {
      PaymentMetrics.paymentMethodsModalView({
        paymentMethodIds: paymentMethods.map((pm) => pm.id),
      })
    }
  }, [mode, paymentMethods, isLoadingPaymentMethods])

  // Focus modal description for screen readers when modal mode changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const descriptionElement = document.querySelector<HTMLElement>(
        '.ui-modal-unified__description',
      )

      if (descriptionElement) {
        descriptionElement.focus()
        return
      }

      const titleElement = document.querySelector<HTMLElement>(
        '.ui-modal-unified__title',
      )

      titleElement?.focus()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [mode])

  const handleClose = () => {
    PaymentMetrics.paymentMethodModalClose()
    onClose()
  }

  return (
    <Modal
      size={ModalSize.STICKY}
      title={titleByMode[mode]}
      description={subtitleByMode[mode]}
      onClose={handleClose}
      showClose
    >
      {mode === AddPaymentMethodModalCustomMode.CHOOSE && (
        <div className="add-payment-method-modal__types">
          <PaymentMethodTypeButton
            paymentMethodType={PaymentMethodType.CREDIT_CARD}
            onClick={() => {
              PaymentMetrics.selectPaymentMethodTypeClick({
                paymentMethodType: PaymentMethodType.CREDIT_CARD,
                orderId: order?.id,
              })
              setMode(PaymentMethodType.CREDIT_CARD)
            }}
          />
          <PaymentMethodTypeButton
            paymentMethodType={PaymentMethodType.BIZUM}
            onClick={() => {
              PaymentMetrics.selectPaymentMethodTypeClick({
                paymentMethodType: PaymentMethodType.BIZUM,
                orderId: order?.id,
              })
              setMode(PaymentMethodType.BIZUM)
            }}
          />
        </div>
      )}

      {shouldDisplayResolvePaymentIncidentDetails && (
        <ResolveOrderPaymentIncidentContent
          onChangePaymentMethod={() =>
            setMode(
              AddPaymentMethodModalCustomMode.CURRENT_PAYMENT_METHODS_RESOLVE_PAYMENT_INCIDENT,
            )
          }
          onClickResolvePaymentIncident={handleConfirmChangePaymentMethod}
        />
      )}

      {mode ===
        AddPaymentMethodModalCustomMode.CURRENT_PAYMENT_METHODS_RESOLVE_PAYMENT_INCIDENT && (
        <ResolvePaymentIncidentPaymentMethodListContent
          currentPaymentMethod={currentPaymentMethod}
          selectedPaymentMethodId={selectedPaymentMethodId}
          onSelectPaymentMethod={setSelectedPaymentMethodId}
          onGoBack={() =>
            setMode(AddPaymentMethodModalCustomMode.RESOLVE_PAYMENT_INCIDENT)
          }
          onRetryPayment={handleConfirmChangePaymentMethod}
          onAddPaymentMethod={handleAddNewPaymentMethod}
        />
      )}

      {mode === AddPaymentMethodModalCustomMode.CURRENT_PAYMENT_METHODS && (
        <>
          {isLoadingPaymentMethods ? (
            <Loader />
          ) : (
            <>
              <div
                className="add-payment-method-modal__payment-methods"
                role="radiogroup"
                aria-label={t(
                  'commons.order.order_payment.payment_list.options',
                )}
              >
                {paymentMethods?.map((paymentMethod) => (
                  <PaymentMethodCell
                    key={paymentMethod.id}
                    paymentMethod={paymentMethod}
                    onSelect={() =>
                      setSelectedPaymentMethodId(paymentMethod.id)
                    }
                    isSelected={selectedPaymentMethodId === paymentMethod.id}
                  />
                ))}

                <button
                  className="add-payment-method-modal__add-new"
                  onClick={handleAddNewPaymentMethod}
                >
                  <span
                    className="add-payment-method-modal__add-new__icon"
                    aria-hidden
                  >
                    <AddIcon size={20} />
                  </span>
                  <span className="subhead1-sb">
                    {t('payment_method.add_new_payment_method.title')}
                  </span>
                </button>
              </div>

              <div className="add-payment-method-modal__actions">
                <Button
                  onClick={handleConfirmChangePaymentMethod}
                  variant="primary"
                >
                  {t('button.save_changes')}
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {mode === PaymentMethodType.BIZUM && (
        <PaymentBizumForm
          isLoading={isLoading}
          onConfirm={(phone) =>
            onAddNewPaymentMethod({
              paymentMethodType: PaymentMethodType.BIZUM,
              payload: phone,
            })
          }
          onCancel={() => setMode(AddPaymentMethodModalCustomMode.CHOOSE)}
        />
      )}

      {mode === PaymentMethodType.CREDIT_CARD && (
        <>
          <PaymentCardForm
            paymentFlow={paymentFlow}
            onConfirm={(payload) => {
              onAddNewPaymentMethod({
                paymentMethodType: PaymentMethodType.CREDIT_CARD,
                payload,
              })
            }}
            onError={(payload) => {
              onError({
                paymentMethodType: PaymentMethodType.CREDIT_CARD,
                payload,
              })
            }}
          />
        </>
      )}
    </Modal>
  )
}
