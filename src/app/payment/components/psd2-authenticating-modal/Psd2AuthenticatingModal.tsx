import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { Card } from '@mercadona/mo.library.shop-ui/card'
import { Loader } from '@mercadona/mo.library.shop-ui/loader'
import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import { PaymentMetrics } from 'app/payment/PaymentMetrics'
import { useCountdownTime } from 'hooks/useCountdownTime'
import { MoneyIcon } from 'system-ui/icons'
import { TAB_INDEX } from 'utils/constants'
import { formatCurrency } from 'utils/currency'

import './Psd2AuthenticatingModal.css'

export interface Psd2AuthenticatingModalProps {
  flow: 'payment' | 'authorization'
  isLoading: boolean
  remainingTime: number
  estimatedAmount: string
  totalAmount: string
  marginAmount?: string
  hasVariableWeight: boolean
  onClose: () => void
}

export const Psd2AuthenticatingModal = ({
  flow,
  isLoading,
  remainingTime,
  estimatedAmount,
  totalAmount,
  marginAmount,
  hasVariableWeight,
  onClose,
}: Psd2AuthenticatingModalProps) => {
  const { t, i18n } = useTranslation()

  const { minutes, seconds } = useCountdownTime(remainingTime ?? 0)

  const title = (
    <Trans
      i18nKey="alerts.payment_authenticating.title"
      values={{
        amount: isLoading
          ? '--'
          : formatCurrency(Number(totalAmount), i18n.language),
      }}
      components={{ b: <span className="title2-b" /> }}
    />
  )

  useEffect(() => {
    if (!isLoading) {
      PaymentMetrics.psd2ModalView({
        timeLeft: remainingTime,
        hasExtraToAuthenticate: hasVariableWeight,
      })
    }
  }, [isLoading])

  const handleClose = () => {
    PaymentMetrics.psd2CancelClick()
    onClose()
  }

  return (
    <Modal
      size={ModalSize.STICKY}
      title={title}
      onClose={handleClose}
      closeOnEscape={false}
      showClose
      className="psd2-authenticating-modal"
    >
      {isLoading && (
        <div className="psd2-authenticating-modal__loader">
          <Loader />
        </div>
      )}

      {!isLoading && (
        <div className="psd2-authenticating-modal__content">
          <FocusedElementWithInitialFocus>
            <h3
              className="psd2-authenticating-modal__title"
              tabIndex={TAB_INDEX.ENABLED}
            >
              <span className="title2-r">{title}</span>
            </h3>
          </FocusedElementWithInitialFocus>

          <div
            className="psd2-authenticating-modal__timer"
            tabIndex={TAB_INDEX.ENABLED}
          >
            <span className="body1-r">
              {t('alerts.payment_authenticating.remaining_time')}
            </span>
            <div className="psd2-authenticating-modal__countdown">
              <div className="psd2-authenticating-modal__countdown-item">
                <span className="psd2-authenticating-modal__countdown-time title1-r">
                  {minutes}
                </span>
                <span className="psd2-authenticating-modal__countdown-label subhead1-r">
                  {t('countdown_minutes')}
                </span>
              </div>
              <div className="psd2-authenticating-modal__countdown-item">
                <span className="psd2-authenticating-modal__countdown-time title1-r">
                  {seconds}
                </span>
                <span className="psd2-authenticating-modal__countdown-label subhead1-r">
                  {t('countdown_seconds')}
                </span>
              </div>
            </div>
          </div>

          {flow === 'payment' && (
            <Card className="psd2-authenticating-modal__details-card">
              <div
                className="psd2-authenticating-modal__details-card-item"
                tabIndex={TAB_INDEX.ENABLED}
              >
                <span className="psd2-authenticating-modal__details-card__total-estimate body1-b">
                  {t('alerts.payment_authenticating.total_estimate')}
                </span>
                <span className="psd2-authenticating-modal__details-card__price body1-b">
                  {formatCurrency(Number(totalAmount), i18n.language)}
                </span>
              </div>

              <div
                className="psd2-authenticating-modal__details-card-item"
                tabIndex={TAB_INDEX.ENABLED}
              >
                <span className="subhead1-r">
                  {t('alerts.payment_authenticating.total_authorize')}
                </span>
                <span className="psd2-authenticating-modal__details-card__price body1-b">
                  {formatCurrency(Number(totalAmount), i18n.language)}
                </span>
              </div>
            </Card>
          )}

          {flow === 'authorization' && hasVariableWeight && (
            <>
              <Card className="psd2-authenticating-modal__details-card">
                <div>
                  <div
                    className="psd2-authenticating-modal__details-card-item"
                    tabIndex={TAB_INDEX.ENABLED}
                  >
                    <span className="psd2-authenticating-modal__details-card__total-estimate body1-b">
                      {t('alerts.payment_authenticating.total_estimate')}
                    </span>
                    <span className="psd2-authenticating-modal__details-card__price body1-b">
                      {formatCurrency(Number(estimatedAmount), i18n.language)}
                    </span>
                  </div>
                  <div
                    className="psd2-authenticating-modal__details-card-item"
                    tabIndex={TAB_INDEX.ENABLED}
                  >
                    <span className="subhead1-r">
                      {t('alerts.payment_authenticating.margin_amount')}
                    </span>
                    <span className="psd2-authenticating-modal__details-card__price body1-b">
                      {formatCurrency(Number(marginAmount), i18n.language)}
                    </span>
                  </div>
                </div>

                <div>
                  <div
                    className="psd2-authenticating-modal__details-card-item"
                    tabIndex={TAB_INDEX.ENABLED}
                  >
                    <span className="subhead1-r">
                      {t('alerts.payment_authenticating.total_authorize')}
                    </span>
                    <span className="psd2-authenticating-modal__details-card__price body1-b">
                      {formatCurrency(Number(totalAmount), i18n.language)}
                    </span>
                  </div>

                  <span className="psd2-authenticating-modal__details-card__footnote footnote1-b">
                    {t('alerts.payment_authenticating.just_an_authorisation')}
                  </span>
                </div>
              </Card>

              <div
                className="psd2-authenticating-modal__authorization-explanation"
                tabIndex={TAB_INDEX.ENABLED}
              >
                <span>
                  <MoneyIcon size={32} />
                </span>
                <span className="subhead1-r">
                  {t(
                    'alerts.payment_authenticating.authorization_explanation_variable_weight',
                  )}
                </span>
              </div>
              <div></div>
            </>
          )}

          {flow === 'authorization' && !hasVariableWeight && (
            <>
              <Card className="psd2-authenticating-modal__details-card">
                <div>
                  <div
                    className="psd2-authenticating-modal__details-card-item"
                    tabIndex={TAB_INDEX.ENABLED}
                  >
                    <span className="psd2-authenticating-modal__details-card__total-estimate body1-b">
                      {t('alerts.payment_authenticating.total_authorize')}
                    </span>
                    <span className="psd2-authenticating-modal__details-card__price body1-b">
                      {formatCurrency(Number(totalAmount), i18n.language)}
                    </span>
                  </div>

                  <span className="psd2-authenticating-modal__details-card__footnote footnote1-b">
                    {t('alerts.payment_authenticating.just_an_authorisation')}
                  </span>
                </div>
              </Card>

              <div
                className="psd2-authenticating-modal__authorization-explanation"
                tabIndex={TAB_INDEX.ENABLED}
              >
                <span>
                  <MoneyIcon size={32} />
                </span>
                <span className="subhead1-r">
                  {t(
                    'alerts.payment_authenticating.authorization_explanation_fixed_weight',
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
