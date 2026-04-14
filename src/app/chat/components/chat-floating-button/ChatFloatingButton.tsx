import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useRouteMatch } from 'react-router'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { useChatContext } from 'app/chat/contexts/useChatContext'
import { ChatMetrics, ChatMinimizeSources } from 'app/chat/metrics'
import { usePrevious } from 'hooks/usePrevious'
import { PATHS } from 'pages/paths'
import { ChevronDown28Icon } from 'system-ui/icons'

import './ChatFloatingButton.css'

const ALLOWED_CHAT_PATHS = [PATHS.HOME, PATHS.CREATE_CHECKOUT, PATHS.CHECKOUT]

export const ChatFloatingButton = () => {
  const {
    unreadMessagesCount,
    channelSetup,
    openChat,
    minimizeChat,
    isChatOpen,
  } = useChatContext()

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const matches = ALLOWED_CHAT_PATHS.map((path) => useRouteMatch(path))
  const isAllowedShowChat = matches.some((match) => match?.isExact)
  const location = useLocation()
  const openChatButtonRef = useRef<HTMLButtonElement>(null)
  const { t } = useTranslation()

  const onOpenClick = () => {
    ChatMetrics.chatWidgetClick(location.pathname)
    openChat()
  }

  const onMinimizeClick = () => {
    ChatMetrics.chatMinimize(
      ChatMinimizeSources.FLOATING_BUTTON,
      location.pathname,
    )
    minimizeChat()
  }

  const previousIsOpen = usePrevious(isChatOpen)

  useEffect(() => {
    if (!isChatOpen && previousIsOpen) {
      openChatButtonRef.current?.focus()
    }
  }, [isChatOpen, previousIsOpen])

  if (isChatOpen)
    return (
      <button
        aria-label={t('chat.floating_button.minimize')}
        aria-expanded="true"
        className="chat-floating-button chat-floating-button--open"
        onClick={onMinimizeClick}
      >
        <ChevronDown28Icon />
      </button>
    )

  if (!isAllowedShowChat && !channelSetup) return null

  return (
    <button
      ref={openChatButtonRef}
      aria-expanded="false"
      className="chat-floating-button"
      onClick={onOpenClick}
      aria-label={
        unreadMessagesCount
          ? t('chat.floating_button.aria_label.with_notifications', {
              count: unreadMessagesCount,
            })
          : t('chat.floating_button.aria_label.without_notifications')
      }
    >
      <Icon icon="chat-28" />
      <span className="subhead1-sb">{t('chat.floating_button.label')}</span>
      {Boolean(unreadMessagesCount) && (
        <span className="chat-floating-button__unread-messages-badge subhead1-b">
          {unreadMessagesCount}
        </span>
      )}
    </button>
  )
}
