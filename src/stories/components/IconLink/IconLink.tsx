import React from 'react'
import './IconLink.css'

export interface IconLinkProps {
  icon?: string
  label?: string
  href?: string
  variant?: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  onClick?: () => void
}

export const IconLink: React.FC<IconLinkProps> = ({
  icon = '🔗',
  label = 'Link',
  href,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
}) => {
  const className = [
    'icon-link',
    variant === 'secondary' ? 'icon-link--secondary' : '',
    size === 'small' ? 'icon-link--small' : '',
    size === 'large' ? 'icon-link--large' : '',
    disabled ? 'icon-link--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const Tag = href ? 'a' : 'button'
  const props: Record<string, unknown> = {
    className,
    onClick: disabled ? undefined : onClick,
  }
  if (href) props.href = href

  return React.createElement(
    Tag,
    props,
    React.createElement('span', { className: 'icon-link__icon' }, icon),
    React.createElement('span', { className: 'icon-link__label' }, label),
  )
}
