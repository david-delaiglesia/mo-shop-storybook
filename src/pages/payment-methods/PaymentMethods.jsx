import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { NoFlexibleLayout } from '@mercadona/mo.library.shop-ui/no-flexible-layout'

import { PaymentContainer } from 'app/user/containers/payment-container'
import { UserAreaMenuContainer } from 'app/user/containers/user-area-menu-container'
import { SOURCES } from 'app/user/metrics'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { Tracker } from 'services/tracker'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

function PaymentMethods() {
  const dispatch = useDispatch()

  useEffect(() => {
    Tracker.sendViewChange(SOURCES.PAYMENTS)
    dispatch(setHeaderType(LayoutHeaderType.DEFAULT))
  }, [])

  const paddingTop = `${NAVBAR_HEIGHT}px`
  const sidebar = <UserAreaMenuContainer />
  const content = <PaymentContainer />
  const footer = <Footer />

  return (
    <NoFlexibleLayout paddingTop={paddingTop}>
      {{
        sidebar,
        content,
        footer,
      }}
    </NoFlexibleLayout>
  )
}

export { PaymentMethods }
