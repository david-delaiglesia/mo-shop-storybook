import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'

import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import { retryStartNewChat } from 'pages/__tests__/helpers/chat'
import { openHelpDeskChat } from 'pages/home/__tests__/helpers'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Chat - Anonymous User', () => {
  beforeEach(() => {
    localStorage.clear()
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should can start the chat after open it with anonymous id', async () => {
    const responses: NetworkResponses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          anonymous_id: '10000000-1000-4000-8000-100000000000',
        },
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toHaveClass('chat-messages__message-text--support footnote1-r')
  })

  it('should render the loader until the chat setup is complete for anonymous user', async () => {
    const responses: NetworkResponses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          anonymous_id: '10000000-1000-4000-8000-100000000000',
        },
        responseBody: ChatSetupMother.default(),
        delay: 100,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const loader = await screen.findByLabelText('loader')
    await waitForElementToBeRemoved(loader)
    expect(await screen.findByLabelText('Customer service')).toBeInTheDocument()
  })

  it('should see an error start the anonymous chat fails', async () => {
    const responses: NetworkResponses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          anonymous_id: '10000000-1000-4000-8000-100000000000',
        },
        status: 500,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')

    await waitFor(() =>
      expect('/conversations/chats/setup/').toHaveBeenFetchedTimes(1),
    )
    expect(
      within(helpDeskChat).getByText('Sorry, we couldn’t start the chat.'),
    ).toHaveAttribute('aria-live', 'assertive')
    expect(within(helpDeskChat).getByRole('button', { name: 'Try again' }))
    expect(
      within(helpDeskChat).queryByLabelText(
        'Mensajes del chat con Customer service',
      ),
    ).not.toBeInTheDocument()
  })

  it('should can start the anonymous chat after fails', async () => {
    const responses: NetworkResponses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          anonymous_id: '10000000-1000-4000-8000-100000000000',
        },
        multipleResponses: [
          {
            status: 500,
          },
          {
            responseBody: ChatSetupMother.default(),
          },
        ],
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    await within(helpDeskChat).findByText('Sorry, we couldn’t start the chat.')
    retryStartNewChat()
    const newHelpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(newHelpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
    expect('/conversations/chats/setup/').toHaveBeenFetchedTimes(2)
  })

  it('should can start the chat after open it using the previous anonymous id', async () => {
    localStorage.setItem(
      'anonymous-user-chat-id',
      '20000000-2000-4000-8000-200000000000',
    )
    const responses: NetworkResponses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          anonymous_id: '20000000-2000-4000-8000-200000000000',
        },
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toHaveClass('chat-messages__message-text--support footnote1-r')
  })

  it('should keep the anonymous id after start the chat using an anonymous id', async () => {
    vi.spyOn(window.localStorage.__proto__, 'setItem')
    const responses: NetworkResponses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          anonymous_id: '10000000-1000-4000-8000-100000000000',
        },
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    await within(helpDeskChat).findByRole('log')

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'anonymous-user-chat-id',
      '10000000-1000-4000-8000-100000000000',
    )
  })
})
