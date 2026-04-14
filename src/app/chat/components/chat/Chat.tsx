import { KeyboardEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { ChatFloatingButton } from '../chat-floating-button'
import { ChatStatusBadge } from '../chat-status-badge/ChatStatusBadge'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { ChatContent } from 'app/chat/components/chat-content'
import { ChatContextualMenu } from 'app/chat/components/chat-contextual-menu'
import { useChatContext } from 'app/chat/contexts/useChatContext'
import { ChatStatusType } from 'app/chat/interfaces'
import { ChatMetrics, ChatMinimizeSources } from 'app/chat/metrics'
import Loader from 'components/loader'
import { Minimize } from 'system-ui/icons'

import './Chat.css'

const Chat = () => {
  const { isChatOpen, chatStatus, channelSetup, minimizeChat, finishChat } =
    useChatContext()

  const [
    isFinishChatConfirmationOverlay,
    setIsFinishChatConfirmationOverlayOpen,
  ] = useState(false)
  const location = useLocation()
  const closeChatButtonRef = useRef<HTMLButtonElement>(null)
  const inputMessageRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  const handleFinishChat = () => {
    finishChat()
    setIsFinishChatConfirmationOverlayOpen(false)
  }

  const handleToggleVisibilityFinishChatConfirmationOverlay = () => {
    if (chatStatus === ChatStatusType.STARTED) {
      setIsFinishChatConfirmationOverlayOpen((prevState) => !prevState)
      return
    }

    minimizeChat()
  }

  const handleCloseButtonKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    const isTabBackward = event.key === 'Tab' && event.shiftKey
    if (!isTabBackward) return
    event.preventDefault()

    inputMessageRef.current?.focus()
  }

  const setCloseChatButtonFocus = () => closeChatButtonRef.current?.focus()

  return (
    <div className="chat">
      {isChatOpen && chatStatus === ChatStatusType.LOADING && (
        <article className="chat-conversation">
          <div className="chat-conversation__loader">
            <Loader />
          </div>
        </article>
      )}
      {isChatOpen && chatStatus !== ChatStatusType.LOADING && (
        <article className="chat-conversation" aria-labelledby="chat-title">
          <header className="chat-conversation__header">
            <div className="chat-conversation__header-buttons-wrapper">
              <button
                disabled={isFinishChatConfirmationOverlay}
                ref={closeChatButtonRef}
                className="chat-conversation__header-button"
                onClick={handleToggleVisibilityFinishChatConfirmationOverlay}
                aria-label={t('chat.header.close_button')}
                onKeyDown={handleCloseButtonKeyDown}
              >
                <Icon icon="close" />
              </button>
              <button
                className="chat-conversation__header-button chat-conversation__header-button--minimize"
                onClick={() => {
                  ChatMetrics.chatMinimize(
                    ChatMinimizeSources.MINIMIZE_BUTTON,
                    location.pathname,
                  )
                  minimizeChat()
                }}
                aria-label={t('chat.header.minimize_button')}
              >
                <Minimize />
              </button>
            </div>
            <div className="chat-conversation__heading">
              <div className="chat-conversation__title-wrapper">
                <h2 id="chat-title" className="chat-conversation__title">
                  {t('chat.title')}
                </h2>
                <ChatStatusBadge status={channelSetup?.type} />
              </div>
            </div>

            <ChatContextualMenu
              chatId={channelSetup?.id}
              isDisabled={isFinishChatConfirmationOverlay}
              onFinishChat={() =>
                handleToggleVisibilityFinishChatConfirmationOverlay()
              }
            />
          </header>
          <ChatContent
            handleToggleVisibilityFinishChatConfirmationOverlay={
              handleToggleVisibilityFinishChatConfirmationOverlay
            }
            handleFinishChat={handleFinishChat}
            isFinishChatConfirmationOverlay={isFinishChatConfirmationOverlay}
            onInputMessageTabKeyDown={setCloseChatButtonFocus}
            inputMessageRef={inputMessageRef}
            chatId={channelSetup?.id}
          />
        </article>
      )}
      <ChatFloatingButton />
    </div>
  )
}

export { Chat }
