import React from 'react'
import './MenuItem.css'

export interface MenuItemProps {
  icon?: string
  label?: string
  sublabel?: string
  badge?: string
  showArrow?: boolean
  disabled?: boolean
  onClick?: () => void
}

export const MenuItem: React.FC<MenuItemProps> = ({
  icon = '🛒',
  label = 'Menu item',
  sublabel,
  badge,
  showArrow = true,
  disabled = false,
  onClick,
}) => {
  return (
    <button
      className={`menu-item${disabled ? ' menu-item--disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      type="button"
    >
      <span className="menu-item__icon">{icon}</span>
      <span className="menu-item__label">
        {label}
        {sublabel && <span className="menu-item__sublabel" style={{ display: 'block' }}>{sublabel}</span>}
      </span>
      {badge && <span className="menu-item__badge">{badge}</span>}
      {showArrow && <span className="menu-item__arrow">&#x276F;</span>}
    </button>
  )
}
