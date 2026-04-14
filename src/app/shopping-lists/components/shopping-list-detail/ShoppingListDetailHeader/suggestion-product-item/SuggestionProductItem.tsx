import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

import { ProductPrice } from 'app/catalog/components/product-price'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { useShoppingListsContext } from 'app/shopping-lists/infra/shopping-lists-provider'
import {
  PriceInstructions,
  Suggestion,
} from 'app/shopping-lists/types/Suggestions'
import { ShoppingListIcon } from 'system-ui/icons'
import { ShoppingListIconEmpty } from 'system-ui/icons/ShoppingListIconEmpty'

import './SuggestionProductItem.css'

interface SuggestionProductItemProps {
  displayName: string
  thumbnail: string
  priceInstructions: PriceInstructions
  id: string
  order: number
  suggestions: Suggestion[]
}

export const SuggestionProductItem = ({
  id,
  displayName,
  thumbnail,
  priceInstructions,
  order,
  suggestions,
}: SuggestionProductItemProps) => {
  const {
    reFetchListDetail,
    productsIds,
    listName,
  }: {
    reFetchListDetail: (shouldFetchSuggestions?: boolean) => void
    productsIds: string[]
    listName: string
  } = useShoppingListsContext()
  const { t } = useTranslation()
  // @ts-expect-error DefaultRootState
  const user = useSelector((state) => state.user)
  const { listId } = useParams<{ listId: string }>()

  const isProductInList = productsIds?.includes(id)
  const [isSaved, setIsSaved] = useState(isProductInList)

  const addProductToList = async () => {
    setIsSaved(true)
    await ShoppingListsClient.addProductToShoppingList(user.uuid, id, listId)

    reFetchListDetail(false)

    ShoppingListsMetrics.suggestionAdded(
      listId,
      listName,
      id,
      displayName,
      suggestions,
      order,
      'search',
      'add',
    )
  }

  const removeProductFromList = async () => {
    setIsSaved(false)

    await ShoppingListsClient.deleteProductFromShoppingList(
      user.uuid,
      listId,
      id,
    )

    reFetchListDetail(false)

    ShoppingListsMetrics.suggestionAdded(
      listId,
      listName,
      id,
      displayName,
      suggestions,
      order,
      'search',
      'remove',
    )
  }

  return (
    <div
      aria-label={displayName}
      className="suggestion-product-item__container"
    >
      <div className="suggestion-product-item__wrapper">
        <img
          alt=""
          src={thumbnail}
          className="suggestion-product-item__image"
        />
        <div className="suggestion-product-item__data">
          <div className="suggestion-product-item__name subhead1-r">
            {displayName}
          </div>
          <ProductPrice priceInstructions={priceInstructions} />
        </div>
        {!isSaved && (
          <div className="search-product-item__action-wrapper--not-saved">
            <button
              onClick={addProductToList}
              className="subhead1-sb search-product-item__action-wrapper"
              type="button"
            >
              <ShoppingListIconEmpty className="suggestion-product-item__save-button-icon" />
              {t('shopping_lists.search.save')}
            </button>
          </div>
        )}
        {isSaved && (
          <div className="search-product-item__action-wrapper search-product-item__action-wrapper--saved">
            <button
              onClick={removeProductFromList}
              className="subhead1-sb search-product-item__action-wrapper"
              type="button"
            >
              <ShoppingListIcon className="search-product-item__saved-icon" />
              {t('shopping_lists.search.saved')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
