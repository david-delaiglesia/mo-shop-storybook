import { useTranslation } from 'react-i18next'

import { elementType, oneOfType, string } from 'prop-types'

import { I18nClient } from 'app/i18n/client'
import LanguageSelectorContainer from 'app/i18n/containers/language-selector'

import './Footer.css'

const { VITE_TERMS, VITE_PRIVACY, VITE_COOKIES } = import.meta.env

const Footer = ({ as: TagName }) => {
  const { t } = useTranslation()
  const currentLanguage = I18nClient.getCurrentLanguage()

  return (
    <TagName className="footer">
      <div className="footer__info">
        <p className="footer__copy-right">{t('footer_section.copyright')}</p>
        <p className="footer__links" data-testid="footer-links">
          <a
            className="footer__cookies"
            href={`${VITE_COOKIES}/${currentLanguage}/`}
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            {t('footer_section.cookies')}
          </a>
          <a
            className="footer__terms"
            href={`${VITE_TERMS}/${currentLanguage}/`}
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            {t('footer_section.terms')}
          </a>
          <a
            className="footer__privacy"
            href={`${VITE_PRIVACY}/${currentLanguage}/`}
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            {t('footer_section.privacy')}
          </a>
        </p>
      </div>
      <LanguageSelectorContainer />
    </TagName>
  )
}

Footer.propTypes = {
  as: oneOfType([elementType, string]),
}

Footer.defaultProps = {
  as: 'footer',
}

export { Footer }
