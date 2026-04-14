import { useEffect } from 'react'
import { useParams } from 'react-router'

import { BoxedLayout } from '@mercadona/mo.library.shop-ui/layouts'

import { OrderConfirmedCard } from 'app/order/components/order-confirmed-card'
import { OrderProvider } from 'app/order/contexts/OrderContext'
import { useAppDispatch } from 'app/redux'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

export const PurchaseConfirmationPage = () => {
  const dispatch = useAppDispatch()

  const { id: orderId } = useParams<{ id: string }>()

  useEffect(() => {
    dispatch(setHeaderType(LayoutHeaderType.SIMPLIFIED))
  }, [])

  const content = (
    <OrderProvider orderId={orderId}>
      <OrderConfirmedCard />
    </OrderProvider>
  )
  const footer = <Footer as="div" />

  return (
    <>
      <BoxedLayout
        marginTop={`${NAVBAR_HEIGHT}px`}
        backgroundColor="var(--white-cream-light)"
      >
        {{ content, footer }}
      </BoxedLayout>
    </>
  )
}
