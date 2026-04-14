import { screen, within } from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatEventResponseMother } from 'app/chat/__scenarios__/ChatEventResponseMother'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import { openHelpDeskChat } from 'pages/home/__tests__/helpers'
import { emitMessageHelDeskChat } from 'services/chat-socket/__tests__/ChatSocket.mock'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Duplicate messages', () => {
  it('should show duplicate messages when feature flag is disabled', async () => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])

    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: {
          ...ChatSetupMother.default(),
          events: [
            ChatEventResponseMother.agentTextMessage(
              'Este es un mensaje duplicado',
            ),
          ],
        },
      },
    ]

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()

    const helpDeskChat = await screen.findByLabelText('Customer service')

    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('Este es un mensaje duplicado'),
    )

    const messages = await within(helpDeskChat).findAllByRole('listitem')

    const duplicatedMessages = messages.filter((message) =>
      message.textContent?.includes('Este es un mensaje duplicado'),
    )

    expect(duplicatedMessages).toHaveLength(2)
  })

  it('should filter duplicate messages from socket only', async () => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])

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

    const firstSocketMessage = ChatEventMother.agentTextMessage(
      'Mensaje desde socket',
    )
    emitMessageHelDeskChat(firstSocketMessage)

    const duplicateSocketMessage = ChatEventMother.agentTextMessage(
      'Mensaje desde socket',
    )
    duplicateSocketMessage.id = firstSocketMessage.id
    emitMessageHelDeskChat(duplicateSocketMessage)

    const messages = await within(helpDeskChat).findAllByRole('listitem')

    const duplicatedMessages = messages.filter((message) =>
      message.textContent?.includes('Mensaje desde socket'),
    )

    expect(duplicatedMessages).toHaveLength(1)
  })

  it('should filter duplicate messages from both setup and socket', async () => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])

    const duplicatedMessage = ChatEventResponseMother.agentTextMessage(
      'Mensaje en ambos lados',
    )

    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: {
          ...ChatSetupMother.default(),
          events: [duplicatedMessage],
        },
      },
    ]

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()

    const helpDeskChat = await screen.findByLabelText('Customer service')

    const duplicatedEventFromSocket = ChatEventMother.agentTextMessage(
      'Mensaje en ambos lados',
    )
    duplicatedEventFromSocket.id = duplicatedMessage.id
    emitMessageHelDeskChat(duplicatedEventFromSocket)

    const messages = await within(helpDeskChat).findAllByRole('listitem')

    const duplicatedMessages = messages.filter((message) =>
      message.textContent?.includes('Mensaje en ambos lados'),
    )

    expect(duplicatedMessages).toHaveLength(1)
  })
})
