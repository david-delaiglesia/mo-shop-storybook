import React, { useState, useRef, useEffect } from 'react'
import './PopOver.css'

export interface PopOverProps {
  triggerLabel?: string
  title?: string
  content?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  children?: React.ReactNode
}

export const PopOver: React.FC<PopOverProps> = ({
  triggerLabel = 'Hover me',
  title,
  content = 'Popover content goes here.',
  placement = 'bottom',
  children,
}) => {
  const [visible, setVisible] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="popover-wrapper" ref={wrapperRef}>
      <button
        className="popover-trigger"
        onClick={() => setVisible(!visible)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        aria-haspopup={true}
        aria-expanded={visible}
      >
        {triggerLabel}
        <span style={{ fontSize: 10 }}>&#9660;</span>
      </button>
      {visible && (
        <div className={`popover-box popover-box--${placement}`}>
          <div className="popover-arrow" />
          {title && <p className="popover-title">{title}</p>}
          <div className="popover-content">{children || content}</div>
        </div>
      )}
    </div>
  )
}
