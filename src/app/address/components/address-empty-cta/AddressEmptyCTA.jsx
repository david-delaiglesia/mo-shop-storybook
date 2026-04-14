import { useTranslation } from 'react-i18next'

import addressImg from './address.png'
import PropTypes from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import './AddressEmptyCTA.css'

export const AddressEmptyCTA = ({ onClick }) => {
  const { t } = useTranslation()

  return (
    <div
      className="address-empty-cta"
      aria-label={t('user_area.addresses.empty_title')}
    >
      <img
        className="address-empty-cta__image"
        src={addressImg}
        alt={t('user_area.addresses.empty_title')}
        width={112}
        height={112}
      />

      <div className="address-empty-cta__content">
        <span className="address-empty-cta__title title2-b">
          {t('user_area.addresses.empty_title')}
        </span>
        <span className="address-empty-cta__body body1-r">
          {t('user_area.addresses.empty_message')}
        </span>
      </div>

      <div className="address-empty-cta__actions">
        <Button variant="secondary" onClick={onClick}>
          {t('commons.order.order_delivery.address_list.add_address')}
        </Button>
      </div>
    </div>
  )
}

AddressEmptyCTA.propTypes = {
  onClick: PropTypes.func,
}
