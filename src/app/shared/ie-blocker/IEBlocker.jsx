import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import chromeIcon from './assets/Chrome@2x.png'
import edgeIcon from './assets/Edge@2x.png'
import firefoxIcon from './assets/Firefox@2x.png'
import safariIcon from './assets/Safari@2x.png'

import { BaseModal } from '@mercadona/mo.library.shop-ui/modal'

import {
  sendOldBrowserPopupClickMetrics,
  sendOldBrowserPopupViewMetrics,
} from 'app/shared/metrics'
import { Support } from 'services/support'

import './IEBlocker.css'

const BROWSER_LIST = {
  EDGE: 'edge',
  CHROME: 'chrome',
  FIREFOX: 'firefox',
  SAFARI: 'safari',
}

const isIE11 = () => {
  return !!window.MSInputMethodContext && !!document.documentMode
}

const isIELowerThan11 = () => {
  return navigator.appName.includes('Internet Explorer')
}

const isIE = () => {
  return isIELowerThan11() || isIE11()
}

const IEBlocker = () => {
  const { t } = useTranslation()

  useEffect(() => {
    if (!isIE()) return
    Support.showButton()
    sendOldBrowserPopupViewMetrics()
  }, [])

  const doNothing = () => null

  const sendClickEvent = (browser) => {
    sendOldBrowserPopupClickMetrics(browser)
  }

  if (isIE()) {
    return createPortal(
      <BaseModal
        className="ie-blocker"
        aria-label={t('not_supported_browser_title')}
        onClose={doNothing}
      >
        <h2 className="ie-blocker__title title2-b">
          {t('not_supported_browser_title')}
        </h2>
        <p className="ie-blocker__description subhead1-r">
          {t('not_supported_browser_explanation')}
        </p>
        <div className="ie-blocker__links-container">
          <a
            className="ie-blocker__link"
            href="https://www.microsoft.com/edge"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sendClickEvent(BROWSER_LIST.EDGE)}
          >
            <img src={edgeIcon} alt=""></img>
            <div className="ie-blocker__link-text footnote1-b">
              {t('not_supported_browser_choice_1')}
            </div>
          </a>
          <a
            className="ie-blocker__link"
            href="https://www.google.com/chrome/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sendClickEvent(BROWSER_LIST.CHROME)}
          >
            <img src={chromeIcon} alt=""></img>
            <div className="ie-blocker__link-text footnote1-b">
              {t('not_supported_browser_choice_2')}
            </div>
          </a>
          <a
            className="ie-blocker__link"
            href="https://www.mozilla.org/firefox/new/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sendClickEvent(BROWSER_LIST.FIREFOX)}
          >
            <img src={firefoxIcon} alt=""></img>
            <div className="ie-blocker__link-text footnote1-b">
              {t('not_supported_browser_choice_3')}
            </div>
          </a>
          <a
            className="ie-blocker__link"
            href="https://support.apple.com/downloads/safari"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sendClickEvent(BROWSER_LIST.SAFARI)}
          >
            <img src={safariIcon} alt=""></img>
            <div className="ie-blocker__link-text footnote1-b">
              {t('not_supported_browser_choice_4')}
            </div>
          </a>
        </div>
        <p className="subhead1-r">{t('not_supported_browser_help')}</p>
      </BaseModal>,
      document.getElementById('modal-info'),
    )
  }

  return null
}

export { IEBlocker, isIE }
