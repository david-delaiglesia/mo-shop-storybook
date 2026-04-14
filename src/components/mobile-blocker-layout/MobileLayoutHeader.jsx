import logoSrc from '../../system-ui/assets/img/logo-horizontal.svg'
import PropTypes from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

import './assets/MobileLayoutHeader.css'

const MobileLayoutHeader = ({ t }) => {
  return (
    <div className="mobile-layout-header">
      <img className="mobile-layout-header__logo" alt="logo" src={logoSrc} />
      <h1 className="mobile-layout-header__title title1-r">
        {t('mobile_block.download_app')}
      </h1>
    </div>
  )
}

MobileLayoutHeader.propTypes = {
  t: PropTypes.func.isRequired,
}

export const PlainMobileLayoutHeader = MobileLayoutHeader

export default withTranslate(MobileLayoutHeader)
