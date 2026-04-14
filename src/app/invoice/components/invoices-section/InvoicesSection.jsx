import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import {
  AutomaticInvoiceConfirmedModal,
  AutomaticInvoiceUpdateModal,
  InvoicesMetrics,
  useInvoiceAutomation,
} from 'app/invoice'
import { PersonalIdNotRegisteredModal } from 'app/order/components/personal-id-not-registered-modal'
import { PersonalIdStillNotRegisteredModal } from 'app/order/components/personal-id-still-not-registered'
import { KNOWN_ERRORS } from 'app/order/containers/order-detail-container/constants'
import WaitingResponse from 'components/waiting-response'
import { useEventListener } from 'hooks/useEventListener'
import { HTTP_STATUS } from 'services/http'

import './InvoicesSection.css'

export const InvoicesSection = () => {
  const { t } = useTranslation()
  const {
    invoiceAutomation,
    isLoading,
    isMutating,
    automateInvoice,
    automateInvoiceCancel,
  } = useInvoiceAutomation()

  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [
    isInvoiceAutomationConfirmedModalVisible,
    setIsInvoiceAutomationConfirmedModalVisible,
  ] = useState(false)
  const [personalIdToUpdate, setPersonalIdToUpdate] = useState(null)
  const [
    isPersonalIdNotRegisteredModalVisible,
    setIsPersonalIdNotRegisteredModalVisible,
  ] = useState(false)
  const [
    isPersonalIdStillNotRegisteredModalVisible,
    setIsPersonalIdStillNotRegisteredModalVisible,
  ] = useState(false)

  const handleUpdateClick = () => {
    setShowUpdateModal(true)
  }

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false)

    InvoicesMetrics.invoiceAutomationCancelClick()
  }

  const handleSubmit = async (personalId) => {
    InvoicesMetrics.invoiceAutomationChangeClick({
      userFlow: InvoicesMetrics.USER_FLOW.INVOICE_SECTION,
      active: !!personalId,
      document: personalId,
    })

    try {
      if (personalId) {
        await automateInvoice(personalId)
        setIsInvoiceAutomationConfirmedModalVisible(true)
      } else {
        await automateInvoiceCancel()
      }

      setPersonalIdToUpdate(null)
    } catch (error) {
      if (error.status === HTTP_STATUS.NOT_FOUND) {
        const errorDetail = await error.json()
        if (errorDetail?.code === KNOWN_ERRORS.PERSONAL_ID_NOT_REGISTERED) {
          setPersonalIdToUpdate(personalId)
          setIsPersonalIdNotRegisteredModalVisible(true)
        }
      }
    } finally {
      setShowUpdateModal(false)
    }
  }

  const handleReSubmit = async (personalId) => {
    setIsPersonalIdNotRegisteredModalVisible(false)
    try {
      if (personalId) {
        await automateInvoice(personalId)
        setIsInvoiceAutomationConfirmedModalVisible(true)
      } else {
        await automateInvoiceCancel()
      }

      setPersonalIdToUpdate(null)
    } catch (error) {
      if (error.status === HTTP_STATUS.NOT_FOUND) {
        const errorDetail = await error.json()
        if (errorDetail?.code === KNOWN_ERRORS.PERSONAL_ID_NOT_REGISTERED) {
          setPersonalIdToUpdate(personalId)
          setIsPersonalIdStillNotRegisteredModalVisible(true)
        }
      }
    }
  }

  const handleBillingDataClick = () => {
    InvoicesMetrics.invoiceDetailsLinkClick()
  }

  const handleMyBillsClick = () => {
    InvoicesMetrics.invoiceMyInvoicesLinkClick()
  }

  useEventListener('focus', () => {
    if (isPersonalIdNotRegisteredModalVisible) {
      setIsPersonalIdNotRegisteredModalVisible(false)
      handleReSubmit(personalIdToUpdate)
    }
  })

  useEffect(() => {
    InvoicesMetrics.invoicePageView()
  }, [])

  useEffect(() => {
    if (showUpdateModal) {
      InvoicesMetrics.invoiceAutomationView(
        InvoicesMetrics.USER_FLOW.INVOICE_SECTION,
      )
    }
  }, [showUpdateModal])

  useEffect(() => {
    if (isPersonalIdNotRegisteredModalVisible) {
      InvoicesMetrics.invoiceRegistrationView(personalIdToUpdate)
    }
  }, [isPersonalIdNotRegisteredModalVisible])

  useEffect(() => {
    if (isPersonalIdStillNotRegisteredModalVisible) {
      InvoicesMetrics.invoiceRegistrationNotCompletedAlert()
    }
  }, [isPersonalIdStillNotRegisteredModalVisible])

  return (
    <>
      <div className="invoices-section">
        <h1 className="invoices-section__header title1-b">
          {t('all_invoice')}
        </h1>

        {isLoading ? (
          <div className="invoices-section__loader">
            <WaitingResponse />
          </div>
        ) : (
          <>
            <section
              aria-label={t('automatic_invoice_button')}
              className="invoices-section__section invoices-section__section--with-actions"
            >
              <div className="invoices-section__section-content">
                <h5 className="invoices-section__section-title body1-r">
                  {t('automatic_invoice_button')}
                </h5>
                {invoiceAutomation.isActive ? (
                  <>
                    <p className="invoices-section__section-description subhead1-r">
                      {t('automatic_invoice_label')}
                    </p>
                    <p className="body1-sb">{invoiceAutomation.personalId}</p>
                  </>
                ) : (
                  <p className="invoices-section__section-description subhead1-r">
                    {t('automatic_invoice_deactivated')}
                  </p>
                )}
              </div>

              <div className="invoices-section__section-actions">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={handleUpdateClick}
                >
                  {t('button.edit')}
                </Button>
              </div>
            </section>

            <section
              aria-label={t('invoice_data_button_title')}
              className="invoices-section__section"
            >
              <h5 className="invoices-section__section-title body1-r">
                {t('invoice_data_button_title')}
              </h5>
              <p className="invoices-section__section-description subhead1-r">
                <Trans
                  i18nKey="invoice_data_button_message"
                  components={{
                    a: (
                      <a
                        href={invoiceAutomation.billingDataUrl}
                        target="_blank"
                        className="invoices-section__section-description-link"
                        rel="noreferrer"
                        onClick={handleBillingDataClick}
                      />
                    ),
                  }}
                />
              </p>
            </section>

            <section
              aria-label={t('my_invoices_button_title')}
              className="invoices-section__section"
            >
              <h5 className="invoices-section__section-title body1-r">
                {t('my_invoices_button_title')}
              </h5>
              <p className="invoices-section__section-description subhead1-r">
                <Trans
                  i18nKey="my_invoices_button_message"
                  components={{
                    a: (
                      <a
                        href={invoiceAutomation.myBillsUrl}
                        className="invoices-section__section-description-link"
                        target="_blank"
                        rel="noreferrer"
                        onClick={handleMyBillsClick}
                      />
                    ),
                  }}
                />
              </p>
            </section>
          </>
        )}
      </div>

      {showUpdateModal && (
        <AutomaticInvoiceUpdateModal
          isAutomationEnabled={invoiceAutomation.isActive}
          defaultPersonalId={invoiceAutomation.personalId}
          isPending={isMutating}
          onCancel={handleCloseUpdateModal}
          onConfirm={handleSubmit}
        />
      )}

      {isInvoiceAutomationConfirmedModalVisible && (
        <AutomaticInvoiceConfirmedModal
          onClose={() => {
            setIsInvoiceAutomationConfirmedModalVisible(false)
          }}
          onGoToPortalClick={() => {
            setIsInvoiceAutomationConfirmedModalVisible(false)
            window.open(invoiceAutomation.myBillsUrl, '_blank')
          }}
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
            setShowUpdateModal(true)
            InvoicesMetrics.invoiceRegistrationNotCompletedRetryClick()
          }}
        />
      )}
    </>
  )
}
