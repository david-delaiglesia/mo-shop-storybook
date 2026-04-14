import { withRouter } from 'react-router'

import Logo from '../logo'
import { bool, func, shape } from 'prop-types'

import { CartButtonContainer } from 'app/cart/containers/cart-button-container'
import { SearchBoxContainer } from 'app/search/containers/search-box-container'
import { Menu } from 'components/menu'
import AccountContainer from 'containers/account-container'
import { PATHS } from 'pages/paths'

import './assets/Header.css'

export const Header = ({ simplified, history }) => {
  const redirectToHome = () => {
    history.push({ pathname: PATHS.HOME })
    setTimeout(() => {
      window.location.href = '#content'
    }, 100)
  }

  if (simplified) {
    return (
      <header role="banner" className="header">
        <Logo onClick={redirectToHome} />
      </header>
    )
  }

  return (
    <header role="banner" className="header">
      <div className="header__left">
        <Logo onClick={redirectToHome} />
        <SearchBoxContainer />
        <Menu />
      </div>
      <div className="header__right">
        <AccountContainer />
        <CartButtonContainer />
      </div>
    </header>
  )
}

Header.propTypes = {
  history: shape({
    push: func.isRequired,
  }).isRequired,
  simplified: bool.isRequired,
}

Header.defaultProps = {
  simplified: false,
}

export default withRouter(Header)
