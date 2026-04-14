import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useShoppingListId } from '../useShoppingListId'

import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { addArrayProduct } from 'pages/product/actions'

export const useShoppingListDetail = ({ setIsPolling, suggestionCardRef }) => {
  const { listId, cartMode } = useShoppingListId()
  const userUuid = useSelector((state) => state?.session?.uuid)
  const { warehouse } = useSelector((state) => state.session)

  const dispatch = useDispatch()

  const [listDetail, setListDetail] = useState()

  const normalizeProducts = (response) => {
    if (!response) {
      return []
    }

    return response.items.reduce((accumulator, item) => {
      accumulator[item.product.id] = {
        ...item.product,
        ...{
          recommendedQuantity: item.recommended_quantity,
        },
      }
      return accumulator
    }, {})
  }

  const fetchListDetail = async () => {
    if (userUuid === undefined) {
      return
    }

    setIsPolling(true)

    const response = await ShoppingListsClient.fetchShoppingListDetail(
      userUuid,
      listId,
    )

    const normalizedProducts = normalizeProducts(response)

    dispatch(addArrayProduct(normalizedProducts))
    setListDetail(response)

    ShoppingListsMetrics.listDetailView(
      listId,
      response?.name,
      response?.products_quantity,
      cartMode,
    )
  }

  const reFetchListDetailFromSuggestion = async () => {
    await reFetchListDetail()

    const element = suggestionCardRef.current
    if (element) {
      element.scrollIntoView()
    }
  }

  const reFetchListDetail = async (shouldFetchSuggestions = true) => {
    const response = await ShoppingListsClient.fetchShoppingListDetail(
      userUuid,
      listId,
    )

    const normalizedProducts = normalizeProducts(response)
    dispatch(addArrayProduct(normalizedProducts))

    setListDetail(response)
    setIsPolling(shouldFetchSuggestions)
  }

  useEffect(() => {
    fetchListDetail()
  }, [userUuid, listId, warehouse])

  return {
    reFetchListDetail,
    reFetchListDetailFromSuggestion,
    listDetail,
  }
}
