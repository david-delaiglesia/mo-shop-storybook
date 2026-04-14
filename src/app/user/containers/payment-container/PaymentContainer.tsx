import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import { AddIcon } from '@mercadona/mo.library.icons'
import { Button } from '@mercadona/mo.library.shop-ui/button'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import { useUserUUID } from 'app/authentication'
import {
  AddNewPaymentMethodCardData,
  AddPaymentMethodModal,
  HandleAddNewPaymentMethodData,
  PaymentMethod,
  PaymentMethodCTA,
  PaymentMethodType,
  PaymentMetrics,
  PhoneWithoutBizumException,
  PhoneWithoutBizumModal,
  useCreatePaymentMethodBizum,
  useUserPaymentMethods,
} from 'app/payment'
import { PaymentClient } from 'app/payment/client'
import { OrderPaymentClient } from 'app/payment/client_new'
import {
  hideAlert,
  showAddPaymentKoAlert,
  showAlert,
} from 'app/shared/alert/actions'
import { handleManagedError } from 'app/shared/exceptions'
import { PaymentCell } from 'app/user/components/payment-cell'
import { SOURCES } from 'app/user/metrics'
import WaitingResponse from 'components/waiting-response'
import { useId } from 'hooks/useId'
import { clearPendingAction } from 'wrappers/feedback/actions'

import './PaymentContainer.css'

