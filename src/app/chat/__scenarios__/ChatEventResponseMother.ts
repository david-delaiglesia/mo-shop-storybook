import {
  AgentAssignedChatEventResponse,
  AgentMessageFileChatEventResponse,
  AgentMessageImageChatEventResponse,
  AgentMessageTextChatEventResponse,
  ChatEventsContentType,
  ChatEventsType,
  ConversationReleasedChatEventResponse,
  QueueUpdatedChatEventResponse,
  UserMessageTextChatEventResponse,
} from 'app/chat'

export const ChatEventResponseMother = {
  userMessage(
    message = 'Tengo una duda sobre mi pedido.',
  ): UserMessageTextChatEventResponse {
    return {
      id: `user-message-event-id-${Math.random()}`,
      type: ChatEventsType.CONVERSATION_USER_MESSAGE,
      received_at: '2025-10-28T12:00:00Z',
      payload: {
        content: {
          type: ChatEventsContentType.TEXT,
          text: message,
        },
      },
    }
  },
  agentTextMessage(
    text = 'Hola! ¿cómo podemos ayudarte?',
  ): AgentMessageTextChatEventResponse {
    return {
      id: `agent-message-event-id-${Math.random()}`,
      type: ChatEventsType.CONVERSATION_AGENT_MESSAGE,
      received_at: '2025-10-28T12:00:00Z',
      payload: {
        author: {
          display_name: 'Soporte MO',
        },
        content: {
          media_url: null,
          type: ChatEventsContentType.TEXT,
          text,
        },
      },
    }
  },
  agentImageMessage(
    media_url = 'https://mercadona.zendesk.com/sc/attachments/v2/1234/agent_image.jpg',
  ): AgentMessageImageChatEventResponse {
    return {
      id: `agent-message-event-id-${Math.random()}`,
      type: ChatEventsType.CONVERSATION_AGENT_MESSAGE,
      received_at: '2025-10-28T12:00:00Z',
      payload: {
        author: {
          display_name: 'Soporte MO',
        },
        content: {
          media_url,
          type: ChatEventsContentType.IMAGE,
          text: null,
        },
      },
    }
  },
  agentFileMessage(name = 'agent_file.pdf'): AgentMessageFileChatEventResponse {
    return {
      id: `agent-message-event-id-${Math.random()}`,
      type: ChatEventsType.CONVERSATION_AGENT_MESSAGE,
      received_at: '2025-10-28T12:00:00Z',
      payload: {
        author: {
          display_name: 'Soporte MO',
        },
        content: {
          name,
          media_url: `https://mercadona.zendesk.com/sc/attachments/v2/1234/${name}`,
          type: ChatEventsContentType.FILE,
          text: null,
        },
      },
    }
  },
  updateQueuePosition(
    queuePosition: number = 3,
  ): QueueUpdatedChatEventResponse {
    return {
      id: `queue-updated-event-${Math.random()}`,
      type: ChatEventsType.QUEUE_UPDATED,
      received_at: '2025-10-28T12:00:00Z',
      payload: {
        queue_position: queuePosition,
      },
    }
  },
  agentAssigned(): AgentAssignedChatEventResponse {
    return {
      id: `aggent-assigned-event-${Math.random()}`,
      type: ChatEventsType.SUPPORT_AGENT_ASSIGNED,
      received_at: '2025-10-28T12:00:00Z',
      payload: {
        display_name: 'Soporte MO',
      },
    }
  },
  conversationReleased(): ConversationReleasedChatEventResponse {
    return {
      id: `conversation-released-event-${Math.random()}`,
      type: ChatEventsType.CONVERSATION_RELEASED,
      received_at: '2025-10-28T12:00:00Z',
    }
  },
}
