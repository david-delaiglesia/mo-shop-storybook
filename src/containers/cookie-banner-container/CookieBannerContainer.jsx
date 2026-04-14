import { Fragment, useEffect, useState } from 'react'

import { func } from 'prop-types'

import { CookieBanner } from '@mercadona/mo.library.shop-ui/cookie-banner'

import { CookieConfiguration } from 'app/cookie/components/cookie-configuration'
import { I18nClient } from 'app/i18n/client'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

const {
  VITE_COOKIE_DOMAIN,
  VITE_ACCEPTED_COOKIES,
  VITE_ANALYTICS_DOMAIN,
  VITE_COOKIES,
} = import.meta.env

const isCurrentCookieVersion = () => {
  const { VITE_COOKIES_VERSION } = import.meta.env
  const currentVersion = Number(VITE_COOKIES_VERSION)
  const cookie = Cookie.get(VITE_ACCEPTED_COOKIES)

  const isNotVersionDefined = currentVersion === 0
  const isCurrentVersion = cookie.version === currentVersion

  return isCurrentVersion || isNotVersionDefined
}

const CookieBannerContainer = ({ t }) => {
  const [showBanner, setBannerVisibility] = useState(false)
  const [showConfigurator, setConfiguratorVisibility] = useState(false)

  useEffect(() => {
    setCookies()
  }, [])

  const setCookies = () => {
    const cookie = Cookie.get(VITE_ACCEPTED_COOKIES)
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500,
    })

    if (!cookie) return setBannerVisibility(true)

    if (!isCurrentCookieVersion()) {
      setBannerVisibility(true)
      Cookie.remove(VITE_ACCEPTED_COOKIES, VITE_COOKIE_DOMAIN)
      return
    }

    if (cookie && !Cookie.areThirdPartyAccepted()) {
      removeThirdPartyCookies()
    }

    setBannerVisibility(false)
  }

  const removeThirdPartyCookies = () => {
    const cookies = Cookie.getAll()
    const cookieNameList = Object.keys(cookies)

    if (cookieNameList.length === 0) return

    cookieNameList.forEach((cookieName) => {
      if (Cookie.isNecessary(cookieName)) return

      Cookie.remove(cookieName, VITE_COOKIE_DOMAIN)
      Cookie.remove(cookieName, VITE_ANALYTICS_DOMAIN)
    })
  }

  const acceptCookies = (isThirdPartyAccepted) => {
    const { VITE_COOKIES_VERSION } = import.meta.env
    const cookie = {
      thirdParty: isThirdPartyAccepted,
      necessary: true,
      version: Number(VITE_COOKIES_VERSION),
    }

    if (isThirdPartyAccepted) {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      })
    }

    Cookie.save(cookie, VITE_ACCEPTED_COOKIES, VITE_COOKIE_DOMAIN, {
      secure: true,
      samesite: 'none',
    })

    setBannerVisibility(false)
    closeConfigurator()
    Tracker.initialize()
  }

  const openConfiguration = () => {
    setConfiguratorVisibility(true)
  }

  const closeConfigurator = () => {
    setConfiguratorVisibility(false)
  }

  return (
    <Fragment>
      {showBanner && (
        <CookieBanner
          altText="cookie"
          messageText={t('alert_cookies_message')}
          moreInfoText={t('alert_more_info_cookies_terms')}
          andText={t('alert_cookies_and')}
          configurationText={t('alert_cookies_configuration')}
          acceptButtonText={t('alert_cookies_accept_button')}
          rejectButtonText={t('alert_cookies_reject_button')}
          currentLanguage={I18nClient.getCurrentLanguage()}
          legalLink={VITE_COOKIES}
          openConfiguration={openConfiguration}
          onClick={() => acceptCookies(true)}
          onReject={() => acceptCookies(false)}
        />
      )}
      {showConfigurator && (
        <CookieConfiguration
          onClose={closeConfigurator}
          onAccept={acceptCookies}
        />
      )}
    </Fragment>
  )
}

CookieBannerContainer.propTypes = {
  t: func.isRequired,
}

const TranslatedCookieBannerContainer = withTranslate(CookieBannerContainer)

export { TranslatedCookieBannerContainer as CookieBannerContainer }
