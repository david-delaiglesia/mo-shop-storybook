import { useEffect, useMemo } from 'react'

import { formatOrderByMonth } from './utils'

import { OrdersList } from 'app/order/components/orders-list'
import OrdersPlaceHolder from 'app/order/components/orders-placeholder'
import { useOrdersByUser } from 'app/order/hooks/useOrdersByUser'
import { sendMyPurchasesViewMetrics } from 'app/user/metrics'
import { Tracker } from 'services/tracker'

export const OrdersListContainer = () => {
  const { orders, isLoading, fetchNextPage, hasNextPage } = useOrdersByUser()

  const ordersByMonth = useMemo(() => formatOrderByMonth(orders), [orders])

  useEffect(() => {
    sendMyPurchasesViewMetrics()
  }, [])

  if (!isLoading && orders.length === 0) {
    return <OrdersPlaceHolder />
  }

  return (
    <OrdersList
      onViewMoreClick={() => {
        fetchNextPage()
        Tracker.sendInteraction('my_purchases_view_see_more_click')
      }}
      isViewMoreButtonVisible={hasNextPage}
      ordersByMonth={ordersByMonth}
      isLoading={isLoading}
    />
  )
}
