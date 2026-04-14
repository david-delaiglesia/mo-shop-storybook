import PropTypes from 'prop-types'

import './AuthenticateUserLayout.css'

const AuthenticateUserLayout = (props) => {
  return <div className="authenticate-user-layout">{props.children}</div>
}

AuthenticateUserLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AuthenticateUserLayout
