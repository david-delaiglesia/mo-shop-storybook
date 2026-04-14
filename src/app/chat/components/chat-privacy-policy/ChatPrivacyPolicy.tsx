import { useTranslation } from 'react-i18next'

import { ChatMetrics } from 'app/chat/metrics'

import './ChatPrivacyPolicy.css'

const { VITE_PRIVACY } = import.meta.env

const ChatPrivacyPolicy = () => {
  const { t, i18n } = useTranslation()

  return (
    <div className="chat-privacy-policy">
      <p className="chat-privacy-policy__disclaimer footnote1-r">
        {t('chat.privacy_policy.disclaimer')}
        <a
          onClick={ChatMetrics.chatPrivacyLinkClicked}
          className="chat-privacy-policy__link footnote1-r"
          href={`${VITE_PRIVACY}/${i18n.language}/`}
        >
          {t('chat.privacy_policy.link_label')}
        </a>
      </p>
    </div>
  )
}
export { ChatPrivacyPolicy }
