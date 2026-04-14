import { useEffect, useState } from 'react'

import classNames from 'classnames'
import { array, func, node, number, string } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { sendPaymentMethodModalViewMetrics } from 'app/payment/metrics'
import { Card } from 'domain/card'

import './PaymentMethodForm.css'

const PaymentMethodForm = ({
  title,
  validPrefix,
  addCardText,
  selectedPaymentMethodId,
  paymentMethods,
  primaryActionText,
  secondaryActionText,
  addPaymentForm,
  onSelect,
  onConfirm,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false)
  const [addPaymentMethodChecked, setAddPaymentMethodChecked] = useState(false)

  useEffect(() => {
    if (!paymentMethods) return
    sendPaymentMethodModalViewMetrics()
  }, [paymentMethods])

  if (!paymentMethods) return null

  const arePaymentMethods = paymentMethods.length > 0
  const isAddPaymentMethodChecked =
    addPaymentMethodChecked && !selectedPaymentMethodId
  const shouldShowAddPaymentForm =
    isAddPaymentMethodChecked || !arePaymentMethods

  const addNewOptionClassName = classNames(
    'payment-method-form__option',
    'payment-method-form__option--new',
    { 'payment-method-form__option--selected': addPaymentMethodChecked },
  )

  const onConfirmWithLoading = () => {
    setLoading(true)
    onConfirm()
  }

  return (
    <div className="payment-method-form">
      <p className="payment-method-form__title title2-b">
        {arePaymentMethods ? title : addCardText}
      </p>
      {paymentMethods.map(
        ({
          id,
          creditCardNumber,
          creditCardType,
          expiresMonth,
          expiresYear,
        }) => {
          return (
            <div
              className="payment-method-form__option ym-hide-content"
              key={id}
            >
              <label htmlFor={id}>
                <span
                  className={`payment-method-form__card-icon card-icon__${Card.TYPES[creditCardType]}`}
                  role="img"
                  aria-label={Card.TYPES[creditCardType]}
                ></span>
                <span
                  aria-hidden="true"
                  className="payment-method-form__hidden-number body1-b"
                >
                  ****
                </span>
                <span className="payment-method-form__number body1-b">
                  {creditCardNumber}
                </span>
                <span className="payment-method-form__expires body1-r">
                  {`${validPrefix} ${expiresMonth}/${expiresYear.slice(-2)}`}
                </span>
              </label>
              <input
                id={id}
                type="radio"
                value={id}
                checked={selectedPaymentMethodId === id}
                onChange={() => {
                  onSelect(id)
                  setAddPaymentMethodChecked(false)
                }}
              />
              <span
                aria-hidden="true"
                className="payment-method-form__option-check"
              >
                <Icon icon="check-28" />
              </span>
            </div>
          )
        },
      )}
      {arePaymentMethods && (
        <div className={addNewOptionClassName}>
          <label htmlFor="new" className="subhead1-b">
            {addCardText}
          </label>
          <input
            id="new"
            type="radio"
            value=""
            checked={isAddPaymentMethodChecked}
            onChange={() => {
              onSelect(null)
              setAddPaymentMethodChecked(true)
            }}
          />
          <span
            aria-hidden="true"
            className="payment-method-form__option-check"
          >
            <Icon icon="check-28" />
          </span>
        </div>
      )}
      {shouldShowAddPaymentForm && addPaymentForm}
      {!shouldShowAddPaymentForm && (
        <div className="payment-method-form__actions">
          <Button variant="quaternary" onClick={onCancel} disabled={loading}>
            {secondaryActionText}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirmWithLoading}
            loading={loading}
            loadingText="Loading"
          >
            {primaryActionText}
          </Button>
        </div>
      )}
    </div>
  )
}

PaymentMethodForm.propTypes = {
  title: string.isRequired,
  validPrefix: string.isRequired,
  addCardText: string.isRequired,
  selectedPaymentMethodId: number,
  primaryActionText: string.isRequired,
  secondaryActionText: string.isRequired,
  paymentMethods: array,
  addPaymentForm: node.isRequired,
  onSelect: func.isRequired,
  onConfirm: func.isRequired,
  onCancel: func.isRequired,
}

export { PaymentMethodForm }
