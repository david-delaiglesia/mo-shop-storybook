import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { func, number, string } from 'prop-types'

import { ShoppingListsErrorDialog } from 'app/shopping-lists/components/shopping-lists-error-dialog'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListIcon } from 'system-ui/icons/ShoppingListIcon'
import { ShoppingListIconEmpty } from 'system-ui/icons/ShoppingListIconEmpty'

import './SaveSuggestionButton.css'

export const SaveSuggestionButton = ({
  suggestionId,
  suggestionName,
  reFetchListDetailFromSuggestion,
  setIsPolling,
  sendAdditionMetrics,
  order,
}) => {
  const [isSaved, setIsSaved] = useState(false)
  const [isDisplayError, setIsDisplayError] = useState(false)
  const { listId } = useParams()
  const user = useSelector((state) => state.user)
  const { t } = useTranslation()

  return (
    <div>
      {!isSaved && (
        <button
          className="shopping-list-detail-save-suggestion-button__button shopping-list-detail-save-suggestion-button__button--not-saved"
          onClick={async () => {
            setIsSaved(true)
            try {
              await ShoppingListsClient.addProductToShoppingList(
                user.uuid,
                suggestionId,
                listId,
              )
              setIsPolling(true)
              reFetchListDetailFromSuggestion()
              sendAdditionMetrics(suggestionId, suggestionName, order)
            } catch {
              setIsDisplayError(true)
            }
          }}
          type="button"
        >
          <ShoppingListIconEmpty className="search-product-item__save-button-icon" />
          {t('shopping_lists.search.save')}
        </button>
      )}
      {isSaved && (
        <button
          className="shopping-list-detail-save-suggestion-button__button shopping-list-detail-save-suggestion-button__button--saved"
          onClick={() => null}
          type="button"
        >
          <ShoppingListIcon className="search-product-item__saved-icon" />
          {t('shopping_lists.search.saved')}
        </button>
      )}
      {isDisplayError && (
        <ShoppingListsErrorDialog
          message={t('error_something_went_wrong_subtitle')}
          closeDialog={() => {
            setIsSaved(false)
            setIsDisplayError(false)
          }}
        />
      )}
    </div>
  )
}

SaveSuggestionButton.propTypes = {
  suggestionId: string,
  suggestionName: string,
  reFetchListDetailFromSuggestion: func,
  setIsPolling: func,
  sendAdditionMetrics: func,
  order: number,
}
