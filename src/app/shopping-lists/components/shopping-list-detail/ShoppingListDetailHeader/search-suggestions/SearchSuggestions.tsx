import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { SuggestionProductItem } from '../suggestion-product-item'

import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { useShoppingListsContext } from 'app/shopping-lists/infra/shopping-lists-provider'
import { Suggestion } from 'app/shopping-lists/types/Suggestions'
import { StarsIcon } from 'system-ui/icons/StarsIcon'

import './SearchSuggestions.css'

interface SearchSuggestionsProps {
  suggestions: Suggestion[]
  setHasSuggestionsBeenDisplayed: (param: boolean) => void
  hasSuggestionsBeenDisplayed: true
}

export const SearchSuggestions = ({
  suggestions,
  setHasSuggestionsBeenDisplayed,
  hasSuggestionsBeenDisplayed,
}: SearchSuggestionsProps) => {
  const { t } = useTranslation()
  const { listId } = useParams<{ listId: string }>()
  const { listName, productsQuantity } = useShoppingListsContext()

  useEffect(() => {
    if (!hasSuggestionsBeenDisplayed) {
      ShoppingListsMetrics.suggestionsViewed(
        listId,
        listName,
        suggestions,
        productsQuantity,
        'search',
      )
    }

    setHasSuggestionsBeenDisplayed(true)
  }, [])

  return (
    <div>
      <div className="search-suggestions__header body1-sb">
        <div aria-hidden="true">
          <StarsIcon />
        </div>
        {t('shopping_lists.search.suggestions_title')}
      </div>
      <div>
        {suggestions.map((suggestion: Suggestion, index: number) => {
          return (
            <SuggestionProductItem
              key={suggestion.id}
              id={suggestion.id}
              displayName={suggestion.displayName}
              thumbnail={suggestion.thumbnail}
              priceInstructions={suggestion.priceInstructions}
              order={index}
              suggestions={suggestions}
            />
          )
        })}
      </div>
    </div>
  )
}
