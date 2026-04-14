import { NavLink } from 'react-router-dom'

import { bool, func, string } from 'prop-types'

import './assets/MenuItem.css'

const MenuItem = ({ exact, isActive, label, link }) => (
  <NavLink
    exact={exact}
    isActive={isActive}
    className="menu-item subhead1-sb"
    to={link}
  >
    {label}
  </NavLink>
)

MenuItem.propTypes = {
  label: string.isRequired,
  link: string.isRequired,
  exact: bool,
  isActive: func,
}

export { MenuItem }
