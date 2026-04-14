import React, { useEffect, useCallback } from 'react'
import './Modal.css'

export interface ModalProps {
  open?: boolean
  title?: string
  description?: string
  children?: React.ReactNode
  primaryLabel?: string
  secondaryLabel?: string
  onPrimary?: () => void
  onSecondary?: () => void
  onClose?: () => void
}

export const Modal: React.FC<ModalProps> = ({
  open = true,
  title = 'Modal title',
  description,
  children,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onClose,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal={true}>
        <div className="modal-dialog__header">
          <h2 className="modal-dialog__title">{title}</h2>
          <button className="modal-dialog__close" onClick={onClose} aria-label="Close">
            &#x2715;
          </button>
        </div>
        {description && <p className="modal-dialog__description">{description}</p>}
        {children && <div className="modal-dialog__body">{children}</div>}
        {(primaryLabel || secondaryLabel) && (
          <div className="modal-dialog__footer">
            {secondaryLabel && (
              <button className="modal-dialog__btn modal-dialog__btn--secondary" onClick={onSecondary}>
                {secondaryLabel}
              </button>
            )}
            {primaryLabel && (
              <button className="modal-dialog__btn modal-dialog__btn--primary" onClick={onPrimary}>
                {primaryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