export const PaymentContainer = () => {
  const { t } = useTranslation()
  const userUuid = useUserUUID()
  const dispatch = useDispatch()
  const accessibilityId = useId()

  const defaultPaymentMethodCellRef = useRef<HTMLDivElement | null>(null)

  const [bizumPhone, setBizumPhone] = useState({
    countryCode: '',
    nationalNumber: '',
  })
  const [showPhoneWithoutBizumModal, setShowPhoneWithoutBizumModal] =
    useState(false)

  const { createPaymentMethodBizum, isMutating: isCreatingPaymentMethod } =
    useCreatePaymentMethodBizum({
      async onError(error, data) {
        await handleManagedError(error)
          .on(PhoneWithoutBizumException, () => {
            setBizumPhone({
              countryCode: data.phoneCountryCode,
              nationalNumber: data.phoneNationalNumber,
            })
            setShowPhoneWithoutBizumModal(true)
          })
          .run()
      },
      async onSuccess() {
        await refetch()
        defaultPaymentMethodCellRef.current?.focus()
      },
      onSettled() {
        setShowAddNewPaymentMethodModal(false)
      },
    })

  const {
    paymentMethods,
    defaultPaymentMethod,
    nonDefaultPaymentMethods,
    isLoading,
    refetch,
  } = useUserPaymentMethods()

  const [showAddNewPaymentMethodModal, setShowAddNewPaymentMethodModal] =
    useState(false)

  useEffect(() => {
    const { onAddPaymentSuccess, onAddPaymentFailed } =
      window.history.state || {}

    if (onAddPaymentSuccess) {
      refetch().then(() => {
        defaultPaymentMethodCellRef.current?.focus()
      })
      clearState()
    }

    if (onAddPaymentFailed) {
      dispatch(
        showAddPaymentKoAlert({
          flow: SOURCES.PAYMENTS,
          confirmButtonAction: () => dispatch(hideAlert()),
        }),
      )
      clearState()
    }
  }, [])

  const clearState = () => {
    window.history.replaceState(null, '')
  }

  const setPermanentPayment = async (paymentMethod: PaymentMethod) => {
    await OrderPaymentClient.makeDefault({
      paymentMethodId: paymentMethod.id,
      customerId: userUuid,
    })

    await refetch()
    defaultPaymentMethodCellRef.current?.focus()
    dispatch(clearPendingAction())
  }

  const deletePayment = async (paymentId: number) => {
    await PaymentClient.remove(paymentId, userUuid)
    await refetch()
    defaultPaymentMethodCellRef.current?.focus()
    dispatch(hideAlert())
    dispatch(clearPendingAction())
  }

  const hasPaymentMethods = paymentMethods.length > 0

  const shouldRenderCTA = !hasPaymentMethods

  const showDeletePaymentAlert = (paymentId: number) => {
    const alert = {
      title: 'alerts.delete_payment_method.title',
      description: 'alerts.delete_payment_method.message',
      confirmButtonText: 'button.delete',
      confirmButtonAction: () => deletePayment(paymentId),
      secondaryActionText: 'button.cancel',
      secondaryAction: () => dispatch(hideAlert()),
      handleLoading: true,
      mood: 'destructive',
    }
    dispatch(showAlert(alert))
  }

  const handleAddPaymentMethodError = (data: AddNewPaymentMethodCardData) => {
    if (data.paymentMethodType === PaymentMethodType.CREDIT_CARD) {
      dispatch(
        showAddPaymentKoAlert({
          flow: SOURCES.PAYMENTS,
          confirmButtonAction: () => dispatch(hideAlert()),
        }),
      )
    }

    setShowAddNewPaymentMethodModal(false)
  }

  const handleAddPaymentMethod = (data: HandleAddNewPaymentMethodData) => {
    if (data.paymentMethodType === PaymentMethodType.CREDIT_CARD) {
      refetch().then(() => {
        defaultPaymentMethodCellRef.current?.focus()
      })
      setShowAddNewPaymentMethodModal(false)
    }

    if (data.paymentMethodType === PaymentMethodType.BIZUM) {
      createPaymentMethodBizum({
        phoneCountryCode: data.payload.countryCode,
        phoneNationalNumber: data.payload.nationalNumber,
      })
    }
  }

  const handleDelete = (paymentMethod: PaymentMethod) => {
    PaymentMetrics.deletePaymentMethodClick(paymentMethod)
    showDeletePaymentAlert(paymentMethod.id)
  }

  const handleSetPermanent = (paymentMethod: PaymentMethod) => {
    PaymentMetrics.makeDefaultPaymentClick(paymentMethod)
    setPermanentPayment(paymentMethod)
  }

  const handleAddNewPaymentMethodClick = () => {
    PaymentMetrics.addPaymentMethodClick({})
    setShowAddNewPaymentMethodModal(true)
  }

  return (
    <>
      <div className="payment-container">
        <FocusedElementWithInitialFocus>
          <h1 className="payment-container__header title1-b">
            {t('user_area.payments.title')}
          </h1>
        </FocusedElementWithInitialFocus>

        {isLoading ? (
          <div className="payment-list__loader">
            <WaitingResponse />
          </div>
        ) : (
          <>
            {shouldRenderCTA && (
              <PaymentMethodCTA onClick={handleAddNewPaymentMethodClick} />
            )}

            {hasPaymentMethods && (
              <div className="payment-container__wrapper">
                <section
                  aria-labelledby={`${accessibilityId}-default_method-header`}
                >
                  <div className="payment-container__section-header">
                    <h2
                      id={`${accessibilityId}-default_method-header`}
                      className="payment-list__title subhead1-b"
                    >
                      {t('user_area.payment_methods.default_method.title')}
                    </h2>

                    <Button
                      variant="text"
                      onClick={handleAddNewPaymentMethodClick}
                      icon={AddIcon}
                    >
                      {t('user_area.payment_methods.add_new')}
                    </Button>
                  </div>
                  {defaultPaymentMethod && (
                    <PaymentCell
                      innerRef={defaultPaymentMethodCellRef}
                      key={defaultPaymentMethod.id}
                      onDelete={() => handleDelete(defaultPaymentMethod)}
                      onSetPermanent={() =>
                        handleSetPermanent(defaultPaymentMethod)
                      }
                      paymentMethod={defaultPaymentMethod}
                    />
                  )}
                </section>

                {nonDefaultPaymentMethods.length > 0 && (
                  <section
                    aria-labelledby={`${accessibilityId}-other_methods-header`}
                  >
                    <h2
                      id={`${accessibilityId}-other_methods-header`}
                      className="payment-list__title subhead1-b"
                    >
                      {t('user_area.payment_methods.other_methods.title')}
                    </h2>
                    <ul
                      aria-label={t(
                        'user_area.payment_methods.other_methods.title',
                      )}
                    >
                      {nonDefaultPaymentMethods.map((paymentMethod) => (
                        <PaymentCell
                          key={paymentMethod.id}
                          onDelete={() => handleDelete(paymentMethod)}
                          onSetPermanent={() =>
                            handleSetPermanent(paymentMethod)
                          }
                          paymentMethod={paymentMethod}
                        />
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showAddNewPaymentMethodModal && (
        <AddPaymentMethodModal
          isLoading={isCreatingPaymentMethod}
          onAddNewPaymentMethod={handleAddPaymentMethod}
          onError={handleAddPaymentMethodError}
          onClose={() => setShowAddNewPaymentMethodModal(false)}
        />
      )}

      {showPhoneWithoutBizumModal && (
        <PhoneWithoutBizumModal
          phone={bizumPhone}
          onClick={() => setShowPhoneWithoutBizumModal(false)}
        />
      )}
    </>
  )
}
