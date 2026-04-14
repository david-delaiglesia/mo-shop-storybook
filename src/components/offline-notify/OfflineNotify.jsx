import PropTypes from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

import './assets/OfflineNotify.css'

const OfflineNotify = ({ t }) => {
  return (
    <div className="offline-notify" data-testid="offline-notify">
      {t('offline')}
    </div>
  )
}

OfflineNotify.propTypes = {
  t: PropTypes.func.isRequired,
}

export const PlainOfflineNotify = OfflineNotify

export default withTranslate(OfflineNotify)
