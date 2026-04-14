import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'

import {
  generateFile,
  openHelpDeskChat,
  retryErrorMessageHelpDeskChat,
  sendMessageToHelDeskChatWithButton,
  writeMessageHelpDeskChat,
} from '../helpers'
import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import { ChatClient } from 'app/chat/client'
import { sendFileToHelDeskChat } from 'pages/__tests__/helpers/chat'
import { knownFeatureFlags } from 'services/feature-flags'
import { Tracker } from 'services/tracker'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User messages metrics in Help Desk Chat', () => {
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should send a metric when a text message fails to be sent', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: ChatSetupMother.default(),
      },
      {
        path: '/conversations/chats/chat-id/messages/10000000-1000-4000-8000-100000000000/',
        method: 'put',
        requestBody: {
          message: 'Necesito ayuda',
        },
        status: 502,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')
    writeMessageHelpDeskChat('Necesito ayuda')
    sendMessageToHelDeskChatWithButton()

    await within(messages).findByText('Not sent')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'chat_message_sent_error',
      {
        chatId: 'chat-id',
        hasAttachment: false,
      },
    )
  })

  it('should send a metric when a file message fails to be sent', async () => {
    vi.spyOn(ChatClient, 'sendFile').mockRejectedValue(
      new Error(JSON.stringify(ChatEventMother.userUnknownErrorMessage())),
    )
    const jpgFile = generateFile({
      name: 'tornillo',
      extension: 'jpg',
      size: 1000000,
    })
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    sendFileToHelDeskChat(jpgFile)

    await within(messages).findByText('Failed to upload. Please try again.')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'chat_message_sent_error',
      {
        chatId: 'chat-id',
        hasAttachment: true,
        fileType: 'image/jpg',
      },
    )
  })
  it('should send a metric when a message is sent, fails to be delivered and user click on retry', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: ChatSetupMother.default(),
      },
      {
        path: '/conversations/chats/chat-id/messages/10000000-1000-4000-8000-100000000000/',
        method: 'put',
        requestBody: {
          message: 'Necesito ayuda',
        },
        multipleResponses: [
          {
            status: 502,
          },
          {
            status: 200,
            responseBody: {
              id: '10000000-1000-4000-8000-100000000000',
              received_at: '2025-11-24T09:52:26.479490+00:00',
              type: 'conversation:user_message',
              payload: {
                content: {
                  type: 'text',
                  text: 'Necesito ayuda',
                },
              },
            },
          },
        ],
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')
    writeMessageHelpDeskChat('Necesito ayuda')
    sendMessageToHelDeskChatWithButton()
    expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
      'chat_message_sent_retry',
      {
        chatId: 'chat-id',
      },
    )
    const errorMessage = await within(messages).findByText('Not sent')
    retryErrorMessageHelpDeskChat()

    await waitForElementToBeRemoved(errorMessage)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'chat_message_sent_retry',
      {
        chatId: 'chat-id',
      },
    )
  })
})
