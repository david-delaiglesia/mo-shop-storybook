import { Fragment, useEffect, useRef, useState } from 'react'

import paymentMethodIcons from './assets/payment-methods.svg'
import { func, string } from 'prop-types'

import { Notifier } from '@mercadona/mo.library.shop-ui/notifier'

import { I18nClient } from 'app/i18n/client'
import { PaymentClient } from 'app/payment/client'
import { PaymentProvider } from 'app/payment/interfaces'
import { SystemAlert } from 'services/system-alert'

import './AddPaymentMethodForm.css'

const AddPaymentMethodForm = ({
  uuid,
  title,
  description,
  helpMessage,
  onSuccess,
  onError,
}) => {
  const [iframeData, setIframeData] = useState(null)
  const formRef = useRef()

  useEffect(() => {
    getPaymentParams()
    SystemAlert.deactivate()

    return removeCallbacks
  }, [])

  useEffect(() => {
    if (!iframeData) return

    declareCallbacks()
    formRef.current.submit()
  }, [iframeData])

  const { URL_Base: urlBase, ...formParams } = iframeData?.params || {}

  const URL = {
    [PaymentProvider.CECA]: `${urlBase}&lang=${I18nClient.getCurrentLanguage()}`,
    [PaymentProvider.REDSYS]: urlBase,
  }

  const getPaymentParams = async () => {
    const { host, protocol } = window.location
    const urlOk = `${protocol}//${host}/sca_add_payment_ok.html?url=${window.location}`
    const urlKo = `${protocol}//${host}/sca_add_payment_ko.html?url=${window.location}`

    const response = await PaymentClient.getIframe(urlOk, urlKo, uuid)
    setIframeData(response)
  }

  const declareCallbacks = () => {
    window.cbOk = () => {
      onSuccess?.()
    }
    window.cbKo = () => {
      onError?.()
      getPaymentParams()
    }
  }

  const removeCallbacks = () => {
    window.cbOk = undefined
    window.cbKo = undefined
  }

  if (!iframeData) return null

  const { provider } = iframeData

  return (
    <Fragment>
      <div className="add-payment-method">
        <iframe
          className={`add-payment-method__iframe add-payment-method__iframe--${provider}`}
          title="add-payment-method-iframe"
          name="add-payment-method-iframe"
        >
          <form
            ref={formRef}
            target="add-payment-method-iframe"
            name="add-payment-method-form"
            action={URL[provider]}
            method="POST"
          >
            {Object.entries(formParams).map(([paramName, paramValue]) => (
              <input
                key={paramName}
                name={paramName}
                value={paramValue}
                type="hidden"
              />
            ))}
          </form>
        </iframe>
        <div className="add-payment-method__info">
          <p className="add-payment-method__title body1-r">{title}</p>
          <img
            className="add-payment-method__image"
            src={paymentMethodIcons}
            alt="visa mastercard maestro"
          ></img>
          <p className="add-payment-method__description footnote1-r">
            {description}
          </p>
        </div>
      </div>
      <Notifier icon="lock" type="alert">
        {helpMessage}
      </Notifier>
    </Fragment>
  )
}

AddPaymentMethodForm.propTypes = {
  uuid: string.isRequired,
  title: string.isRequired,
  description: string.isRequired,
  helpMessage: string.isRequired,
  onSuccess: func,
  onError: func,
}

export { AddPaymentMethodForm }
