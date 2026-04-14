import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { IsDefaultIcon } from './IsDefaultIcon'

import { StatusWarningIcon } from '@mercadona/mo.library.icons'

import { Card } from 'system-ui/card'
import { Dropdown, DropdownOption } from 'system-ui/dropdown'

import './ElementCell.css'

interface ElementCellProps {
  children: ReactNode
  disabled?: boolean
  isDefault?: boolean
  onSetDefault: () => void
  onDelete: () => void
}

export const ElementCell = ({
  children,
  onSetDefault,
  onDelete,
  disabled = false,
  isDefault = false,
}: ElementCellProps) => {
  const { t } = useTranslation()

  return (
    <Card as="li" className="element-cell" aria-disabled={disabled}>
      <div className="element-cell__content">{children}</div>

      <div className="element-cell__actions">
        {isDefault && !disabled && <IsDefaultIcon />}
        {isDefault && disabled && (
          <StatusWarningIcon
            size={24}
            className="element-cell__action-warning"
          />
        )}
        <Dropdown
          label={t('commons.options')}
          options={
            [
              !isDefault && {
                label: t('cells.common.set_default'),
                onClick: onSetDefault,
                disabled: disabled,
              },
              {
                label: t('cells.common.delete'),
                onClick: onDelete,
                mood: 'destructive',
              },
            ].filter(Boolean) as DropdownOption[]
          }
        />
      </div>
    </Card>
  )
}
