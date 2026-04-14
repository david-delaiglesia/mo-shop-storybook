import { useTranslation } from 'react-i18next'

import inaccurateAddressImage from './inaccurate-address.png'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

interface InaccurateAddressModalProps {
  onClick: () => void
}

export const InaccurateAddressModal = ({
  onClick,
}: InaccurateAddressModalProps) => {
  const { t } = useTranslation()

  return (
    <Modal
      size={ModalSize.MEDIUM}
      title={t('inaccurate_address_modal.title')}
      description={t('inaccurate_address_modal.description')}
      imageSrc={inaccurateAddressImage}
      primaryActionText={t('inaccurate_address_modal.button')}
      onPrimaryAction={onClick}
      onClose={onClick}
      closeOnEscape={false}
    />
  )
}
