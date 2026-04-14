import { useCallback, useEffect, useMemo, useState } from 'react'

import { OrderClient } from '../client'

import { useUserUUID } from 'app/authentication'

const FIRST_PAGE = 1

export const useOrdersByUser = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [nextPage, setNextPage] = useState(null)

  const userUuid = useUserUUID()

  const fetchOrders = async (page = FIRST_PAGE) => {
    const result = await OrderClient.getByPage(userUuid, page)
    if (!result) return

    setOrders((currentOrders) =>
      [...currentOrders, ...result.orders]
        // Remove repeated orders
        .filter(
          (order, index, self) =>
            self.findIndex((selfItem) => selfItem.id === order.id) === index,
        ),
    )
    setNextPage(result.nextPage)
  }

  const fetchInitialOrders = async () => {
    setIsLoading(true)
    await fetchOrders(FIRST_PAGE)
    setIsLoading(false)
  }

  const fetchNextPage = useCallback(() => {
    if (!nextPage || isLoading) return
    fetchOrders(nextPage)
  }, [nextPage, isLoading])

  const hasNextPage = useMemo(
    () => nextPage !== null && !isLoading,
    [nextPage, isLoading],
  )

  useEffect(() => {
    fetchInitialOrders()
  }, [])

  return {
    orders,
    isLoading,
    fetchNextPage,
    hasNextPage,
  }
}
