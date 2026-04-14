import { Fragment } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import { LayoutHeaderType } from './constants'
import { bool, string } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { CheckoutHeader } from 'app/checkout/components/checkout-header'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Header from 'components/header'
import { cancelCheckout } from 'pages/create-checkout/actions'

const HeaderSwitch = ({ headerType, overlay }) => {
  return (
    <Fragment>
      {
        {
          [LayoutHeaderType.DEFAULT]: <Header overlay={overlay} />,
          [LayoutHeaderType.SIMPLIFIED]: <Header simplified />,
          [LayoutHeaderType.CHECKOUT]: <CheckoutHeader />,
          [LayoutHeaderType.NONE]: null,
        }[headerType]
      }
    </Fragment>
  )
}

HeaderSwitch.propTypes = {
  headerType: string.isRequired,
  overlay: bool.isRequired,
}

const mapStateToProps = ({ ui: { headerType, overlay } }) => ({
  headerType,
  overlay,
})

const mapDispatchToProps = {
  cancelCheckout,
}

const ComposedHeaderSwitch = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslate,
  withRouter,
)(HeaderSwitch)

export { ComposedHeaderSwitch as HeaderSwitch }
