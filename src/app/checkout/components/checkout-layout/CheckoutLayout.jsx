import { Component } from 'react'

import { func } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import OrderHeader from 'app/order/components/order-header'

import './styles/CheckoutLayout.css'

class CheckoutLayout extends Component {
  render() {
    const { goBack, renderChildren, t } = this.props

    return (
      <div className="checkout-layout">
        <OrderHeader
          text={t('checkout.header.label')}
          ariaLabel={t('checkout.header.aria')}
          callback={goBack}
        />
        {renderChildren()}
      </div>
    )
  }
}

CheckoutLayout.propTypes = {
  goBack: func.isRequired,
  renderChildren: func,
  t: func.isRequired,
}

const ComposedCheckoutLayout = compose(withTranslate)(CheckoutLayout)

export { ComposedCheckoutLayout as CheckoutLayout }
