import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import PropTypes from 'prop-types'

import { InfoIcon } from 'system-ui/icons'
import Input from 'system-ui/input'
import { SmallModal } from 'system-ui/modal'
import { Switch } from 'system-ui/switch'

import './AutomaticInvoiceUpdateModal.css'

export const AutomaticInvoiceUpdateModal = ({
  isAutomationEnabled,
  defaultPersonalId,
  isPending,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation()

  const [formState, setFormState] = useState({
    status: isAutomationEnabled,
    personalId: defaultPersonalId ?? '',
  })

  const [isFormDirty, setIsFormDirty] = useState(false)

  const handleStatusChange = (event) => {
    event.persist()
    setFormState((prevState) => ({
      ...prevState,
      status: event.target.checked,
      personalId: '',
    }))
  }

  const handlePersonalIdChange = (event) => {
    event.persist()
    setFormState((prevState) => ({
      ...prevState,
      personalId: event.target.value,
    }))
  }

  const handleSubmit = () => {
    onConfirm(formState.personalId)
  }

  const handleFormInput = () => {
    setIsFormDirty(true)
  }

  const isSubmitEnabled =
    isFormDirty &&
    ((formState.status && formState.personalId) || !formState.status)

  return (
    <SmallModal
      title={t('automatic_invoice_button')}
      primaryActionText={t('button.save_changes')}
      primaryAction={handleSubmit}
      primaryActionDisabled={!isSubmitEnabled}
      primaryActionLoading={isPending}
      secondaryActionText={t('button.cancel')}
      secondaryAction={onCancel}
      hideModal={onCancel}
      className="automatic-invoice-update-modal"
    >
      <form
        className="automatic-invoice-update-modal__form"
        onInput={handleFormInput}
      >
        <Switch
          label={t('always_send_invoices_switch')}
          name="status"
          checked={formState.status}
          onChange={handleStatusChange}
        />

        {formState.status && (
          <div>
            <p className="automatic-invoice-update-modal__input-label body1-r">
              {t('automatic_invoice_document_field_tittle')}
            </p>
            <Input
              label="invoices.request_invoice.label"
              value={formState.personalId}
              name="personalId"
              onChange={handlePersonalIdChange}
              isRequired
            />

            {isFormDirty && formState.personalId && (
              <p className="automatic-invoice-update-modal__disclaimer footnote1-r">
                <InfoIcon size={16} />
                {t('automatic_invoice_info_message')}
              </p>
            )}
          </div>
        )}
      </form>
    </SmallModal>
  )
}

AutomaticInvoiceUpdateModal.propTypes = {
  isAutomationEnabled: PropTypes.bool,
  defaultPersonalId: PropTypes.string,
  isPending: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}
