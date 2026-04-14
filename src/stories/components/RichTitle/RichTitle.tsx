import React from 'react'
import './RichTitle.css'

export interface RichTitleProps {
  title?: string
  subtitle?: string
  icon?: string
  size?: 'small' | 'medium' | 'large'
  centered?: boolean
}

export const RichTitle: React.FC<RichTitleProps> = ({
  title = 'Title',
  subtitle,
  icon,
  size = 'medium',
  centered = false,
}) => {
  const sizeClass = size !== 'medium' ? ` rich-title__heading--${size}` : ''
  return (
    <div className={`rich-title${centered ? ' rich-title--centered' : ''}`}>
      {icon && <span className="rich-title__icon">{icon}</span>}
      <div className="rich-title__text">
        <h2 className={`rich-title__heading${sizeClass}`}>{title}</h2>
        {subtitle && <p className="rich-title__subtitle">{subtitle}</p>}
      </div>
    </div>
  )
}
