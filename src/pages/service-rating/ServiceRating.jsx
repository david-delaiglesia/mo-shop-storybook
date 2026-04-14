import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { func, object, shape } from 'prop-types'

import { BlankLayout } from '@mercadona/mo.library.shop-ui/blank-layout'

import { ServiceRatingContainer } from 'app/service-rating/containers/service-rating-container'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { PATHS } from 'pages/paths'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

const ServiceRating = ({ match, history }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setHeaderType(LayoutHeaderType.SIMPLIFIED))
  }, [])

  const goHome = () => {
    history.push({ pathname: PATHS.HOME })
  }

  const paddingTop = `${NAVBAR_HEIGHT}px`
  const content = (
    <ServiceRatingContainer token={match.params.token} onFinish={goHome} />
  )
  const footer = <Footer />

  return (
    <BlankLayout paddingTop={paddingTop}>{{ content, footer }}</BlankLayout>
  )
}

ServiceRating.propTypes = {
  match: object.isRequired,
  history: shape({
    push: func.isRequired,
  }).isRequired,
}

export { ServiceRating }
