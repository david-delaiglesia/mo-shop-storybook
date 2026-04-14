import productLimitImage from './assets/default-alert@2x.png'
import { func } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

import './SlotsPlaceholder.css'

const SlotsPlaceholder = ({ t }) => {
  return (
    <div className="slots-placeholder">
      <img
        className="slots-placeholder-image"
        src={productLimitImage}
        alt="warning"
      />
      <h3 className="title2-b">
        {t('non_supported_address_no_slots_available_title')}
      </h3>
      <p className="body1-r slots-placeholder-subtitle">
        {t('non_supported_address_no_slots_available_description')}
      </p>
    </div>
  )
}

SlotsPlaceholder.propTypes = {
  t: func.isRequired,
}

const ComposedSlotsPlaceholder = withTranslate(SlotsPlaceholder)

export { ComposedSlotsPlaceholder as SlotsPlaceholder }
