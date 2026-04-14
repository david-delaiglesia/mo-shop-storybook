import { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { bool, func, number, object, string } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { logout } from 'app/authentication/commands'
import { sendLogoutClickMetrics } from 'app/authentication/metrics'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import Account from 'components/account'
import { AccountMenu } from 'components/account-menu'
import { DropdownWithClickOut } from 'components/dropdown'
import { PATHS } from 'pages/paths'

export class AccountContainer extends Component {
  state = {
    isDropdownOpened: false,
  }

  logout = () => {
    sendLogoutClickMetrics()
    this.props.history.push({ pathname: PATHS.HOME })
    this.props.logout()
    this.props.hideAlert()
  }

  closeDropdown = () => {
    this.setState({ isDropdownOpened: false })
  }

  showLogoutAlert = () => {
    const { userName } = this.props
    const alert = {
      title: 'alerts.log_out.title',
      description: {
        key: 'alerts.log_out.message',
        interpolation: { userName },
      },
      confirmButtonText: 'alerts.log_out.close_session',
      confirmButtonAction: this.logout,
      secondaryActionText: 'button.cancel',
      secondaryAction: this.props.hideAlert,
    }
    this.props.showAlert(alert)
  }

  toggleDropdown = () => {
    this.setState({ isDropdownOpened: !this.state.isDropdownOpened })
  }

  render() {
    const { isDropdownOpened } = this.state
    const { userName, cartLength, isCartHighlighted } = this.props

    return (
      <DropdownWithClickOut
        open={isDropdownOpened}
        datatest="account-dropdown"
        handleClickOutside={this.closeDropdown}
        toggleDropdown={this.toggleDropdown}
        header={
          <Account isCartHighlighted={isCartHighlighted} userName={userName} />
        }
        content={
          <AccountMenu
            toggleLogoutAlert={this.showLogoutAlert}
            closeDropdown={this.closeDropdown}
            userName={userName}
            cartHasProducts={!!cartLength}
          />
        }
      />
    )
  }
}

AccountContainer.propTypes = {
  userName: string,
  logout: func.isRequired,
  history: object.isRequired,
  cartLength: number.isRequired,
  isCartHighlighted: bool.isRequired,
  showAlert: func.isRequired,
  hideAlert: func.isRequired,
}

const mapStateToProps = ({ user, cart: { products: orderLines }, ui }) => ({
  userName: user.name,
  cartLength: Object.keys(orderLines).length,
  isCartHighlighted: ui.cartUI.highlight,
})

const mapDispatchToProps = {
  logout: createThunk(logout),
  showAlert,
  hideAlert,
}

export const AccountConnected = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AccountContainer)

export default withRouter(AccountConnected)
