import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CookieConfigurationItem } from './CookieConfigurationItem'
import classNames from 'classnames'
import { func } from 'prop-types'

import { Checkbox } from '@mercadona/mo.library.shop-ui/checkbox'
import { Icon } from '@mercadona/mo.library.shop-ui/icon/Icon'
import { BigModal } from '@mercadona/mo.library.shop-ui/modal'

import {
  NECESSARY_COOKIES_TRANSLATION_KEYS,
  REQUIRED_ANALYTICS_COOKIES_TRANSLATION_KEYS,
  THIRDPARTY_COOKIES_TRANSLATION_KEYS,
} from 'services/cookie/constants'

import './CookieConfiguration.css'

const CookieConfiguration = ({ onClose, onAccept }) => {
  const { t } = useTranslation()
  const [isNecessaryOpen, setNecessaryOpen] = useState(false)
  const [isRequiredAnalyticsOpen, setRequiredAnalyticsOpen] = useState(false)
  const [isThirdPartyOpen, setThirdPartyOpen] = useState(false)
  const [thirdPartyCookiesAccepted, setThirdPartyCookiesAccepted] =
    useState(false)

  const showRequiredAnalyticsCookies = () => (
    <li className="cookie-configuration__list-title">
      <div className="cookie-configuration__list-title-box">
        <button
          className="cookie-banner-configuration__list-title headline1-b"
          onClick={() => setRequiredAnalyticsOpen(!isRequiredAnalyticsOpen)}
          aria-expanded={isRequiredAnalyticsOpen}
        >
          <Icon
            icon={classNames({
              'chevron-down': isRequiredAnalyticsOpen,
              'chevron-right': !isRequiredAnalyticsOpen,
            })}
          />
          {t('cookies_configuration_required_analytics_title')}
        </button>
        <span className="cookie-configuration__list-status">
          {t('cookies_configuration_always_active')}
        </span>
      </div>
      {isRequiredAnalyticsOpen && (
        <Fragment>
          <p className="cookie-banner-configuration__explanation">
            {t('cookies_configuration_required_analytics_explanation')}
          </p>
          <ul className="cookie-configuration-item-list">
            {Object.values(REQUIRED_ANALYTICS_COOKIES_TRANSLATION_KEYS).map(
              (cookie, i) => (
                <li key={i} className="cookie-configuration-list__cookie">
                  <CookieConfigurationItem cookie={cookie} />
                </li>
              ),
            )}
          </ul>
        </Fragment>
      )}
    </li>
  )

  const showThirdPartyCookies = () => (
    <li className="cookie-configuration__list-title">
      <div className="cookie-configuration__list-title-box">
        <button
          className="cookie-banner-configuration__list-title headline1-b"
          onClick={() => setThirdPartyOpen(!isThirdPartyOpen)}
          aria-expanded={isThirdPartyOpen}
        >
          <Icon
            icon={classNames({
              'chevron-down': isThirdPartyOpen,
              'chevron-right': !isThirdPartyOpen,
            })}
          />
          {t('cookies_configuration_thirdparty_title')}
        </button>
        <Checkbox
          checked={thirdPartyCookiesAccepted}
          label={t('cookies_configuration_accept_thirdparty_cookies')}
          onChange={() =>
            setThirdPartyCookiesAccepted(!thirdPartyCookiesAccepted)
          }
        />
      </div>
      {isThirdPartyOpen && (
        <Fragment>
          <p className="cookie-banner-configuration__explanation">
            {t('cookies_configuration_thirdparty_explanation')}
          </p>
          <ul className="cookie-configuration-item-list">
            {Object.values(THIRDPARTY_COOKIES_TRANSLATION_KEYS).map(
              (cookie, i) => (
                <li key={i} className="cookie-configuration-list__cookie">
                  <CookieConfigurationItem cookie={cookie} />
                </li>
              ),
            )}
          </ul>
        </Fragment>
      )}
    </li>
  )

  return (
    <BigModal
      title={t('cookies_configuration_title')}
      description={[
        t('cookies_configuration_body_necessary'),
        t('cookies_configuration_body_thirdparty'),
      ]}
      primaryActionText={t('cookies_configuration_accept')}
      primaryAction={() => onAccept(thirdPartyCookiesAccepted)}
      secondaryActionText={t('cookies_configuration_cancel')}
      secondaryAction={onClose}
      hideModal={onClose}
      baseModalClass="cookies_max_height"
    >
      <ul className="cookie-configuration__list">
        <li className="cookie-configuration__list-title">
          <div className="cookie-configuration__list-title-box">
            <button
              className="cookie-banner-configuration__list-title headline1-b"
              onClick={() => setNecessaryOpen(!isNecessaryOpen)}
              aria-expanded={isNecessaryOpen}
            >
              <Icon
                icon={classNames({
                  'chevron-down': isNecessaryOpen,
                  'chevron-right': !isNecessaryOpen,
                })}
              />
              {t('cookies_configuration_necessary_title')}
            </button>
            <span className="cookie-configuration__list-status">
              {t('cookies_configuration_always_active')}
            </span>
          </div>
          {isNecessaryOpen && (
            <Fragment>
              <p className="cookie-banner-configuration__explanation">
                {t('cookies_configuration_necessary_explanation')}
              </p>
              <ul className="cookie-configuration-item-list">
                {Object.values(NECESSARY_COOKIES_TRANSLATION_KEYS).map(
                  (cookie, i) => (
                    <li key={i} className="cookie-configuration-list__cookie">
                      <CookieConfigurationItem cookie={cookie} />
                    </li>
                  ),
                )}
              </ul>
            </Fragment>
          )}
        </li>
        {showRequiredAnalyticsCookies()}
        {showThirdPartyCookies()}
      </ul>
    </BigModal>
  )
}

CookieConfiguration.propTypes = {
  onClose: func.isRequired,
  onAccept: func.isRequired,
}

export { CookieConfiguration }
