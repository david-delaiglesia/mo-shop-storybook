import { Skeleton } from 'system-ui/skeleton'
import { TAB_INDEX } from 'utils/constants'

import './SuggestionSkeleton.css'

export const SuggestionSkeleton = () => {
  return (
    <div
      className="shopping-list-suggestion-skeleton__card"
      aria-label="Cargando sugerencias"
      tabIndex={TAB_INDEX.ENABLED}
    >
      <div className="shopping-list-suggestion-skeleton__image">
        <Skeleton />
      </div>
      <div className="shopping-list-suggestion-skeleton__data">
        <div className="shopping-list-suggestion-skeleton__product-name">
          <Skeleton />
        </div>
        <div className="shopping-list-suggestion-skeleton__product-name--second-line">
          <Skeleton />
        </div>
        <div className="shopping-list-suggestion-skeleton__price">
          <Skeleton />
        </div>
        <div className="shopping-list-suggestion-skeleton__save-button-wrapper">
          <div className="shopping-list-suggestion-skeleton__save-button">
            <Skeleton />
          </div>
          <div className="shopping-list-suggestion-skeleton__save-button-title">
            <Skeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
