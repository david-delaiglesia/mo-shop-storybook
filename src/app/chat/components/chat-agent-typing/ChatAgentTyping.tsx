import { useTranslation } from 'react-i18next'

import logo from 'system-ui/assets/img/logo-app.svg'

import './ChatAgentTyping.css'

const ChatAgentTyping = () => {
  const { t } = useTranslation()

  return (
    <li
      role="status"
      aria-label={t('chat.conversation.agent_typing')}
      className="chat-messages__message chat-messages__message--support"
    >
      <div className="chat-messages__support-author">
        <img role="presentation" alt="" src={logo} />
      </div>
      <div className="chat-agent-typing">
        <span className="chat-agent-typing__dot" />
        <span className="chat-agent-typing__dot" />
        <span className="chat-agent-typing__dot" />
      </div>
    </li>
  )
}

export { ChatAgentTyping }
