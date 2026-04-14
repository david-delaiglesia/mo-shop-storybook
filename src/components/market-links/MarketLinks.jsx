import { bool, string } from 'prop-types'

import { MOBILE_APP_STORE_URL } from 'app/catalog/constants'
import { sendDownloadAppButtonClickMetrics } from 'app/shared/metrics'
import { MOBILE_OS } from 'libs/mobile-detector'
import appStoreSrc from 'system-ui/assets/img/app-store-badge.svg'
import playStoreSrc from 'system-ui/assets/img/google-play-badge.svg'

const MarketLinks = ({ className, hideAndroid, hideIOS }) => {
  const onClickOnDownloadApp = () => {
    sendDownloadAppButtonClickMetrics()
  }

  return (
    <div className={`market-links ${className}`}>
      {!hideAndroid && (
        <a href={MOBILE_APP_STORE_URL[MOBILE_OS.ANDROID]}>
          <img
            src={playStoreSrc}
            alt="Abrir App en Play Store"
            className="market-links__android"
            onClick={onClickOnDownloadApp}
          />
        </a>
      )}
      {!hideIOS && (
        <a href={MOBILE_APP_STORE_URL[MOBILE_OS.IOS]}>
          <img
            src={appStoreSrc}
            alt="Abrir App en App Store"
            className="market-links__ios"
            onClick={onClickOnDownloadApp}
          />
        </a>
      )}
    </div>
  )
}
MarketLinks.propTypes = {
  className: string,
  hideAndroid: bool,
  hideIOS: bool,
}

MarketLinks.defaultProps = {
  className: '',
  hideAndroid: false,
  hideIOS: false,
}

export { MarketLinks }
