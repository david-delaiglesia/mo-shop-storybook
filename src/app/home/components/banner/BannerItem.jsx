import { Link } from 'react-router-dom'

import { array, func, number, string } from 'prop-types'

import {
  HOME_SECTION_TYPES,
  sendHomeSectionClickMetrics,
} from 'app/catalog/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { interpolateApiPathSections } from 'pages/routing'
import { TAB_INDEX } from 'utils/constants'

import './styles/BannerItem.css'

const BannerItem = ({
  apiPath,
  id,
  name,
  bgColors,
  textColor,
  buttonColor,
  imageUrl,
  campaignId,
  t,
}) => {
  const titleStyle = { color: textColor }
  const buttonStyle = { background: buttonColor }
  const leftBackground = {
    background: `linear-gradient(90deg, ${bgColors[0]}, ${bgColors[1]})`,
  }

  const sendMetrics = () => {
    const options = {
      id,
      title: name,
      campaignId,
      homeSectionType: HOME_SECTION_TYPES.HERO_BANNER,
    }

    sendHomeSectionClickMetrics(options)
  }

  const seasonPath = interpolateApiPathSections(apiPath)
  const seasonPathWithHomeSectionType = `${seasonPath}?home_section_type=${HOME_SECTION_TYPES.HERO_BANNER}`

  const ariaLabelForBanner = `${name}, ${t('accessibility.click_view_products')}`

  return (
    <div className="banner-item">
      <Link
        to={seasonPathWithHomeSectionType}
        onClick={sendMetrics}
        data-testid="banner-season-link"
      >
        <div className="banner-item__background">
          <div
            style={{ backgroundImage: `url(${imageUrl})` }}
            className="banner-item__image"
          ></div>
        </div>

        <div
          style={leftBackground}
          className="banner-item__left"
          aria-label={ariaLabelForBanner}
        >
          <h3 style={titleStyle} className="banner-item__title large-b">
            {name}
          </h3>
          <button
            className="banner-item__button subhead1-r"
            style={buttonStyle}
            tabIndex={TAB_INDEX.DISABLED}
          >
            {t('view_products')}
          </button>
        </div>
      </Link>
    </div>
  )
}

BannerItem.propTypes = {
  apiPath: string,
  id: number.isRequired,
  name: string.isRequired,
  bgColors: array,
  textColor: string,
  buttonColor: string,
  imageUrl: string.isRequired,
  t: func.isRequired,
  campaignId: string,
}

BannerItem.defaultProps = {
  bgColors: ['#fff', '#fff'],
  textColor: '#000',
}

export const PlainBannerItem = BannerItem

export default withTranslate(BannerItem)
