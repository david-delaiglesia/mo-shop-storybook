import { useState } from 'react'

import { useUserUUID } from 'app/authentication'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'

export const useAddProductToShoppingList = ({ productId, listId }) => {
  const userId = useUserUUID()

  const [isAddingProductToList, setIsAddingProductToList] = useState(false)

  const addProductToShoppingList = async ({ onSuccess, onError }) => {
    try {
      setIsAddingProductToList(true)
      await ShoppingListsClient.addProductToShoppingList(
        userId,
        productId,
        listId,
      )
      setIsAddingProductToList(false)
      onSuccess?.()
    } catch {
      setIsAddingProductToList(false)
      onError?.()
    }
  }

  return { addProductToShoppingList, isAddingProductToList }
}
