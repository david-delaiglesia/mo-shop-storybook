import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useClickOut } from '@mercadona/mo.library.dashtil'

import { useChatContext } from 'app/chat/contexts/useChatContext'
import { ChatMetrics } from 'app/chat/metrics'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { ExitIcon, MoreActionsIcon } from 'system-ui/icons'

import './ChatContextualMenu.css'

interface ChatContextualMenuProps {
  onFinishChat: () => void
  isDisabled: boolean
  chatId?: string
}

const ChatContextualMenu = ({
  onFinishChat,
  isDisabled = false,
  chatId,
}: ChatContextualMenuProps) => {
  const [isContextualMenuOpen, setIsContextualMenuOpen] = useState(false)
  const { refContainer } = useClickOut<HTMLDivElement>(
    () => setIsContextualMenuOpen(false),
    isContextualMenuOpen,
  )
  const { t } = useTranslation()
  const isWebNewSupportChatToggleSoundFlagActive = useFlag(
    knownFeatureFlags.WEB_NEW_SUPPORT_CHAT_TOGGLE_SOUND,
  )
  const chatContext = useChatContext()

  return (
    <div ref={refContainer} className="chat-contextual-menu">
      <button
        disabled={isDisabled}
        className="chat-contextual-menu__toggle"
        aria-controls="chat-contextual-menu"
        aria-label={t('chat.context_menu.button.label')}
        aria-expanded={isContextualMenuOpen}
        aria-haspopup="true"
        onClick={() => setIsContextualMenuOpen((prev) => !prev)}
      >
        <MoreActionsIcon size={24} />
      </button>
      {isContextualMenuOpen && (
        <div
          id="chat-contextual-menu"
          className="chat-contextual-menu__popup"
          role="menu"
        >
          <button
            className="chat-contextual-menu__menu-item chat-contextual-menu__menu-item--is-destructive subhead1-r"
            role="menuitem"
            autoFocus
            onClick={() => {
              onFinishChat()
              setIsContextualMenuOpen(false)
            }}
          >
            {t('chat.context_menu.finish_chat')}
            <ExitIcon size={20} />
          </button>
          {isWebNewSupportChatToggleSoundFlagActive && (
            <button
              className="chat-contextual-menu__menu-item subhead1-r"
              role="menuitem"
              onClick={() => {
                chatContext?.toggleSound?.()

                if (!chatId) return
                ChatMetrics.chatSoundToggled(
                  chatId,
                  chatContext?.isSoundActive ? 'off' : 'on',
                )
              }}
            >
              {chatContext?.isSoundActive
                ? t('chat.context_menu.toggle_sound.mute')
                : t('chat.context_menu.toggle_sound.unmute')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export { ChatContextualMenu }
