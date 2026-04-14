import { useTranslation } from 'react-i18next'

import { oneOf } from 'prop-types'

import { I18nClient } from 'app/i18n/client'
import { TAB_INDEX } from 'utils/constants'

import './assets/TermsAndConditions.css'

const { VITE_TERMS, VITE_PRIVACY } = import.meta.env

const copyKeyByFlow = {
  default: 'commons.policy_terms.text',
  checkout: 'checkout.terms.text',
  'checkout-signup': 'commons.policy_terms.text',
  signup: 'commons.policy_terms.text',
}

const TermsAndConditions = ({ flow }) => {
  const { t } = useTranslation()
  const currentLanguage = I18nClient.getCurrentLanguage()

  const copyKey = copyKeyByFlow[flow]

  return (
    <p
      className="terms-conditions__policy caption1-sb"
      tabIndex={TAB_INDEX.ENABLED}
    >
      {t(copyKey)}
      <a
        href={`${VITE_TERMS}/${currentLanguage}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="terms-conditions__terms caption1-sb"
      >
        {t('commons.policy_terms.terms')}
      </a>
      {t('commons.policy_terms.&')}
      <a
        href={`${VITE_PRIVACY}/${currentLanguage}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="terms-conditions__privacy caption1-sb"
      >
        {t('commons.policy_terms.privacy')}
      </a>
    </p>
  )
}

TermsAndConditions.propTypes = {
  flow: oneOf(Object.keys(copyKeyByFlow)),
}

TermsAndConditions.defaultProps = {
  flow: 'default',
}

export { TermsAndConditions }
