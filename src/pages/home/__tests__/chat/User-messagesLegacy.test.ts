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
import {
  openHelpDeskChat,
  retryErrorMessageHelpDeskChat,
  sendMessageToHelDeskChatWithButton,
  writeMessageHelpDeskChat,
} from 'pages/home/__tests__/helpers'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

beforeEach(() => {
  activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
})

it('should show an error message and the retry button on failed messages', async () => {
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

  const errorText = await within(messages).findByText('Not sent')
  const errorMessage = errorText.closest('li') as HTMLLIElement

  expect(within(errorMessage).getByText('Necesito ayuda')).toBeInTheDocument()
  expect(errorMessage).toHaveClass('chat-messages__message--user-with-error')
  expect(
    within(errorMessage).getByRole('button', { name: 'Try sending again' }),
  ).toBeInTheDocument()
  expect(errorText).toBeInTheDocument()
})

it('should retry a failed message and send it successfully on the second try', async () => {
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

  const errorMessage = await within(messages).findByText('Not sent')
  retryErrorMessageHelpDeskChat()

  await waitForElementToBeRemoved(errorMessage)

  const retriedMessage = within(messages).getByText('Necesito ayuda')
  const retriedMessageContainer = retriedMessage.closest('li') as HTMLLIElement

  expect(retriedMessageContainer).not.toHaveClass(
    'chat-messages__message--user-with-error',
  )
  expect(
    within(retriedMessageContainer).queryByRole('button', {
      name: 'Try sending again',
    }),
  ).not.toBeInTheDocument()
  expect(
    within(retriedMessageContainer).queryByText('Not sent'),
  ).not.toBeInTheDocument()
  expect(within(messages).queryAllByText('Necesito ayuda')).toHaveLength(1)
})

it('should prevent multiple retries until the ongoing retry finishes', async () => {
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
  retryErrorMessageHelpDeskChat()
  expect(
    screen.getByRole('button', { name: 'Try sending again' }),
  ).toBeDisabled()
})

it('should wait until the retry button is enabled again', async () => {
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
  retryErrorMessageHelpDeskChat()

  await waitFor(() => {
    expect(
      screen.getByRole('button', { name: 'Try sending again' }),
    ).toBeEnabled()
  })
})
