import {
  AgentAssignedChatEvent,
  AgentMessageImageChatEvent,
  AgentMessageTextChatEvent,
  AgentTypingEndChatEvent,
  AgentTypingStartChatEvent,
  ChatEventsContentType,
  ChatEventsType,
  ChatSetupType,
  ConversationReleasedChatEvent,
  ConversationUpdatedChatEvent,
  QueueUpdatedChatEvent,
  UserMessageFileChatEvent,
  UserMessageImageChatEvent,
  UserMessageTextChatEvent,
} from 'app/chat'

export const ChatEventMother = {
  userMessage(
    text = 'Tengo una duda sobre mi pedido.',
    receivedAt = '2025-10-28T12:00:00Z',
  ): UserMessageTextChatEvent {
    return {
      id: `user-message-event-id-${Math.random()}`,
      type: ChatEventsType.CONVERSATION_USER_MESSAGE,
      receivedAt,
      payload: {
        content: {
          type: ChatEventsContentType.TEXT,
          text,
        },
      },
    }
  },
  userImageMessage(
    id: string = `user-image-message-event-id-${Math.random()}`,
  ): UserMessageImageChatEvent {
    return {
      id,
      type: ChatEventsType.CONVERSATION_USER_MESSAGE,
      receivedAt: '2025-10-28T12:00:00Z',
      payload: {
        content: {
          type: ChatEventsContentType.IMAGE,
          mediaUrl:
            'https://mercadona.zendesk.com/sc/attachments/v2/1234/tornillo.jpg',
        },
      },
    }
  },
  userFileMessage(name: string): UserMessageFileChatEvent {
    return {
      id: `user-file-message-event-id-${Math.random()}`,
      type: ChatEventsType.CONVERSATION_USER_MESSAGE,
      receivedAt: '2025-10-28T12:00:00Z',
      payload: {
        content: {
          type: ChatEventsContentType.FILE,
          name,
          mediaUrl: `https://mercadona.zendesk.com/sc/attachments/v2/1234/${name}`,
        },
      },
    }
  },
  userImageFileFormatErrorMessage() {
    return {
      errors: [
        {
          code: 'invalid_file_type',
          detail: 'The file type is not supported',
          extra: {
            allowed_extensions: ['png', 'jpg', 'jpeg'],
          },
        },
      ],
    }
  },
  userFileSizeErrorMessage() {
    return {
      errors: [
        {
          code: 'file_size_exceeded',
          detail: 'Lorem ipsum dolor sit amet',
          extra: {
            limit: '50MB',
          },
        },
      ],
    }
  },
  userUnknownErrorMessage() {
    return { errors: [{ code: 'unknown_file_upload_error' }] }
  },
  agentTextMessage(
    text = 'Hola! ¿cómo podemos ayudarte?',
    receivedAt = '2025-10-28T12:00:00Z',
  ): AgentMessageTextChatEvent {
    return {
      id: `agent-message-event-id-${Math.random()}`,
      type: ChatEventsType.CONVERSATION_AGENT_MESSAGE,
      receivedAt,
      payload: {
        author: {
          displayName: 'Soporte MO',
        },
        content: {
          name: null,
          type: ChatEventsContentType.TEXT,
          text,
          mediaUrl: null,
        },
      },
    }
  },
  agentImageMessage(
    mediaUrl = 'https://mercadona.zendesk.com/sc/attachments/v2/1234/agent_image.jpg',
  ): AgentMessageImageChatEvent {
    return {
      id: `agent-message-event-id-${Math.random()}`,
      type: ChatEventsType.CONVERSATION_AGENT_MESSAGE,
      receivedAt: '2025-10-28T12:00:00Z',
      payload: {
        author: {
          displayName: 'Soporte MO',
        },
        content: {
          name: null,
          type: ChatEventsContentType.IMAGE,
          text: null,
          mediaUrl,
        },
      },
    }
  },
  updateQueuePosition(queuePosition = 3): QueueUpdatedChatEvent {
    return {
      id: `queue-updated-event-${Math.random()}`,
      type: ChatEventsType.QUEUE_UPDATED,
      receivedAt: '2025-10-28T12:00:00Z',
      payload: {
        queuePosition,
      },
    }
  },
  agentAssigned(): AgentAssignedChatEvent {
    return {
      id: `aggent-assigned-event-${Math.random()}`,
      type: ChatEventsType.SUPPORT_AGENT_ASSIGNED,
      receivedAt: '2025-10-28T12:00:00Z',
      payload: {
        displayName: 'Soporte MO',
      },
    }
  },
  conversationReleased(): ConversationReleasedChatEvent {
    return {
      id: `conversation-released-event-${Math.random()}`,
      type: ChatEventsType.CONVERSATION_RELEASED,
      receivedAt: '2025-10-28T12:00:00Z',
    }
  },
  conversationUpdatedToOffline(): ConversationUpdatedChatEvent {
    return {
      id: `conversation-updated-event-${Math.random()}`,
      type: ChatEventsType.CONVERSATION_UPDATED,
      receivedAt: '2025-10-28T12:00:00Z',
      payload: {
        type: ChatSetupType.OFFLINE,
      },
    }
  },
  agentTypingStart(): AgentTypingStartChatEvent {
    return {
      id: `agent-typing-start-event-${Math.random()}`,
      type: ChatEventsType.AGENT_TYPING_START,
      receivedAt: '2025-10-28T12:00:00Z',
    }
  },
  agentTypingEnd(): AgentTypingEndChatEvent {
    return {
      id: `agent-typing-end-event-${Math.random()}`,
      type: ChatEventsType.AGENT_TYPING_END,
      receivedAt: '2025-10-28T12:00:00Z',
    }
  },
}
