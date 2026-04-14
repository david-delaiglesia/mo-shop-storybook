import {
  camelCaseToSnakeCase,
  snakeCaseToCamelCase,
} from '@mercadona/mo.library.dashtil'

import {
  ChatSetup,
  ChatSetupResponse,
  UserChatEvent,
  UserMessageFileChatEvent,
  UserMessageImageChatEvent,
  UserMessageTextChatEvent,
  UserMessageTextChatEventResponse,
  UserUploadingFileChatEvent,
} from 'app/chat/interfaces'
import { Http } from 'services/http'

export const ChatClient = {
  async setup({
    userId,
    message,
  }: {
    userId: string
    message?: string
  }): Promise<ChatSetup> {
    return Http.auth()
      .post<ChatSetupResponse>('/conversations/chats/setup/', {
        body: JSON.stringify(
          camelCaseToSnakeCase({
            userId,
            ...(message && {
              events: [
                {
                  message: message,
                },
              ],
            }),
          }),
        ),
      })
      .then((response) => snakeCaseToCamelCase(response))
  },

  async anonymousSetup({
    anonymousId,
    message,
  }: {
    anonymousId: string
    message?: string
  }): Promise<ChatSetup> {
    return Http.auth()
      .post<ChatSetupResponse>('/conversations/chats/setup/', {
        body: JSON.stringify(
          camelCaseToSnakeCase({
            anonymousId,
            ...(message && {
              events: [
                {
                  message: message,
                },
              ],
            }),
          }),
        ),
      })
      .then((response) => snakeCaseToCamelCase(response))
  },

  async finish({ chatId, auth }: { chatId: string; auth: ChatSetup['auth'] }) {
    return Http.post<void>(`/conversations/chats/${chatId}/release/`, {
      headers: {
        authorization: `${auth.type} ${auth.token}`,
      },
    })
  },

  sendMessage({
    id,
    event,
    auth,
  }: {
    id: string
    event: UserChatEvent
    auth: ChatSetup['auth']
  }): Promise<UserMessageTextChatEvent> {
    return Http.put<UserMessageTextChatEventResponse>(
      `/conversations/chats/${id}/messages/${event.id}/`,
      {
        body: JSON.stringify(
          camelCaseToSnakeCase({ message: event.payload.content.text }),
        ),
        headers: {
          authorization: `${auth.type} ${auth.token}`,
        },
      },
    )
  },

  async sendFile({
    id,
    event,
    auth,
  }: {
    id: string
    event: UserUploadingFileChatEvent
    auth: ChatSetup['auth']
  }): Promise<UserMessageImageChatEvent | UserMessageFileChatEvent> {
    const formData = new FormData()
    formData.append('file', event.payload.content.file)
    const API_HOST = import.meta.env.VITE_API_HOST

    return fetch(
      `${API_HOST}/conversations/chats/${id}/messages/${event.id}/media/`,
      {
        method: 'PUT',
        body: formData,
        headers: {
          authorization: `${auth.type} ${auth.token}`,
        },
      },
    )
      .then(async (response) => {
        const body = await response.json()

        if (!response.ok && response.status === 400) {
          throw new Error(JSON.stringify(body))
        }

        if (!response.ok) {
          throw new Error(
            JSON.stringify({ errors: [{ code: 'unknown_file_upload_error' }] }),
          )
        }

        return body
      })
      .then((response) => snakeCaseToCamelCase(response))
  },
}
