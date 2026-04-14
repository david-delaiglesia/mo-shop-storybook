import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { useUserUUID } from 'app/authentication'
import { Product } from 'app/products'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { TAB_INDEX } from 'utils/constants'

import './NewArrivalLabel.css'

interface NewArrivalLabelProps {
  product: Product
}
export const NewArrivalLabel = ({ product }: NewArrivalLabelProps) => {
  const { t } = useTranslation()
  const location = useLocation()
  const userId = useUserUUID()
  const isNewArrivalLabelRedesignActive = useFlag(
    knownFeatureFlags.WEB_NEW_ARRIVAL_LABEL_REDESIGN,
  )

  const isInCategory =
    location.pathname.includes('categories') ||
    location.search.includes('category')
  const isNewArrival = product.is_new_arrival

  const shouldShowLabel = isInCategory && isNewArrival && userId

  if (!shouldShowLabel) {
    return <></>
  }

  return (
    <div
      tabIndex={TAB_INDEX.ENABLED}
      className={`product-cell__new-arrival-label${isNewArrivalLabelRedesignActive ? ' product-cell__new-arrival-label--redesign' : ''}`}
    >
      {isNewArrivalLabelRedesignActive
        ? t('is_new_badge')
        : t('is_new_badge').toUpperCase()}
    </div>
  )
}
