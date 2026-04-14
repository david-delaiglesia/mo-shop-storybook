import { OrderDetailPage } from 'app/order/containers/order-detail-page'
import { OrdersListContainer } from 'app/order/containers/orders-list-container'
import { PATHS } from 'pages/paths'

export const userAreaRoutes = {
  USER_AREA_ORDERS: {
    path: PATHS.USER_AREA_ORDERS,
    component: OrdersListContainer,
    exact: true,
  },
  USER_AREA_ORDERS_ID: {
    path: PATHS.USER_AREA_ORDERS_ID,
    component: OrderDetailPage,
    exact: true,
  },
}
