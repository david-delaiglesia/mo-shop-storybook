import { useState } from 'react'

import classNames from 'classnames'
import { func, number, object } from 'prop-types'

import { ProductPrice } from 'app/catalog/components/product-price'
import { SaveSuggestionButton } from 'app/shopping-lists/components/shopping-list-detail/components/save-suggestion-button'

import './SuggestionCard.css'

export const SuggestionCard = ({
  suggestion,
  reFetchListDetailFromSuggestion,
  setIsPolling,
  sendAdditionMetrics,
  order,
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const animationWrapperClassName = classNames(
    'shopping-list-detail-suggestion-card__animation-wrapper',
    {
      'shopping-list-detail-suggestion-card__animation-wrapper--loaded':
        isImageLoaded,
    },
  )
  return (
    <div className="shopping-list-detail-suggestion-card__wrapper">
      <div className={animationWrapperClassName}>
        <img
          className="shopping-list-detail-suggestion-card__image"
          src={suggestion.thumbnail}
          alt=""
          onLoad={() => setIsImageLoaded(true)}
        />
        <div className="shopping-list-detail-suggestion-card__data">
          <div>
            <div className="shopping-list-detail-suggestion-card__product-name">
              {suggestion.displayName}
            </div>
            <ProductPrice priceInstructions={suggestion.priceInstructions} />
          </div>
          <SaveSuggestionButton
            suggestionId={suggestion.id}
            suggestionName={suggestion.displayName}
            reFetchListDetailFromSuggestion={reFetchListDetailFromSuggestion}
            setIsPolling={setIsPolling}
            sendAdditionMetrics={sendAdditionMetrics}
            order={order}
          />
        </div>
      </div>
    </div>
  )
}

SuggestionCard.propTypes = {
  suggestion: object,
  reFetchListDetailFromSuggestion: func,
  setIsPolling: func,
  sendAdditionMetrics: func,
  order: number,
}
