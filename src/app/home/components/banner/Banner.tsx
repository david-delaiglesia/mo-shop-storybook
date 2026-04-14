import { useState } from 'react'

import BannerItem from './BannerItem'
import BannerNavigator from './BannerNavigator'

import { TAB_INDEX } from 'utils/constants'

import './styles/Banner.css'

interface BannerSlides {
  apiPath: string
  bgColors: []
  buttonColor: string
  campaignId: string
  id: number
  imageUrl: string
  name: string
  textColor: string
}
interface BannerProps {
  apiPaths: string[]
  bannerSlides: BannerSlides[]
  title: string
  subtitle: string
}
export const Banner = (props: BannerProps) => {
  const [translationX, setTranslationX] = useState({})

  const applyMovement = (translation: number) => {
    const translationX = { transform: `translateX(${translation}px)` }
    setTranslationX(translationX)
  }

  const { bannerSlides, title, subtitle, apiPaths } = props

  return (
    <div className="banner">
      <div tabIndex={TAB_INDEX.ENABLED}>
        {title && <h2 className="banner__title headline1-b">{title}</h2>}
        {subtitle && <p className="banner__subtitle footnote1-r">{subtitle}</p>}
      </div>
      <BannerNavigator
        length={bannerSlides.length}
        applyMovement={applyMovement}
      >
        <div className="banner__mask">
          <div style={translationX} className="banner__wrapper">
            {bannerSlides.map((slide, index) => {
              return (
                <BannerItem key={index} {...slide} apiPath={apiPaths[index]} />
              )
            })}
          </div>
        </div>
      </BannerNavigator>
      <hr className="banner__separator" />
    </div>
  )
}
