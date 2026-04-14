import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import Loader from 'components/loader'

import './PageLoader.css'

export const PageLoader = () => {
  const { t } = useTranslation()

  return createPortal(
    <div className="page-loader" aria-label={t('aria_loading')}>
      <Loader />
    </div>,
    document.body,
  )
}
