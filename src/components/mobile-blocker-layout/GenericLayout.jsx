import MobileLayoutHeader from './MobileLayoutHeader'
import genericImageSrc from './assets/img_generic.jpg'

import { MarketLinks } from 'components/market-links'

const GenericLayout = () => (
  <div className="mobile-blocker-layout generic-layout">
    <MobileLayoutHeader />
    <MarketLinks />
    <img src={genericImageSrc} alt="" className="generic-layout__image" />
  </div>
)

export { GenericLayout }
