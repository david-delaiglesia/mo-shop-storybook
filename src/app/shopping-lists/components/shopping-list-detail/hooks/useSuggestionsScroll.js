import { useEffect, useRef } from 'react'

import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'

export const useSuggestionsScroll = ({
  listId,
  listDetail,
  suggestions,
  suggestionCardRef,
}) => {
  const isListenToScrollEvent = useRef(true)

  const isElementVisible = (element) => {
    if (!element) return false
    const rect = element.getBoundingClientRect()
    return (
      rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight)
    )
  }

  useEffect(() => {
    const handleOnScroll = (listDetail, suggestions) => {
      if (
        isElementVisible(suggestionCardRef?.current) &&
        isListenToScrollEvent.current
      ) {
        ShoppingListsMetrics.suggestionsViewed(
          listId,
          listDetail?.name,
          suggestions,
          listDetail?.products_quantity,
          'bottom_list',
        )

        isListenToScrollEvent.current = false
      }
    }

    if (suggestions.length > 0 && listDetail) {
      window.addEventListener(
        'scrollend',
        () => handleOnScroll(listDetail, suggestions),
        { capture: true },
      )
    }
  }, [listDetail, suggestions, listId])

  return {
    suggestionCardRef,
  }
}
