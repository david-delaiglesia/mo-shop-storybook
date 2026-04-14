import { screen, waitFor, within } from '@testing-library/react'

import { openHelpDeskChat, rateOrder } from '../helpers'
import { NetworkResponses, configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import {
  homeWithDelayedWidget,
  homeWithDeliveredWidget,
  homeWithGrid,
  homeWithUserUnreachableWidget,
} from 'app/catalog/__scenarios__/home'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import {
  serviceRating,
  thankYouStep,
} from 'app/service-rating/__scenarios__/serviceRating'
import {
  openChatFromHelp,
  openChatFromLogin,
  openChatFromOrderWidget,
  openChatFromUserMenu,
} from 'pages/__tests__/helpers/chat'
import {
  openAccountDropdown,
  openLoggedAccountDropdown,
  openSignInModal,
} from 'pages/helpers'
import { openACMOChat } from 'pages/service-rating/__tests__/helpers'
import { knownFeatureFlags } from 'services/feature-flags'
import { Support } from 'services/support'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Chat - Open direct access', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    localStorage.clear()
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  afterEach(() => {
    expect(Support.openWidget).not.toHaveBeenCalled()
  })

  it('should open the chat with the header access to anom user', async () => {
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
    openAccountDropdown()
    openChatFromUserMenu()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
  })

  it('should open the chat with the header access to logged user', async () => {
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
    openLoggedAccountDropdown()
    openChatFromUserMenu()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
  })

  it('should open the chat from the login modal access to anom user', async () => {
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
    openAccountDropdown()
    openSignInModal()
    openChatFromLogin()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
  })

  it('should open the chat from the login in create checkout to anom user', async () => {
    const responses: NetworkResponses = [
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          anonymous_id: '10000000-1000-4000-8000-100000000000',
        },
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/checkout').withNetwork(responses).mount()

    await screen.findByRole('heading', { name: 'Checkout', level: 1 })

    openChatFromHelp()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
  })

  it('should open the chat from the password recovery page', async () => {
    const responses: NetworkResponses = [
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          anonymous_id: '10000000-1000-4000-8000-100000000000',
        },
        responseBody: ChatSetupMother.default(),
      },
    ]
    wrap(App).atPath('/password-recovery/12345').withNetwork(responses).mount()

    await screen.findAllByText('Reset password')

    openChatFromHelp()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
  })

  it('should open the chat when open the help path', async () => {
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
    wrap(App).atPath('/help').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
  })

  it('should open the chat from order delayed widget', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithDelayedWidget },
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

    await screen.findByText('Próxima entrega')
    openChatFromOrderWidget(
      'Order 1008, Incident with the deliveryThere has been a problem',
    )
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
  })

  it('should open the chat from order user unreachable widget', async () => {
    const responses: NetworkResponses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithUserUnreachableWidget,
      },
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

    await screen.findByText('Próxima entrega')
    openChatFromOrderWidget(
      'Order 1007, Incident with the deliveryWe have tried to deliver your order',
    )
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
  })

  it('should open a chat with the message from the service rating from logged user', async () => {
    const token = '12345'
    const responses: NetworkResponses = [
      {
        path: `/service-rating/${token}/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/${token}/steps/1/`,
        responseBody: thankYouStep,
      },
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
          events: [
            {
              message:
                'Id pedido: 50331 \n\n Entrega impuntual > Tarde \n\n Ha llegado tarde',
            },
          ],
        },
        responseBody: ChatSetupMother.withUserMessage(
          'Id pedido: 50331 \n\n Entrega impuntual > Tarde \n\n Ha llegado tarde',
        ),
      },
    ]
    wrap(App)
      .atPath(`/service-rating/${token}`)
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Gracias por tu opinión')
    openACMOChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
    expect(
      within(messages).getByText(
        'Id pedido: 50331 Entrega impuntual > Tarde Ha llegado tarde',
      ),
    ).toBeInTheDocument()
  })

  it('should open a chat with the message from the service rating from anom user', async () => {
    const token = '12345'
    const responses: NetworkResponses = [
      {
        path: `/service-rating/${token}/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/${token}/steps/1/`,
        responseBody: thankYouStep,
      },
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          anonymous_id: '10000000-1000-4000-8000-100000000000',
          events: [
            {
              message:
                'Id pedido: 50331 \n\n Entrega impuntual > Tarde \n\n Ha llegado tarde',
            },
          ],
        },
        responseBody: ChatSetupMother.withUserMessage(
          'Id pedido: 50331 \n\n Entrega impuntual > Tarde \n\n Ha llegado tarde',
        ),
      },
    ]
    wrap(App).atPath(`/service-rating/${token}`).withNetwork(responses).mount()

    await screen.findByText('Gracias por tu opinión')
    openACMOChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
    expect(
      within(messages).getByText(
        'Id pedido: 50331 Entrega impuntual > Tarde Ha llegado tarde',
      ),
    ).toBeInTheDocument()
  })

  it('should add message to opened chat from the service rating from logged user', async () => {
    const token = '12345'
    const responses: NetworkResponses = [
      {
        path: `/service-rating/${token}/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/${token}/steps/1/`,
        responseBody: thankYouStep,
      },
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredWidget,
      },
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
          message:
            'Id pedido: 50331 \n\n Entrega impuntual > Tarde \n\n Ha llegado tarde',
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')
    rateOrder()
    await screen.findByText('Gracias por tu opinión')
    openACMOChat()

    await waitFor(() => {
      expect(
        '/conversations/chats/chat-id/messages/10000000-1000-4000-8000-100000000000/',
      ).toHaveBeenFetchedWith({
        method: 'PUT',
        body: {
          message:
            'Id pedido: 50331 \n\n Entrega impuntual > Tarde \n\n Ha llegado tarde',
        },
      })
    })
    expect(
      within(messages).getByText('Hola! ¿cómo podemos ayudarte?'),
    ).toBeInTheDocument()
    expect(
      within(messages).getByText(
        'Id pedido: 50331 Entrega impuntual > Tarde Ha llegado tarde',
      ),
    ).toBeInTheDocument()
  })

  it('should do NOT send the setup again if the chat is already opened and user click on Ayuda in the user menu', async () => {
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
    await screen.findByLabelText('Customer service')

    openLoggedAccountDropdown()
    openChatFromUserMenu()
    const loader = screen.queryByLabelText('loader')

    expect(loader).not.toBeInTheDocument()
    expect('/conversations/chats/setup/').toHaveBeenFetchedTimes(1)
  })
})
