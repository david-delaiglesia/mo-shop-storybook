import { useTranslation } from 'react-i18next'

import { Loader } from '@mercadona/mo.library.shop-ui/loader'
import { Modal } from '@mercadona/mo.library.shop-ui/modal'

import './PSD2Loader.css'

export const PSD2Loader = () => {
  const { t } = useTranslation()

  return (
    <Modal
      size="small"
      title={t('psd2_global_loader_title')}
      description={t('psd2_global_loader_explanation')}
      onClose={() => null}
    >
      <Loader className="psd2-loader" />
    </Modal>
  )
}
