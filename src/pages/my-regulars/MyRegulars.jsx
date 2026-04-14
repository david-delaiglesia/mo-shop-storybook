import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { bool, string } from 'prop-types'

import { BlankLayout } from '@mercadona/mo.library.shop-ui/blank-layout'

import { SignInModal } from 'app/authentication/components/sign-in-modal'
import { SOURCES } from 'app/catalog/metrics'
import { MyRegularsContainer } from 'app/my-regulars/containers/my-regulars-container'
import { useOrder } from 'app/order/context'
import { ShoppingListsTabs } from 'app/shopping-lists/components/shopping-lists-tabs'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { PATHS, URL_PARAMS } from 'pages/paths'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { Session } from 'services/session'
import { Tracker } from 'services/tracker'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

const MyRegulars = ({ withLayout = true }) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const isShoppingListsTabsEnabled = useFlag(
    knownFeatureFlags.SHOPPING_LISTS_TABS,
  )

  const { warehouse: sessionWareHouse } = Session.get()
  const order = useOrder()
  const isEditOrderPage = location.pathname.includes('/edit/products')
  const warehouse = isEditOrderPage
    ? (order?.warehouse ?? sessionWareHouse)
    : sessionWareHouse

  useEffect(() => {
    dispatch(setHeaderType(LayoutHeaderType.DEFAULT))
    Tracker.sendViewChange(SOURCES.MY_REGULARS)
  }, [])

  const goTo = (location, state = {}) => {
    history.push(location, {
      ...state,
      from: { pathname: PATHS.MY_REGULARS },
    })
  }

  const goToRegister = () => {
    const { location } = history
    const searchParams = new URLSearchParams(location.search)
    searchParams.set(URL_PARAMS.AUTHENTICATE_USER, '')
    goTo(
      { pathname: location.pathname, search: searchParams.toString() },
      { isBeingAuthorizedFromRecommendations: true },
    )
  }

  const goToCategories = () => {
    if (isEditOrderPage) {
      goTo(`/orders/${order?.id}/edit/products?display-categories=true`)
      return
    }
    goTo(PATHS.CATEGORIES)
  }

  const myRegularsContent = (
    <MyRegularsContainer
      goToCategories={goToCategories}
      goToRegister={goToRegister}
      warehouse={warehouse}
    />
  )

  const content = isShoppingListsTabsEnabled ? (
    <ShoppingListsTabs>{myRegularsContent}</ShoppingListsTabs>
  ) : (
    myRegularsContent
  )
  const footer = <Footer />

  return (
    <>
      <SignInModal />
      {withLayout && (
        <BlankLayout paddingTop={`${NAVBAR_HEIGHT}px`}>
          {{ content, footer }}
        </BlankLayout>
      )}
      {!withLayout && <>{content}</>}
    </>
  )
}

MyRegulars.propTypes = {
  paddingTop: string,
  withLayout: bool,
}

export { MyRegulars }
