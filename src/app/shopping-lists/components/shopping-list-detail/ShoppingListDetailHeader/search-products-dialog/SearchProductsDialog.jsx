import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { SearchProductItem } from '../search-product-item'
import { useSearch } from './useSearch'
import { func } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider/withTranslate'
import { SearchBox } from 'app/search/components/search-box'
import { SearchNoResults } from 'app/search/components/search-no-results'
import { SearchSuggestions } from 'app/shopping-lists/components/shopping-list-detail/ShoppingListDetailHeader/search-suggestions'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { useShoppingListsContext } from 'app/shopping-lists/infra/shopping-lists-provider'
import Modal from 'components/modal'
import { CloseModalButton } from 'system-ui/close-modal-button'

import './SearchProductsDialog.css'

const SearchProductsDialog = ({ t, hideDialog }) => {
  const { listName } = useShoppingListsContext()
  const { listId } = useParams()
  const userUuid = useSelector((state) => state?.session?.uuid)
  const [searchQuery, setSearchQuery] = useState('')
  const [prevSearchQuery, setPrevSearchQuery] = useState('')

  const { searchResults, isLoading, isDirty } = useSearch(
    searchQuery,
    prevSearchQuery,
  )
  const [suggestions, setSuggestions] = useState([])
  const [hasSuggestionsBeenDisplayed, setHasSuggestionsBeenDisplayed] =
    useState(false)
  const [hasSuggestionsBeenInvalidated, invalidateSuggestions] = useState(false)

  const inputRef = useRef(null)
  const fetchSearchSuggestions = async () => {
    try {
      const suggestionsResponse =
        await ShoppingListsClient.fetchSearchSuggestions(userUuid, listId)

      setSuggestions(suggestionsResponse)
    } catch {
      /* empty */
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }

    fetchSearchSuggestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (searchQuery !== '') {
      ShoppingListsMetrics.addProductsSearchResults(
        listId,
        listName,
        searchQuery,
        searchResults.hits.length,
        searchResults.hits.map((hit) => hit.id),
      )
    }
  }, [searchResults])

  const displayEmptyPlaceHolder =
    searchResults.hits.length === 0 && !isLoading && isDirty

  const shouldDisplaySuggestions =
    suggestions.length > 0 &&
    searchQuery === '' &&
    !hasSuggestionsBeenInvalidated

  return (
    <Modal
      className="shopping-lists-search-products-dialog"
      onClose={hideDialog}
      ariaLabelModal="shopping_lists.header_actions.search_products"
      clickout
    >
      <div className="shopping-list-search-products-content__wrapper">
        <h3 className="shopping-list-search-products-content__tile title2-b">
          {t('shopping_lists.header_actions.search_products')}
        </h3>
        <CloseModalButton
          aria-label={t('accessibility.close_list_add_products_modal')}
          onClick={hideDialog}
        />
        <div className="shopping-list-search-products-content__search-input">
          <SearchBox
            searchValue={searchQuery}
            onChange={(event) => {
              const query = event.target.value
              setPrevSearchQuery(searchQuery)
              setSearchQuery(query)
              if (hasSuggestionsBeenDisplayed) {
                invalidateSuggestions(false)
              } else {
                invalidateSuggestions(true)
              }
            }}
            onClose={() => {
              setSearchQuery('')
            }}
            inputRef={inputRef}
          />
        </div>
        {displayEmptyPlaceHolder && <SearchNoResults />}
        <div className="shopping-list-search-products-content__results">
          <>
            {searchResults.hits.map((result) => {
              return <SearchProductItem key={result.id} result={result} />
            })}
            {searchResults.hits.length > 0 && (
              <div className="shopping-list-search-products-content__results-empty-bottom-placeholder" />
            )}
            {shouldDisplaySuggestions && (
              <SearchSuggestions
                suggestions={suggestions}
                setHasSuggestionsBeenDisplayed={setHasSuggestionsBeenDisplayed}
                hasSuggestionsBeenDisplayed={hasSuggestionsBeenDisplayed}
              />
            )}
          </>
        </div>
      </div>
    </Modal>
  )
}

SearchProductsDialog.propTypes = {
  t: func,
  hideDialog: func,
}

const SearchProductsDialogWithTranslate = withTranslate(SearchProductsDialog)

export { SearchProductsDialogWithTranslate as SearchProductsDialog }
