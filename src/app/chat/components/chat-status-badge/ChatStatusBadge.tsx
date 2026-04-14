import { useTranslation } from 'react-i18next'

import { ChatSetupType } from 'app/chat/interfaces'

import './ChatStatusBadge.css'

interface ChatStatusBadgeProps {
  status?: ChatSetupType
}

const ChatStatusBadge: React.FC<ChatStatusBadgeProps> = ({
  status,
}: ChatStatusBadgeProps) => {
  const { t } = useTranslation()

  if (!status) return null
  return (
    <div
      role="status"
      aria-labelledby="chat-status-text"
      className={`chat-status-badge chat-status-badge--${status}`}
    >
      <div
        className={`chat-status-badge__indicator chat-status-badge__indicator--${status}`}
      />
      <span id="chat-status-text" className="chat-status-badge__text">
        {status === ChatSetupType.ONLINE
          ? t('chat.status_badge.available')
          : t('chat.status_badge.unavailable')}
      </span>
    </div>
  )
}

export { ChatStatusBadge }
