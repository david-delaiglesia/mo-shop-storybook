import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TAB_INDEX } from 'utils/constants'

import './RecaptchaTerms.css'

export const RecaptchaTerms = () => {
  const [displayMoreInfo, setDisplayMoreInfo] = useState(false)
  const { t } = useTranslation()
  return (
    <div className="recaptcha-terms">
      <p className="footnote1-r" tabIndex={TAB_INDEX.ENABLED}>
        {t('recaptcha.info')}{' '}
      </p>
      <button
        className="footnote1-r"
        onClick={() => setDisplayMoreInfo(true)}
        aria-expanded={displayMoreInfo}
      >
        {t('recaptcha.more_info_link_label')}
      </button>

      <p
        className="footnote1-r recaptcha-terms__more-info"
        hidden={!displayMoreInfo}
        tabIndex={TAB_INDEX.ENABLED}
      >
        {t('recaptcha.more_info')}
        <a
          className="footnote1-r"
          href={import.meta.env.VITE_GOOGLE_RECAPTCHA_PRIVACY_LINK}
        >
          {t('recaptcha.privacy_policy_link_label')}
        </a>
        {t('recaptcha.more_info_and')}
        <a
          className="footnote1-r"
          href={import.meta.env.VITE_GOOGLE_RECAPTCHA_TERMS_LINK}
        >
          {t('recaptcha.google_service_conditions_link_label')}
        </a>
        {t('recaptcha.more_info_2')}
      </p>
    </div>
  )
}
