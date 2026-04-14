import { useParams } from 'react-router-dom'

import { OrderDetailContainer } from '../order-detail-container'

import { useExternalNotificationListener } from 'app/notifications'
import { OrderProvider } from 'app/order/contexts/OrderContext'
import { OrderPSD2Provider } from 'app/payment'
import { OrderPaymentsProvider } from 'app/payment/contexts/OrderPaymentsContext'

export const OrderDetailPage = () => {
  const { id: orderId } = useParams<{ id: string }>()

  useExternalNotificationListener({ orderId })

  return (
    <OrderProvider orderId={orderId} deferred>
      <OrderPSD2Provider>
        <OrderPaymentsProvider>
          <OrderDetailContainer />
        </OrderPaymentsProvider>
      </OrderPSD2Provider>
    </OrderProvider>
  )
}
