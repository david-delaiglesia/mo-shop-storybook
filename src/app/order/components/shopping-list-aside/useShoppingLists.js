import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { ShoppingListsClient } from 'app/shopping-lists/infra/client'

export const useShoppingLists = () => {
  const [response, setResponse] = useState({ shoppingLists: [] })
  const [isLoading, setIsLoading] = useState(true)
  const userUuid = useSelector((state) => state?.session?.uuid)

  useEffect(() => {
    const fetchShoppingLists = async () => {
      const response = await ShoppingListsClient.getAll(userUuid)
      setResponse(response)
      setIsLoading(false)
    }

    if (userUuid) {
      fetchShoppingLists()
    }
  }, [userUuid])

  return [response, isLoading]
}
