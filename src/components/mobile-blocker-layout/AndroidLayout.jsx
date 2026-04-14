import MobileLayoutHeader from './MobileLayoutHeader'
import androidImageSrc from './assets/img_generic.jpg'

import { MarketLinks } from 'components/market-links'

const AndroidLayout = () => (
  <div className="mobile-blocker-layout android-layout">
    <MobileLayoutHeader />
    <MarketLinks hideIOS />
    <img src={androidImageSrc} alt="" className="android-layout__image" />
  </div>
)

export { AndroidLayout }
