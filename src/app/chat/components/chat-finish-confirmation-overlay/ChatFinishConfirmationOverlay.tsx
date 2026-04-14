import { useTranslation } from 'react-i18next'

import exitDoorImage from '../../assets/exit-door.png'

// @ts-expect-error @mercadona/mo.library.shop-ui/accesibility no types declared
import { FocusTrap } from '@mercadona/mo.library.shop-ui/accessibility'
import { Button } from '@mercadona/mo.library.shop-ui/button'

import './ChatFinishConfirmationOverlay.css'

interface ChatFinishConfirmationOverlayProps {
  onContinueConversation: () => void
  onFinishChat: () => void
}

export const ChatFinishConfirmationOverlay = ({
  onContinueConversation,
  onFinishChat,
}: ChatFinishConfirmationOverlayProps) => {
  const { t } = useTranslation()

  return (
    <section
      aria-labelledby="finish-overlay-title"
      className="chat-finish-confirmation-overlay"
      role="dialog"
    >
      <div className="chat-finish-confirmation-overlay__content">
        <img
          alt={t('chat.finish_confirmation.decoration_image.exit_door')}
          src={exitDoorImage}
          className="chat-finish-confirmation-overlay__exit-door-image"
        />
        <h3 className="title2-b" id="finish-overlay-title">
          {t('chat.finish_confirmation.title')}
        </h3>
        <p className="body1-r">{t('chat.finish_confirmation.description')}</p>
      </div>
      <FocusTrap active restoreFocus>
        <Button
          autoFocus
          fullWidth
          variant="tertiary"
          onClick={onContinueConversation}
        >
          {t('chat.finish_confirmation.continue_button')}
        </Button>
        <Button
          mood="destructive"
          variant="primary"
          fullWidth
          onClick={onFinishChat}
        >
          {t('chat.finish_confirmation.finish_button')}
        </Button>
      </FocusTrap>
    </section>
  )
}
