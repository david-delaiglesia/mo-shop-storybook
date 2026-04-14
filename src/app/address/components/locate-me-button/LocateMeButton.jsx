import { func } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

const LocateMeButton = ({ onClick, t }) => (
  <div className="address-confirmation-modal__locate-me-container">
    <button
      onClick={onClick}
      aria-label={t('address_map.locate_me.button')}
      className="address-confirmation-modal__locate-me-button subhead1-sb"
    >
      <Icon
        icon="locate-me"
        className="address-confirmation-modal__locate-me-icon"
      />
      {t('address_map.locate_me.button')}
    </button>
  </div>
)

LocateMeButton.propTypes = {
  onClick: func,
  t: func,
}

export { LocateMeButton }
