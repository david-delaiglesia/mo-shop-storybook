import { func, object, string } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import logo from 'system-ui/assets/img/logo-app.svg'

import './assets/OrderHeader.css'

const OrderHeader = ({ text, ariaLabel, callback, style = {} }) => (
  <header role="banner" className="order-header" style={style}>
    <button
      onClick={callback}
      className="order-header__go-back"
      aria-label={ariaLabel}
    >
      <Icon icon="chevron-left" />
      <img alt="" src={logo} />
      <h1 className={'order-header__title body1-r'}>{text}</h1>
    </button>
  </header>
)

OrderHeader.propTypes = {
  text: string.isRequired,
  ariaLabel: string,
  callback: func.isRequired,
  style: object,
}

export default OrderHeader
