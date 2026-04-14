import { groupBy } from 'utils/collections'
import { getStringMonthDay, getYear } from 'utils/dates'

const isOrderBefore = (orderA, orderB) => {
  return new Date(orderB.slot.start) - new Date(orderA.slot.start)
}

const keyModifier = ({ start }) => {
  return `${getStringMonthDay(start)} ${getYear(start)}`
}

const formatGroupedOrders = (ordersGroupedByMonth) => {
  return Object.keys(ordersGroupedByMonth).map((month) => ({
    month,
    orders: ordersGroupedByMonth[month],
  }))
}

export const formatOrderByMonth = (orders) => {
  const sortedOrders = orders.sort(isOrderBefore)
  const ordersGroupedByMonth = groupBy(sortedOrders, 'slot', keyModifier)
  const ordersByMonth = formatGroupedOrders(ordersGroupedByMonth)

  return ordersByMonth
}
