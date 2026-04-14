import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import charactersImg from './assets/400-characters@2x.png'
import errorImg from './assets/400@2x.png'

import { BlankLayout } from '@mercadona/mo.library.shop-ui/blank-layout'

import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { IconLink } from 'components/icon-link'
import { Tracker } from 'services/tracker'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

import './styles/Errors404.css'

const Error404 = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  useEffect(() => {
    dispatch(setHeaderType(LayoutHeaderType.SIMPLIFIED))
    Tracker.sendViewChange('not_found')
  }, [])

  const paddingTop = `${NAVBAR_HEIGHT}px`
  const content = (
    <div className="error-404">
      <img alt="error 404" className="error-404__header" src={errorImg} />
      <p className="body1-b error-404__message">{t('errors.404')}</p>
      <IconLink text="error_link" pathname="/" icon="chevron-right" />
      <img alt="characters" className="error-404__pic" src={charactersImg} />
    </div>
  )
  const footer = <Footer />

  return (
    <BlankLayout paddingTop={paddingTop}>{{ content, footer }}</BlankLayout>
  )
}

export { Error404 }
