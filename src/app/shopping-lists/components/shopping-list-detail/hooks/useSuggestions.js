import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { useShoppingListId } from '../useShoppingListId'

import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'

export const useSuggestions = ({ listDetail, isPolling, setIsPolling }) => {
  const userUuid = useSelector((state) => state?.session?.uuid)
  const { listId } = useShoppingListId()

  const [suggestions, setSuggestions] = useState([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true)
  const [isAssistedList, setIsAssistedList] = useState(true)
  const [isDisplaySkeleton, setIsDisplaySkeleton] = useState(true)

  const SUGGESTIONS_NOT_SUPPORTED = 420

  const fetchSuggestions = async () => {
    if (userUuid === undefined) {
      return
    }

    try {
      const suggestionsResponse = await ShoppingListsClient.fetchSuggestions(
        userUuid,
        listId,
      )

      ShoppingListsMetrics.suggestionsLoaded(
        listId,
        listDetail?.name,
        suggestionsResponse,
        listDetail?.products_quantity,
        'bottom_list',
      )
      setSuggestions(suggestionsResponse)
      setIsPolling(false)
      setIsLoadingSuggestions(false)
      setIsDisplaySkeleton(false)
    } catch (error) {
      if (error.status === SUGGESTIONS_NOT_SUPPORTED) {
        setIsLoadingSuggestions(false)
        setIsPolling(false)
        setIsAssistedList(false)
        setIsDisplaySkeleton(false)
        return
      }

      setIsDisplaySkeleton(true)
      setIsLoadingSuggestions(false)
      return
    }
  }

  useEffect(() => {
    if (!listDetail) {
      return
    }

    let intervalId

    if (isPolling) {
      fetchSuggestions()

      intervalId = setInterval(fetchSuggestions, 2000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isPolling, listDetail])

  return {
    suggestions,
    isAssistedList,
    isLoadingSuggestions,
    isDisplaySkeleton,
    isPolling,
    setIsPolling,
  }
}
