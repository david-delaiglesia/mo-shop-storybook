import { ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router'

import { Chat } from 'app/chat/components/chat'
import { ChatContext } from 'app/chat/contexts/ChatContext'
import { useChat } from 'app/chat/hooks'
import { ChatHelpSources, ChatMetrics } from 'app/chat/metrics'
import { PATHS } from 'pages/paths'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { Support } from 'services/support'

const HIDE_ZENDESK_WIDGET_SETTINGS = {
  webWidget: {
    color: {
      bypassAccessibilityRequirement: true,
      launcherText: '#ffffff',
    },
    helpCenter: {
      title: {
        es: 'Ayuda',
        ca: 'Ajuda',
        'en-us': 'Help',
        '*': 'Ayuda',
      },
      chatButton: {
        es: 'Abrir chat',
        ca: 'Obrir xat',
        'en-us': 'Open chat',
        '*': 'Abrir chat',
      },
      searchPlaceholder: {
        es: 'Ej.: Pago, gastos de envío, contacto',
        ca: "Ex.: Pagament, despeses d'enviament, contacte",
        'en-us': 'E.g.: payment, shipping costs, contact information',
        '*': 'Ej.: Pago, gastos de envío, contacto',
      },
      suppress: true,
    },
    chat: {
      tags: ['formulario'],
      visitor: {
        departments: {
          department: 'ACMO',
        },
      },
      suppress: true,
    },
    contactForm: {
      suppress: true,
    },
  },
}

const SHOW_ZENDESK_WIDGET_SETTINGS = {
  webWidget: {
    color: {
      bypassAccessibilityRequirement: true,
      launcherText: '#ffffff',
    },
    helpCenter: {
      title: {
        es: 'Ayuda',
        ca: 'Ajuda',
        'en-us': 'Help',
        '*': 'Ayuda',
      },
      chatButton: {
        es: 'Abrir chat',
        ca: 'Obrir xat',
        'en-us': 'Open chat',
        '*': 'Abrir chat',
      },
      searchPlaceholder: {
        es: 'Ej.: Pago, gastos de envío, contacto',
        ca: "Ex.: Pagament, despeses d'enviament, contacte",
        'en-us': 'E.g.: payment, shipping costs, contact information',
        '*': 'Ej.: Pago, gastos de envío, contacto',
      },
      suppress: false,
    },
    chat: {
      tags: ['formulario'],
      visitor: {
        departments: {
          department: 'ACMO',
        },
      },
      suppress: false,
    },
    contactForm: {
      suppress: false,
    },
  },
}

const ChatContainer = ({ children }: { children: ReactNode }) => {
  const isActiveNewChat = useFlag(knownFeatureFlags.NEW_SUPPORT_CHAT)
  const location = useLocation()
  const {
    isChatOpen,
    chatStatus,
    openChat,
    openRemote,
    events,
    sendMessage,
    sendTextMessageEvent,
    onSendFile,
    finishChat,
    startNewChat,
    channelSetup,
    unreadMessagesCount,
    isSendingMessage,
    isAgentTyping,
    minimizeChat,
    isSoundActive,
    toggleSound,
    setEventsReadByUser,
  } = useChat()

  useEffect(() => {
    if (!isActiveNewChat) {
      Support.updateSettings({
        ...SHOW_ZENDESK_WIDGET_SETTINGS,
      })
      return
    }

    Support.updateSettings({
      ...HIDE_ZENDESK_WIDGET_SETTINGS,
    })
  }, [isActiveNewChat])

  useEffect(() => {
    if (location.pathname === PATHS.HELP && !isActiveNewChat) {
      Support.openWidget()
      return
    }
    if (location.pathname === PATHS.HELP && isActiveNewChat) {
      ChatMetrics.chatHelpClick(ChatHelpSources.HELP, location.pathname)
      openChat()
      return
    }
  }, [])

  if (!isActiveNewChat) return children

  return (
    <ChatContext.Provider
      value={{
        isChatOpen,
        chatStatus,
        events,
        channelSetup,
        unreadMessagesCount,
        isSendingMessage,
        isAgentTyping,
        isSoundActive,
        openChat,
        open: openRemote,
        minimizeChat,
        sendMessage,
        sendTextMessageEvent,
        onSendFile,
        finishChat,
        startNewChat,
        setEventsReadByUser,
        toggleSound,
      }}
    >
      <Chat />
      {children}
    </ChatContext.Provider>
  )
}

export { ChatContainer }
