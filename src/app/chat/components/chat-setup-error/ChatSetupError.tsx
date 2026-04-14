import { useTranslation } from 'react-i18next'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import { useChatContext } from 'app/chat/contexts/useChatContext'
import errorImage from 'pages/error500/assets/500-character@2x.png'

import './ChatSetupError.css'

const ChatSetupError = () => {
  const { startNewChat } = useChatContext()
  const { t } = useTranslation()

  return (
    <section className="chat-setup-error">
      <div className="chat-setup-error__content">
        <img src={errorImage} className="chat-setup-error__image" alt="" />
        <h3 className="title2-b" aria-live="assertive">
          {t('chat.setup.error.title')}
        </h3>
        <p className="body1-r">{t('chat.setup.error.tagline')}</p>
      </div>
      <div className="chat-setup-error__actions">
        <Button fullWidth variant="tertiary" onClick={() => startNewChat()}>
          {t('chat.setup.error.retry_button')}
        </Button>
      </div>
    </section>
  )
}

export { ChatSetupError }
