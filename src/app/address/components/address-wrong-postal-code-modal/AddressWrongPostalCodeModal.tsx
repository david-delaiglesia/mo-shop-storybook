import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { AddressMetrics } from '../../metrics'
import addressWrongPostalCodeImage from './assets/address-wrong-postal-code.png'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { useFlowIdContext } from 'app/shared/flow-id'

import './AddressWrongPostalCodeModal.css'

interface AddressWrongPostalCodeModalProps {
  street: string
  number?: string
  detail?: string
  suggestedPostalCode: string
  town: string
  onSave: () => void
  onEdit: () => void
}

export const AddressWrongPostalCodeModal = ({
  street,
  number,
  detail,
  suggestedPostalCode,
  town,
  onSave,
  onEdit,
}: AddressWrongPostalCodeModalProps) => {
  const { t } = useTranslation()

  const { flowId } = useFlowIdContext()

  useEffect(() => {
    AddressMetrics.addressWrongPostalCodeView({
      flowId,
      postalCodeSuggested: suggestedPostalCode,
    })
  }, [])

  const handleSave = () => {
    AddressMetrics.addressWrongPostalCodeSaveClick()
    onSave()
  }

  const handleEdit = () => {
    AddressMetrics.addressWrongPostalCodeEditClick()
    onEdit()
  }

  const addressLine1 = `${street}${number ? `, ${number}` : ''}${detail ? `, ${detail}` : ''}`

  return (
    <Modal
      size={ModalSize.MEDIUM}
      title={t('alerts.address_wrong_postal_code.title')}
      primaryActionText={t('alerts.address_wrong_postal_code.save')}
      onPrimaryAction={handleSave}
      secondaryActionText={t('alerts.address_wrong_postal_code.edit')}
      onSecondaryAction={handleEdit}
      onClose={handleEdit}
      closeOnEscape={false}
      imageSrc={addressWrongPostalCodeImage}
    >
      <p>{t('alerts.address_wrong_postal_code.subtitle')}</p>
      <div className="address-wrong-postal-code-modal__address">
        <span>{addressLine1}</span>
        <br />
        <span className="address-wrong-postal-code-modal__postal-code">
          {suggestedPostalCode}
        </span>
        <span>, {town}</span>
      </div>
    </Modal>
  )
}
