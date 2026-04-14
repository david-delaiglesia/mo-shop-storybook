import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import charactersImg from './assets/500-character@2x.png'
import errorImg from './assets/500@2x.png'

import { BlankLayout } from '@mercadona/mo.library.shop-ui/blank-layout'

import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { IconLink } from 'components/icon-link'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

import './styles/Error500.css'

const Error500 = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  useEffect(() => {
    dispatch(setHeaderType(LayoutHeaderType.SIMPLIFIED))
  }, [])

  const paddingTop = `${NAVBAR_HEIGHT}px`
  const content = (
    <div className="error-500">
      <img alt="error 500" className="error-500__header" src={errorImg}></img>
      <p className="body1-b error-500__message">{t('errors.500')}</p>
      <IconLink text="error_link" pathname="/" icon="chevron-right" />
      <img
        alt="characters"
        className="error-500__pic"
        src={charactersImg}
      ></img>
    </div>
  )
  const footer = <Footer />

  return (
    <BlankLayout paddingTop={paddingTop}>{{ content, footer }}</BlankLayout>
  )
}

export { Error500 }
