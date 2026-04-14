import MobileLayoutHeader from './MobileLayoutHeader'
import iOSImageSrc from './assets/img_iOS.jpg'

import { MarketLinks } from 'components/market-links'

const iOSLayout = () => (
  <div className="mobile-blocker-layout ios-layout">
    <MobileLayoutHeader />
    <MarketLinks hideAndroid />
    <img src={iOSImageSrc} alt="" className="ios-layout__image" />
  </div>
)

export { iOSLayout }
