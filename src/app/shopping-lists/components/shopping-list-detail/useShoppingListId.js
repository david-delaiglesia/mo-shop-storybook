import { useLocation, useParams } from 'react-router-dom'

export const useShoppingListId = () => {
  const { listId } = useParams()
  const { search } = useLocation()

  if (listId) {
    return { listId, cartMode: 'purchase' }
  }

  const searchParams = new URLSearchParams(search)
  return { listId: searchParams.get('shopping-list-id'), cartMode: 'edit' }
}
