import { useTranslation } from 'react-i18next'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import './OrderCancel.css'

interface OrderCancelProps {
  onCancel: () => void
}

export const OrderCancel = ({ onCancel }: OrderCancelProps) => {
  const { t } = useTranslation()
  return (
    <div className="order-cancel">
      <button
        data-testid="order-cancel__button"
        onClick={onCancel}
        className="order-cancel__action"
      >
        <Icon icon="delete" />
        <span className="subhead1-b">{t('commons.order.cancel.title')}</span>
      </button>
      <p className="order-cancel__disclaimer footnote1-r">
        {t('commons.order.cancel.advertise')}
      </p>
    </div>
  )
}
