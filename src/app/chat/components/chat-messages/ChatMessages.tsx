import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'

import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

import { ChatAgentTyping } from 'app/chat/components/chat-agent-typing'
import { ChatFileUploading } from 'app/chat/components/chat-file-uploading'
import { useChatContext } from 'app/chat/contexts/useChatContext'
import { ChatEvent as ChatEventDomain } from 'app/chat/domain/chat-event'
import {
  ChatEvent,
  ChatEventsContentType,
  UserChatEvent,
  UserUploadingFileChatEvent,
} from 'app/chat/interfaces'
import { ChatMetrics } from 'app/chat/metrics'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import logo from 'system-ui/assets/img/logo-app.svg'
import { Check, Document, ReloadIcon } from 'system-ui/icons'

import './ChatMessages.css'

interface ChatMessagesProps {
  chatId: string | undefined
  isAgentTyping: boolean
}

const ChatMessages = ({ chatId, isAgentTyping }: ChatMessagesProps) => {
  const { events, sendTextMessageEvent, isSendingMessage } = useChatContext()
  const { t } = useTranslation()
  const isMarkdownEnabled = useFlag(
    knownFeatureFlags.WEB_NEW_SUPPORT_CHAT_MARKDOWN,
  )

  const retryMessage = (event: UserChatEvent) => {
    sendTextMessageEvent(event)
    if (!chatId) return
    ChatMetrics.chatMessageSentRetry(chatId)
  }

  return (
    <ol className="chat-messages">
      {events.map((event: ChatEvent) => (
        <Fragment key={event.id}>
          {ChatEventDomain.isMessageFromAgent(event) &&
            event.payload.content.type === ChatEventsContentType.TEXT && (
              <li className="chat-messages__message chat-messages__message--support">
                <div className="chat-messages__support-author">
                  <img role="presentation" alt="" src={logo} />
                  <p className="footnote1-r">
                    {event.payload.author.displayName}
                  </p>
                </div>
                {isMarkdownEnabled ? (
                  <div className="chat-messages__message-text--support footnote1-r">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {event.payload.content.text ?? ''}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="chat-messages__message-text--support footnote1-r">
                    {event.payload.content.text}
                  </p>
                )}
              </li>
            )}
          {ChatEventDomain.isMessageFromAgent(event) &&
            event.payload.content.type === ChatEventsContentType.IMAGE && (
              <li className="chat-messages__support-image">
                <img
                  alt={t('chat.conversation.received_image')}
                  src={event.payload.content.mediaUrl as string}
                />
              </li>
            )}
          {ChatEventDomain.isMessageFromAgent(event) &&
            event.payload.content.type === ChatEventsContentType.FILE && (
              <li className="chat-messages__support-file chat-messages__message--support">
                <div className="chat-messages__support-file__container">
                  <Document className="chat-messages__file-icon--is-uploaded" />
                  <div className="chat-messages__support-file__detail">
                    <p className="chat-file-uploading__file-name subhead1-r">
                      {event.payload.content.name as string}
                    </p>
                    <div className="chat-messages__support-file__detail-document">
                      <a
                        href={event.payload.content.mediaUrl as string}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('chat.conversation.open_document')}
                      </a>
                      <Check
                        aria-label={t('chat.conversation.received_document', {
                          name: event.payload.content.name as string,
                        })}
                      />
                    </div>
                  </div>
                </div>
              </li>
            )}
          {ChatEventDomain.isMessageFromUser(event) &&
            event.payload.content.type === ChatEventsContentType.TEXT && (
              <li className="chat-messages__message chat-messages__message--user">
                <p className="chat-messages__message-text--user footnote1-r">
                  {event.payload.content.text}
                </p>
              </li>
            )}
          {ChatEventDomain.isMessageFromUser(event) &&
            event.payload.content.type === ChatEventsContentType.TEXT_ERROR && (
              <li className="chat-messages__message--user-with-error">
                <div className="chat-messages__message-with-error-message-container">
                  <div className="chat-messages__message-contents">
                    <p className="chat-messages__message-text--user footnote1-r">
                      {event.payload.content.text}
                    </p>
                  </div>
                  <div className="chat-messages__message-error-message caption1-r">
                    {t('chat.conversation.failed_message.not_sent')}
                  </div>
                </div>
                <button
                  disabled={isSendingMessage}
                  className="chat-messages__message-retry-button"
                  onClick={() => retryMessage(event as UserChatEvent)}
                >
                  <ReloadIcon
                    aria-label={t('chat.conversation.failed_message.retry')}
                  />
                </button>
              </li>
            )}
          {ChatEventDomain.isMessageFromUser(event) &&
            event.payload.content.type ===
              ChatEventsContentType.UPLOADING_FILE && (
              <li className="chat-messages__user-file chat-messages__user-file--is-uploading">
                <div className="chat-messages__user-file__container">
                  <Document className="chat-messages__file-icon--is-uploading" />
                  <ChatFileUploading
                    event={event as UserUploadingFileChatEvent}
                  />
                </div>
              </li>
            )}
          {ChatEventDomain.isMessageFromUser(event) &&
            event.payload.content.type ===
              ChatEventsContentType.UPLOADING_FILE_ERROR && (
              <li className="chat-messages__user-file chat-messages__user-file--upload-error">
                <div className="chat-messages__user-file__container">
                  <Document className="chat-messages__file-icon--upload-error" />
                  <div className="chat-messages__user-file-detail">
                    <p className="chat-messages__user-file-name subhead1-r">
                      {event.payload.content.fileName}
                    </p>
                    <p className="chat-messages__error-message caption1-sb">
                      {event.payload.content.errorMessage}
                    </p>
                  </div>
                </div>
              </li>
            )}
          {ChatEventDomain.isMessageFromUser(event) &&
            event.payload.content.type === ChatEventsContentType.FILE && (
              <li className="chat-messages__user-file chat-messages__user-file--is-document-uploaded">
                <div className="chat-messages__user-file__container">
                  <Document className="chat-messages__file-icon--is-uploaded" />
                  <div className="chat-messages__user-file__detail">
                    <p className="chat-file-uploading__file-name subhead1-r">
                      {event.payload.content.name}
                    </p>
                    <div className="chat-messages__user-file__detail-document">
                      <a
                        href={event.payload.content.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('chat.conversation.open_document')}
                      </a>
                      <Check
                        aria-label={t(
                          'chat.conversation.document.sent_successfully',
                          {
                            name: event.payload.content.name,
                          },
                        )}
                      />
                    </div>
                  </div>
                </div>
              </li>
            )}
          {ChatEventDomain.isMessageFromUser(event) &&
            event.payload.content.type === ChatEventsContentType.IMAGE && (
              <li className="chat-messages__user-file chat-messages__user-file--is-uploaded">
                <img
                  alt={t('chat.conversation.image.sent_successfully')}
                  src={event.payload.content.mediaUrl}
                />
              </li>
            )}
          {ChatEventDomain.isAgentAssigned(event) && (
            <li className="chat-messages__system-status-update">
              <p className="chat-messages__system-status-update-text footnote1-r">
                {t('chat.conversation.agent_assigned', {
                  name: event.payload.displayName,
                })}
              </p>
            </li>
          )}
          {ChatEventDomain.isQueueUpdated(event) && (
            <li className="chat-messages__system-status-update">
              <p className="chat-messages__system-status-update-text footnote1-r">
                {t('chat.conversation.queue_position', {
                  position: event.payload.queuePosition,
                })}
              </p>
            </li>
          )}
          {ChatEventDomain.isConversationReleased(event) && (
            <li className="chat-messages__system-status-update">
              <p className="chat-messages__system-status-update-text footnote1-r">
                {t('chat.conversation.ended')}
              </p>
            </li>
          )}
        </Fragment>
      ))}
      {isAgentTyping && <ChatAgentTyping />}
    </ol>
  )
}

export { ChatMessages }
