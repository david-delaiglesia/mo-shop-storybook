import { withRouter } from 'react-router-dom'

import emptyOrdersImage from './assets/orders@2x.png'
import { func, object } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ButtonV2 } from 'components/button'
import { PATHS } from 'pages/paths'

import './assets/OrdersPlaceholder.css'

const onLinkClick = (history) => () => {
  history.push(PATHS.CATEGORIES)
}

const OrdersPlaceHolder = ({ history, t }) => {
  return (
    <div className="orders-placeholder">
      <img
        alt="orders_no_results"
        className="orders-placeholder__img"
        src={emptyOrdersImage}
      ></img>
      <p className="orders-placeholder__title">
        {t('no_results.orders.title')}
      </p>
      <p className="orders-placeholder__subtitle">
        {t('no_results.orders.body')}
      </p>
      <ButtonV2.Secondary
        fit
        text="no_results.orders.button"
        onClick={onLinkClick(history)}
        data-testid="orders-placeholder-btn"
      />
    </div>
  )
}

OrdersPlaceHolder.propTypes = {
  t: func.isRequired,
  history: object,
}

const ComposedOrdersPlaceHolder = compose(
  withTranslate,
  withRouter,
)(OrdersPlaceHolder)

export default ComposedOrdersPlaceHolder
