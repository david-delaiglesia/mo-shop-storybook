import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { string } from 'prop-types'

import './CookieConfigurationItem.css'

const CookieConfigurationItem = ({ cookie }) => {
  const { t } = useTranslation()

  return (
    <Fragment>
      <p className="cookie-configuration-item-list__cookie-name subhead1-r">
        {t(`${cookie}`)}
      </p>
      <p className="cookie-configuration-item-list__cookie-info subhead1-r">{`${t(
        'cookies_configuration_expiration',
      )}: ${t(`${cookie}_expiration`)}`}</p>
      <p className="cookie-configuration-item-list__cookie-info subhead1-r">{`${t(
        'cookies_configuration_description',
      )}: ${t(`${cookie}_description`)}`}</p>
    </Fragment>
  )
}

CookieConfigurationItem.propTypes = {
  cookie: string,
}

export { CookieConfigurationItem }
