import { screen, within } from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import { openHelpDeskChat } from 'pages/home/__tests__/helpers'
import { emitMessageHelDeskChat } from 'services/chat-socket/__tests__/ChatSocket.mock'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

it('should sort the agent messages by timestamp', async () => {
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

  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage(
      'Segundo mensaje del agente',
      '2025-10-28T12:00:00.002000Z',
    ),
  )
  emitMessageHelDeskChat(
    ChatEventMother.userMessage(
      'Primer mensaje del usuario',
      '2025-10-28T12:00:00.000Z',
    ),
  )
  emitMessageHelDeskChat(
    ChatEventMother.agentTextMessage(
      'Primer mensaje del agente',
      '2025-10-28T12:00:00.001000Z',
    ),
  )
  emitMessageHelDeskChat(
    ChatEventMother.userMessage(
      'Segundo mensaje del usuario',
      '2025-10-28T12:00:00.003Z',
    ),
  )
  const messages = await within(helpDeskChat).findAllByRole('listitem')
  const {
    1: firstUserMessage,
    2: firstAgentMessage,
    3: secondAgentMessage,
    4: secondUserMessage,
  } = messages
  expect(firstUserMessage).toHaveTextContent('Primer mensaje del usuario')
  expect(firstAgentMessage).toHaveTextContent('Primer mensaje del agente')
  expect(secondAgentMessage).toHaveTextContent('Segundo mensaje del agente')
  expect(secondUserMessage).toHaveTextContent('Segundo mensaje del usuario')
})

describe('under flag WEB_NEW_SUPPORT_CHAT_MARKDOWN enabled', () => {
  beforeEach(() => {
    activeFeatureFlags([
      knownFeatureFlags.NEW_SUPPORT_CHAT,
      knownFeatureFlags.WEB_NEW_SUPPORT_CHAT_MARKDOWN,
    ])
  })

  it('should render links opening in a new tab', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: { user_id: '1' },
        responseBody: ChatSetupMother.default(),
      },
    ]

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()

    const helpDeskChat = await screen.findByLabelText('Customer service')

    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage(
        '[Consulta nuestro centro de ayuda](https://mercadona.es/ayuda)',
      ),
    )

    const link = within(helpDeskChat).getByRole('link', {
      name: 'Consulta nuestro centro de ayuda',
    })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render single line breaks', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: { user_id: '1' },
        responseBody: ChatSetupMother.empty(),
      },
    ]

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()

    const helpDeskChat = await screen.findByLabelText('Customer service')

    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('Primera línea\nSegunda línea'),
    )

    const [message] = within(helpDeskChat).getAllByRole('listitem')
    expect(message).toHaveTextContent('Primera línea')
    expect(message).toHaveTextContent('Segunda línea')
  })

  it('should render bold text', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: { user_id: '1' },
        responseBody: ChatSetupMother.empty(),
      },
    ]

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()

    const helpDeskChat = await screen.findByLabelText('Customer service')

    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('Texto con **negrita**'),
    )

    const boldText = within(helpDeskChat).getByText('negrita')
    expect(boldText.tagName).toBe('STRONG')
  })

  it('should render plain URLs as clickable links', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: { user_id: '1' },
        responseBody: ChatSetupMother.empty(),
      },
    ]

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()

    const helpDeskChat = await screen.findByLabelText('Customer service')

    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('https://mercadona.es/ayuda'),
    )

    const link = within(helpDeskChat).getByRole('link', {
      name: 'https://mercadona.es/ayuda',
    })
    expect(link).toHaveAttribute('href', 'https://mercadona.es/ayuda')
  })

  it('should render lists', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: { user_id: '1' },
        responseBody: ChatSetupMother.empty(),
      },
    ]

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()

    const helpDeskChat = await screen.findByLabelText('Customer service')

    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('- Primer punto\n- Segundo punto'),
    )

    expect(within(helpDeskChat).getByText('Primer punto')).toBeInTheDocument()
    expect(within(helpDeskChat).getByText('Segundo punto')).toBeInTheDocument()
  })
})

describe('under flag WEB_NEW_SUPPORT_CHAT_MARKDOWN disabled', () => {
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should not render bold from markdown syntax', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: { user_id: '1' },
        responseBody: ChatSetupMother.empty(),
      },
    ]

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()

    const helpDeskChat = await screen.findByLabelText('Customer service')

    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('Texto con **negrita**'),
    )

    expect(within(helpDeskChat).queryByText('negrita')).not.toBeInTheDocument()
  })

  it('should not render links from markdown syntax', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: { user_id: '1' },
        responseBody: ChatSetupMother.empty(),
      },
    ]

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()

    const helpDeskChat = await screen.findByLabelText('Customer service')

    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage(
        '[Consulta nuestro centro de ayuda](https://mercadona.es/ayuda)',
      ),
    )

    expect(
      within(helpDeskChat).queryByRole('link', {
        name: 'Consulta nuestro centro de ayuda',
      }),
    ).not.toBeInTheDocument()
  })
})
