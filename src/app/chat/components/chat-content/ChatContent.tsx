import { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { ChatFinishConfirmationOverlay } from '../chat-finish-confirmation-overlay'
import { ChatMessageForm } from '../chat-message-form'
import { ChatSetupError } from '../chat-setup-error'

import { AriaLiveLog } from 'app/accessibility/components/AriaLiveLog'
import { ChatMessages } from 'app/chat/components/chat-messages'
import { ChatPrivacyPolicy } from 'app/chat/components/chat-privacy-policy'
import { useChatContext } from 'app/chat/contexts/useChatContext'
import { ChatStatus } from 'app/chat/domain/chat-status'
import { useChatAutoScroll } from 'app/chat/hooks/useChatAutoScroll'
import { useChatVoiceOverAnnouncement } from 'app/chat/hooks/useChatVoiceOverAnnouncement'
import { AttachmentSources, ChatMetrics } from 'app/chat/metrics'
import { FileDropZone } from 'system-ui/file-drop-zone'

interface ChatContentProps {
  handleToggleVisibilityFinishChatConfirmationOverlay: () => void
  handleFinishChat: () => void
  isFinishChatConfirmationOverlay: boolean
  onInputMessageTabKeyDown: () => void
  inputMessageRef: RefObject<HTMLInputElement>
  chatId?: string
}

const ChatContent = ({
  handleToggleVisibilityFinishChatConfirmationOverlay,
  handleFinishChat,
  isFinishChatConfirmationOverlay,
  onInputMessageTabKeyDown,
  inputMessageRef,
  chatId,
}: ChatContentProps) => {
  const { chatStatus, events, onSendFile, isAgentTyping } = useChatContext()!
  const location = useLocation()
  const { t } = useTranslation()

  const { scrollContainerRef, handleScroll, isAgentTypingVisible } =
    useChatAutoScroll(events, isAgentTyping)
  const lastMessageAnnouncement = useChatVoiceOverAnnouncement(events)

  const sendMetric = (attachmentSource: AttachmentSources) => {
    ChatMetrics.chatFileSent(attachmentSource, location.pathname, chatId)
  }

  if (isFinishChatConfirmationOverlay) {
    return (
      <ChatFinishConfirmationOverlay
        onContinueConversation={
          handleToggleVisibilityFinishChatConfirmationOverlay
        }
        onFinishChat={handleFinishChat}
      />
    )
  }

  if (ChatStatus.isFailed(chatStatus)) {
    return <ChatSetupError />
  }
  return (
    <>
      <AriaLiveLog>
        <ul>
          {lastMessageAnnouncement.map((event) => (
            <li key={event.id}>{event.payload.content.text}</li>
          ))}
        </ul>
      </AriaLiveLog>
      <section
        role="log"
        aria-label={t('chat.conversation.aria_label')}
        className="chat-conversation__section"
        aria-live="off"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <FileDropZone
          isConversationActive
          onSendFile={(file) => {
            sendMetric(AttachmentSources.DROP)
            onSendFile(file)
          }}
        >
          <div className="chat-conversation__messages-container">
            <ChatPrivacyPolicy />
            <ChatMessages
              chatId={chatId}
              isAgentTyping={isAgentTypingVisible}
            />
          </div>
        </FileDropZone>
      </section>

      <ChatMessageForm
        onSubmitFile={(file) => {
          sendMetric(AttachmentSources.FORM)
          onSendFile(file)
        }}
        onInputMessageTabKeyDown={onInputMessageTabKeyDown}
        inputMessageRef={inputMessageRef}
      />
    </>
  )
}

export { ChatContent }
