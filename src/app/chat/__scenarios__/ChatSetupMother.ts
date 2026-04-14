import { ChatEventResponseMother } from './ChatEventResponseMother'

import { ChatSetupResponse, ChatSetupType } from 'app/chat'

export const ChatSetupMother = {
  default(): ChatSetupResponse {
    return {
      id: 'chat-id',
      auth: {
        type: 'Bearer',
        token: 'fake-token',
      },
      type: ChatSetupType.ONLINE,
      events: [ChatEventResponseMother.agentTextMessage()],
    }
  },
  withUserMessage(userMessage: string): ChatSetupResponse {
    return {
      ...this.default(),
      events: [
        ChatEventResponseMother.agentTextMessage(),
        ChatEventResponseMother.userMessage(userMessage),
      ],
    }
  },
  withMultipleMessages(): ChatSetupResponse {
    return {
      id: 'chat-id',
      auth: {
        type: 'Bearer',
        token: 'fake-token',
      },
      type: ChatSetupType.ONLINE,
      events: [
        ChatEventResponseMother.agentTextMessage(),
        ChatEventResponseMother.userMessage(),
        ChatEventResponseMother.agentTextMessage(
          'De acuerdo, cuénteme, ¿Qué duda tiene sobre su pedido?',
        ),
        ChatEventResponseMother.userMessage(
          'Es que no se si pedí pizza carbonara o cuatro quesos.',
        ),
        ChatEventResponseMother.agentTextMessage(
          'Usted puede comprobar su pedido en el historial de compras de su cuenta.',
        ),
        ChatEventResponseMother.userMessage(
          'Ah vale, muchas gracias por la ayuda!',
        ),
        ChatEventResponseMother.agentImageMessage(),
        ChatEventResponseMother.agentFileMessage(),
      ],
    }
  },
  withOfflineStatus(): ChatSetupResponse {
    return {
      id: 'chat-id',
      auth: {
        type: 'Bearer',
        token: 'fake-token',
      },
      type: ChatSetupType.OFFLINE,
      events: [],
    }
  },
  withAgentImageMessage(): ChatSetupResponse {
    return {
      id: 'chat-id',
      auth: {
        type: 'Bearer',
        token: 'fake-token',
      },
      type: ChatSetupType.ONLINE,
      events: [ChatEventResponseMother.agentImageMessage()],
    }
  },
  empty(): ChatSetupResponse {
    return {
      id: 'chat-id',
      auth: {
        type: 'Bearer',
        token: 'fake-token',
      },
      type: ChatSetupType.ONLINE,
      events: [],
    }
  },
}
