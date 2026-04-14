import { screen, within } from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import { ChatClient } from 'app/chat/client'
import { sendFileToHelDeskChat } from 'pages/__tests__/helpers/chat'
import {
  dropFilesInChat,
  generateFile,
  openHelpDeskChat,
} from 'pages/home/__tests__/helpers'
import { knownFeatureFlags } from 'services/feature-flags'
import { Tracker } from 'services/tracker'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

beforeEach(() => {
  activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
})

describe('Home - Chat - Files messages', () => {
  const jpgFile = generateFile({ name: 'tornillo', extension: 'jpg' })
  vi.spyOn(ChatClient, 'sendFile').mockResolvedValue(
    ChatEventMother.userImageMessage(),
  )

  it('should can send a file to the support agent', async () => {
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
    await within(helpDeskChat).findByRole('log')
    sendFileToHelDeskChat(jpgFile)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('chat_file_sent', {
      chat_id: 'chat-id',
      view: '/',
      platform: 'web',
      attachment_source: 'form',
    })
  })
})

describe('Drag and drop files', () => {
  it('should upload a file when dropping it directly into the chat', async () => {
    const pdfFile = generateFile({ name: 'document', extension: 'pdf' })

    vi.spyOn(ChatClient, 'sendFile').mockResolvedValue(
      ChatEventMother.userFileMessage('document.pdf'),
    )

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

    dropFilesInChat(within(messages).getByRole('list'), pdfFile)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('chat_file_sent', {
      chat_id: 'chat-id',
      view: '/',
      platform: 'web',
      attachment_source: 'drop',
    })
  })
})
