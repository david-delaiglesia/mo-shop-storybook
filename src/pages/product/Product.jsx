import { Component } from 'react'
import { connect } from 'react-redux'

import { func, shape, string } from 'prop-types'

import { BlankLayout } from '@mercadona/mo.library.shop-ui/blank-layout'

import { SignInModal } from 'app/authentication/components/sign-in-modal'
import { ProductDetailContainer } from 'app/catalog/containers/product-detail-container'
import { SOURCE_CODES } from 'app/catalog/metrics'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { URL_PARAMS } from 'pages/paths'
import { Session } from 'services/session'
import { Tracker } from 'services/tracker'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

const SOURCE = 'product'
const isPublicMode = (postalCode = '') => postalCode === ''

class Product extends Component {
  componentDidMount() {
    this.sendViewMetrics()
    this.setHeaderType()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.session.postalCode === this.props.session.postalCode)
      return null

    this.setHeaderType()
  }

  setHeaderType = () => {
    const {
      session: { postalCode },
      setHeaderType,
    } = this.props
    const publicMode = isPublicMode(postalCode)

    const headerType = publicMode
      ? LayoutHeaderType.SIMPLIFIED
      : LayoutHeaderType.DEFAULT

    setHeaderType(headerType)
  }

  sendViewMetrics = () => {
    const {
      session: { postalCode },
    } = this.props
    const options = { public_mode: isPublicMode(postalCode) }

    const searchParams = new URLSearchParams(location.search)
    const campaignId = searchParams.get(URL_PARAMS.CAMPAIGN)

    if (campaignId) {
      options.campaign = campaignId
    }

    Tracker.sendViewChange(SOURCE, options)
  }

  render() {
    const {
      match: { params },
      session: { postalCode },
    } = this.props
    const { warehouse } = Session.get()

    const productId = params.id
    const publicMode = isPublicMode(postalCode)
    const paddingTop = `${NAVBAR_HEIGHT}px`

    const content = (
      <ProductDetailContainer
        productId={productId}
        publicMode={publicMode}
        source={SOURCE}
        sourceCode={SOURCE_CODES.PRODUCT_LINK}
        warehouse={warehouse}
      />
    )
    const footer = <Footer />

    return (
      <>
        <SignInModal />
        <BlankLayout paddingTop={paddingTop}>{{ content, footer }}</BlankLayout>
      </>
    )
  }
}

Product.propTypes = {
  session: shape({
    postalCode: string,
  }).isRequired,
  match: shape({
    params: shape({
      id: string,
    }).isRequired,
  }).isRequired,
  setHeaderType: func.isRequired,
}

const mapStateToProps = ({ session }) => ({
  session,
})

const mapDispatchToProps = {
  setHeaderType,
}

const ConnectedProduct = connect(mapStateToProps, mapDispatchToProps)(Product)

export { ConnectedProduct as Product }
