import { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BizumNeedsModal, useBizumNeedsViewCheck } from '../bizum-needs-modal'

import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Notifier } from '@mercadona/mo.library.shop-ui/notifier'

import { PaymentAuthFlow } from 'app/payment/hooks'
import { CountryCode, InputPhone } from 'system-ui/input'
import { PhoneUtils } from 'utils/phone'

import './PaymentBizumForm.css'

export interface PaymentBizumFormProps {
  flow?: PaymentAuthFlow
  isLoading?: boolean
  onConfirm: (phone: { countryCode: string; nationalNumber: string }) => void
  onCancel: () => void
}

export const PaymentBizumForm = ({
  flow,
  isLoading,
  onConfirm,
  onCancel,
}: PaymentBizumFormProps) => {
  const { t } = useTranslation()

  const inputPhoneRef = useRef<HTMLInputElement>(null)

  const isResolveIncidenceFlow =
    flow === PaymentAuthFlow.RESOLVE_PAYMENT_INCIDENCE

  const { hasAlreadySeenBizumNeeds, onCloseBizumNeedsDialog } =
    useBizumNeedsViewCheck()

  const [phone, setPhone] = useState<{
    country: CountryCode['isoCountryCode']
    countryCode: string
    nationalNumber: string
  }>({
    country: 'ES',
    countryCode: '34',
    nationalNumber: '',
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onConfirm(phone)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.persist()

    setPhone((currentPhone) => ({
      ...currentPhone,
      nationalNumber: event.target.value,
    }))
  }

  const handleChangeCountryCode = ({
    isoCountryCode,
    phoneCountryCode,
  }: CountryCode) => {
    setPhone((currentPhone) => ({
      ...currentPhone,
      country: isoCountryCode,
      countryCode: phoneCountryCode,
    }))
  }

  const handleCloseBizumNeedsModal = () => {
    onCloseBizumNeedsDialog()
    inputPhoneRef.current?.focus()
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="payment-bizum-form">
        <div className="payment-bizum-form__content">
          <p className="payment-bizum-form__title body1-sb">
            {t('payment_method.bizum.form.title')}
          </p>
          <p className="payment-bizum-form__description body1-r">
            {t('payment_method.bizum.form.description')}
          </p>
          <InputPhone
            innerRef={inputPhoneRef}
            label={t('input.number')}
            phone={phone.nationalNumber}
            phoneCountryCode={phone.countryCode}
            onSelectCountryCode={handleChangeCountryCode}
            onChange={handleChange}
            autoFocus
          />
        </div>

        <Notifier icon="lock" className="payment-bizum-form__notifier">
          {t('payment_method.bizum.form.secure')}
        </Notifier>

        <div className="payment-bizum-form__actions">
          <Button type="button" onClick={onCancel} variant="secondary">
            {t('button.go_back')}
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={!PhoneUtils.isValidPhone(phone)}
          >
            {t('button.go_on')}
          </Button>
        </div>

        <p role="note" className="payment-bizum-form__note footnote1-r">
          {t(
            isResolveIncidenceFlow
              ? 'payment_method.bizum.form.note-onetime'
              : 'payment_method.bizum.form.note',
          )}
        </p>
      </form>

      {!hasAlreadySeenBizumNeeds && (
        <BizumNeedsModal onClose={handleCloseBizumNeedsModal} />
      )}
    </>
  )
}
