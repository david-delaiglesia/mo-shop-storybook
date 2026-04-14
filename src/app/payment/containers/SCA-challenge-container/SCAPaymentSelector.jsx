import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'

import { bool, func, object } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { PaymentClient } from 'app/payment/client'
import { AddPaymentMethodForm } from 'app/payment/components/add-payment-method-form'
import { PaymentMethodForm } from 'app/payment/components/payment-method-form'
import { showAlert } from 'app/shared/alert/actions'
import Modal from 'components/modal'

const metricsInfo = {
  isNew: false,
}

const SCAPaymentSelector = ({
  paymentMethod,
  hasNewPaymentMethod = false,
  onConfirm,
  onCancel,
  t,
}) => {
  const dispatch = useDispatch()
  const { uuid } = useSelector(({ session }) => session)
  const [paymentMethods, setPaymentMethods] = useState(null)
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null)

  useEffect(() => {
    getPaymentMethods()
  }, [hasNewPaymentMethod])

  const getPaymentMethods = async () => {
    const paymentMethods = await PaymentClient.getListByUserId(uuid)
    setPaymentMethods(paymentMethods)
    selectPaymentMethod(paymentMethods)
    return paymentMethods
  }

  const selectPaymentMethod = (paymentMethods) => {
    if (hasNewPaymentMethod || !paymentMethod) {
      selectDefaultPaymentMethod(paymentMethods)
      return
    }
    setSelectedPaymentMethodId(paymentMethod.id)
  }

  const selectDefaultPaymentMethod = (paymentMethods) => {
    const defaultSelected = paymentMethods.find(
      (paymentMethod) => paymentMethod.defaultCard,
    ).id
    setSelectedPaymentMethodId(defaultSelected)
  }

  const updatePayments = async () => {
    const paymentMethods = await getPaymentMethods()
    selectDefaultPaymentMethod(paymentMethods)
    metricsInfo.isNew = true
  }

  const selectPaymentMethodId = (id) => {
    setSelectedPaymentMethodId(id)
    metricsInfo.isNew = false
  }

  const showTokenizationAlert = () => {
    const tokenizationAlert = {
      title: 'alerts.payment_method_error.title',
      description: 'alerts.payment_method_error.message',
      confirmButtonText: 'alerts.payment_method_error.confirm',
    }
    dispatch(showAlert(tokenizationAlert))
  }

  const onConfirmWithPayload = () => {
    const selectedPaymentMethod = paymentMethods.find(
      (paymentMethod) => paymentMethod.id === selectedPaymentMethodId,
    )
    onConfirm(selectedPaymentMethod, metricsInfo.isNew)
  }

  return createPortal(
    <Modal className="sca-payment-form">
      <PaymentMethodForm
        title={t('change_card_title')}
        validPrefix={t('change_card_valid_until')}
        addCardText={t('change_card_new_card_title')}
        primaryActionText={t('change_card_continue_button')}
        secondaryActionText={t('button.cancel')}
        paymentMethods={paymentMethods}
        selectedPaymentMethodId={selectedPaymentMethodId}
        addPaymentForm={
          <AddPaymentMethodForm
            uuid={uuid}
            title={t('commons.payment_form.text')}
            description={t('commons.payment_form.disclaimer')}
            onSuccess={updatePayments}
            onError={showTokenizationAlert}
            helpMessage={t('add_credit_card_doble_verification_disclaimer')}
          />
        }
        onSelect={selectPaymentMethodId}
        onConfirm={onConfirmWithPayload}
        onCancel={onCancel}
      />
    </Modal>,
    document.getElementById('modal-info'),
  )
}

const SCAPaymentSelectorTranslate = withTranslate(SCAPaymentSelector)

SCAPaymentSelector.propTypes = {
  paymentMethod: object,
  onConfirm: func.isRequired,
  onCancel: func.isRequired,
  hasNewPaymentMethod: bool.isRequired,
  t: func.isRequired,
}

export { SCAPaymentSelectorTranslate as SCAPaymentSelector }
