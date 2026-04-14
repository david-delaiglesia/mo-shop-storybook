import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { array, bool, func, object, string } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import { SuggestionCard } from 'app/shopping-lists/components/shopping-list-detail/components/suggestion-card'
import { SuggestionSkeleton } from 'app/shopping-lists/components/shopping-list-detail/components/suggestion-skeleton'
import { useShoppingListId } from 'app/shopping-lists/components/shopping-list-detail/useShoppingListId.js'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { StarsIcon } from 'system-ui/icons/StarsIcon'
import { TAB_INDEX } from 'utils/constants'

import './SuggestionsList.css'

export const SuggestionsList = ({
  suggestionCardRef,
  isDisplaySkeleton,
  suggestions,
  reFetchListDetailFromSuggestion,
  setIsPolling,
  isPolling,
  listDetailName,
}) => {
  const { listId } = useShoppingListId()
  const isEmptySuggestions = suggestions?.length === 0
  const userUuid = useSelector((state) => state?.session?.uuid)
  const { t } = useTranslation()

  const sendAdditionMetrics = (productId, producName, order) => {
    ShoppingListsMetrics.suggestionAdded(
      listId,
      listDetailName,
      productId,
      producName,
      suggestions,
      order,
      'bottom_list',
      'add',
    )
  }

  const reloadSuggestions = async () => {
    await ShoppingListsClient.refreshSuggestions(userUuid, listId)
    setIsPolling(true)
    ShoppingListsMetrics.suggestionsReloadClick(
      listId,
      listDetailName,
      suggestions,
    )
  }

  return (
    <div className="shopping-list-detail-suggestions-list__container">
      <section className="shopping-list-detail-suggestions-list__wrapper">
        <div className="shopping-list-detail-suggestions-list__title-wrapper">
          <div className="shopping-list-detail-suggestions-list__title">
            <div data-testid="suggestions-thumbnail" aria-hidden="true">
              <StarsIcon />
            </div>
            <div className="body1-sb" tabIndex={TAB_INDEX.ENABLED}>
              {t('shopping_lists.suggestions.title')}
            </div>
          </div>
          {!isEmptySuggestions && (
            <div className="shopping-list-detail-suggestions-list__reload-title">
              <Button variant="text" onClick={reloadSuggestions}>
                {t('shopping_lists.suggestions.more_suggestions')}
              </Button>
            </div>
          )}
        </div>
        <div className="shopping-list-detail-suggestions-list__products">
          {isDisplaySkeleton && (
            <>
              <SuggestionSkeleton />
              <SuggestionSkeleton />
              <SuggestionSkeleton />
              <SuggestionSkeleton />
            </>
          )}
          {!isDisplaySkeleton &&
            suggestions.map((suggestion, index) => {
              const isFirstCard = index === 0
              const cardRef = isFirstCard ? suggestionCardRef : null

              return (
                <div key={index} ref={cardRef}>
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    reFetchListDetailFromSuggestion={
                      reFetchListDetailFromSuggestion
                    }
                    setIsPolling={setIsPolling}
                    sendAdditionMetrics={sendAdditionMetrics}
                    order={index + 1}
                  />
                </div>
              )
            })}
          {isEmptySuggestions && !isPolling && (
            <div className="body1-r shopping-list-detail-suggestions-list__empty-suggestion">
              {t('shopping_lists.suggestions.empty_results')}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

SuggestionsList.propTypes = {
  suggestionCardRef: object,
  isDisplaySkeleton: bool,
  suggestions: array,
  reFetchListDetailFromSuggestion: func,
  setIsPolling: func,
  isPolling: bool,
  listDetailName: string,
}
