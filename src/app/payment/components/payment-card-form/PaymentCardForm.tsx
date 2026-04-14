import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import maestroImage from './assets/maestro.svg'
import masterImage from './assets/mastercard.svg'
import visaImage from './assets/visa.svg'
import { useIframeCardForm } from './useIframeCardForm'
import { usePaymentAuthenticationCard } from './usePaymentAuthenticationCard'

import { Notifier } from '@mercadona/mo.library.shop-ui/notifier'

import { PaymentAuthFlow } from 'app/payment'
import Loader from 'components/loader'
import { SystemAlert } from 'services/system-alert'
import { TAB_INDEX } from 'utils/constants'

import './PaymentCardForm.css'

declare global {
  interface Window {
    cbOk?: () => void
    cbKo?: () => void
  }
}

interface PaymentCardFormProps {
  // TODO: Target to make it mandatory after finishing the migration to the new payment authentication flows
  paymentFlow?: PaymentAuthFlow
  onConfirm: (data: { authenticationUuid: string }) => void
  onError: (data: { authenticationUuid: string }) => void
}

export const PaymentCardForm = ({
  paymentFlow,
  onConfirm,
  onError,
}: PaymentCardFormProps) => {
  const { t } = useTranslation()

  const {
    paymentAuthentication,
    callbackUrls,
    refetch: refetchPaymentAuthentication,
  } = usePaymentAuthenticationCard(paymentFlow)

  const iframeForm = useIframeCardForm(paymentAuthentication?.provider)

  useEffect(() => {
    SystemAlert.deactivate()
  }, [])

  // TODO: Remove this effect after finishing the migration to the new payment authentication flows
  useEffect(() => {
    if (!paymentAuthentication || callbackUrls) {
      return
    }

    declareCallbacksLegacy(paymentAuthentication.authenticationUuid)

    return () => {
      clearCallbacks()
    }
  }, [paymentAuthentication, callbackUrls])

  useEffect(() => {
    if (!callbackUrls) {
      return
    }

    window.cbOk = () => {
      window.location.replace(callbackUrls.okUrl)
    }

    window.cbKo = () => {
      window.location.replace(callbackUrls.koUrl)
    }

    return () => {
      clearCallbacks()
    }
  }, [callbackUrls])

  const declareCallbacksLegacy = (authenticationUuid: string) => {
    window.cbOk = () => {
      onConfirm({ authenticationUuid })
    }

    window.cbKo = () => {
      onError({ authenticationUuid })

      return refetchPaymentAuthentication()
    }
  }

  const clearCallbacks = () => {
    window.cbOk = undefined
    window.cbKo = undefined
  }

  const renderIframe = () => {
    const { component: IframeComponent } = iframeForm

    if (!IframeComponent || !paymentAuthentication) {
      return (
        <div
          className="payment-iframe"
          style={{ minHeight: `${iframeForm.height}px` }}
        >
          <Loader />
        </div>
      )
    }

    return (
      <div
        className="payment-iframe"
        style={{ minHeight: `${iframeForm.height}px` }}
      >
        <IframeComponent paymentParams={paymentAuthentication.params} />
      </div>
    )
  }

  return (
    <div className="payment-card-form">
      <Notifier
        className="payment-card-form__tokenization-alert"
        type="alert"
        variant="inline"
      >
        {t('payment_method.card.form.notifier')}
      </Notifier>
      <div className="payment-card-form__content">
        {renderIframe()}
        <div className="payment-info">
          <p
            className="payment-info__title subhead1-r"
            role="note"
            tabIndex={TAB_INDEX.ENABLED}
            aria-label={`${t('commons.payment_form.text')}: Visa, Mastercard ${t('commons.and')} Maestro`}
          >
            {t('commons.payment_form.text')}
          </p>
          <div className="payment-info__cards">
            <img src={visaImage} alt="Visa" />
            <img src={masterImage} alt="Mastercard" />
            <img src={maestroImage} alt="Maestro" />
          </div>
          <p
            className="payment-info__disclaimer footnote1-r"
            role="note"
            tabIndex={TAB_INDEX.ENABLED}
          >
            {t('commons.payment_form.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  )
}
