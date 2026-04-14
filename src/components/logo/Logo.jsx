import PropTypes from 'prop-types'

import './assets/Logo.css'

const Logo = ({ onClick }) => (
  <button className="logo" onClick={onClick} aria-label="Home"></button>
)

Logo.propTypes = {
  onClick: PropTypes.func.isRequired,
}

export default Logo
