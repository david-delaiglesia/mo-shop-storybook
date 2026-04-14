import { PureComponent } from 'react'

import PropTypes from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon/Icon'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

import './assets/Account.css'

export const ACCOUNT_STYLE = {
  DEFAULT_MARGIN: 27,
  CART_BUTTON_WIDTH: 118,
}

export class Account extends PureComponent {
  getMarginStyle() {
    const { isCartHighlighted } = this.props

    if (isCartHighlighted) {
      const highlightMargin =
        ACCOUNT_STYLE.DEFAULT_MARGIN + ACCOUNT_STYLE.CART_BUTTON_WIDTH
      return { marginRight: `${highlightMargin}px` }
    }

    return { marginRight: `${ACCOUNT_STYLE.DEFAULT_MARGIN}px` }
  }

  getAccountTitle() {
    const { userName, t } = this.props

    if (userName) {
      return {
        className: 'account__user-name ym-hide-content',
        message: t('header.user_menu.user_message', { userName }),
      }
    }

    return {
      className: '',
      message: t('header.user_menu.anom_message'),
    }
  }

  render() {
    const marginStyle = this.getMarginStyle()
    const accountTitle = this.getAccountTitle()

    return (
      <div style={marginStyle} className="account">
        <div className={`subhead1-b account__title ${accountTitle.className}`}>
          {accountTitle.message}
        </div>
        <Icon icon="chevron-down" />
      </div>
    )
  }
}

Account.propTypes = {
  userName: PropTypes.string,
  isCartHighlighted: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}

export default withTranslate(Account)
