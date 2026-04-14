import { createContext, useContext, useMemo } from 'react'

import { monitoring } from 'monitoring'
import { arrayOf, func, node, number, string } from 'prop-types'

const ShoppingListsContext = createContext(null)

const ShoppingListsProvider = ({
  productsIds,
  children,
  reFetchListDetail,
  listName,
  productsQuantity,
}) => {
  const memoizedContext = useMemo(
    () => ({ productsIds, reFetchListDetail, listName, productsQuantity }),
    [],
  )

  return (
    <ShoppingListsContext.Provider value={memoizedContext}>
      {children}
    </ShoppingListsContext.Provider>
  )
}
const useShoppingListsContext = () => {
  const context = useContext(ShoppingListsContext)

  if (context === null) {
    monitoring.sendMessage(
      'useShoppingListsContext must be used within a ShoppingListsContext',
    )
    const emptyContext = {
      productsIds: [],
      reFetchListDetail: () => null,
      listName: '',
      productsQuantity: 0,
    }

    return emptyContext
  }

  return context
}

ShoppingListsProvider.propTypes = {
  children: node,
  productsIds: arrayOf(string),
  reFetchListDetail: func,
  listName: string.isRequired,
  productsQuantity: number,
}

export { ShoppingListsProvider, useShoppingListsContext }
