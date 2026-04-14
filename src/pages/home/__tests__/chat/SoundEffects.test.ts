import { screen, waitFor, within } from '@testing-library/react'

import { vi } from 'vitest'
import { NetworkResponses, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatSetupMother } from 'app/chat/__scenarios__/ChatSetupMother'
import {
  minimizeHelpDeskChatWithFloatingButton,
  openContextualOptions,
  openHelpDeskChat,
  openHelpDeskChatWithPendingMessages,
  toggleHelpDeskChatSoundEffects,
} from 'pages/home/__tests__/helpers'
import { emitMessageHelDeskChat } from 'services/chat-socket/__tests__/ChatSocket.mock'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

activeFeatureFlags([
  knownFeatureFlags.NEW_SUPPORT_CHAT,
  knownFeatureFlags.WEB_NEW_SUPPORT_CHAT_TOGGLE_SOUND,
])

let visibilitySpy: ReturnType<typeof vi.spyOn>
let focusSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  visibilitySpy = vi
    .spyOn(document, 'visibilityState', 'get')
    .mockReturnValue('visible')
  focusSpy = vi.spyOn(document, 'hasFocus').mockReturnValue(true)
})

afterEach(() => {
  visibilitySpy.mockRestore()
  focusSpy.mockRestore()
})

describe('When sessionStorage is still not configured', () => {
  it('should have chat-sound-effects-active at sessionStorage true by default', async () => {
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

    openContextualOptions()
    const contextualMenu = within(helpDeskChat).getByRole('menu')

    expect(
      await within(contextualMenu).findByRole('menuitem', {
        name: 'Mute sound',
      }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(sessionStorage.getItem('chat-sound-effects-active')).toBe('true')
    })
  })

  it('should toggle sound store preference in sessionStorage', async () => {
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
    openContextualOptions()

    const contextualMenu = await within(helpDeskChat).findByRole('menu')

    toggleHelpDeskChatSoundEffects()

    expect(
      await within(contextualMenu).findByRole('menuitem', {
        name: 'Unmute sound',
      }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(sessionStorage.getItem('chat-sound-effects-active')).toBe('false')
    })
  })
})

describe('When sessionStorage is already configured', () => {
  it('should not change chat-sound-effects-active at sessionStorage since it`s already set up', async () => {
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
    sessionStorage.setItem('chat-sound-effects-active', 'false')
    openHelpDeskChat()

    const helpDeskChat = await screen.findByLabelText('Customer service')
    await within(helpDeskChat).findByRole('log')
    openContextualOptions()

    const contextualMenu = within(helpDeskChat).getByRole('menu')

    expect(
      await within(contextualMenu).findByRole('menuitem', {
        name: 'Unmute sound',
      }),
    ).toBeInTheDocument()
  })
})

describe('When chat is minimized', () => {
  let playSpy: ReturnType<typeof vi.spyOn>
  let pauseSpy: ReturnType<typeof vi.spyOn>
  let loadSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
    pauseSpy = vi
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {})
    loadSpy = vi
      .spyOn(HTMLMediaElement.prototype, 'load')
      .mockImplementation(() => {})
  })

  afterEach(() => {
    playSpy.mockRestore()
    pauseSpy.mockRestore()
    loadSpy.mockRestore()
  })

  it('should reproduce a sound upon agent message received if the chat is minimized', async () => {
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
    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('Necesitamos más información'),
    )
    minimizeHelpDeskChatWithFloatingButton()
    emitMessageHelDeskChat(ChatEventMother.agentTextMessage('Por favor'))
    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('proporcione más detalles'),
    )
    await screen.findByRole('button', {
      name: 'Open chat. You have 2 unread messages',
    })
    expect(loadSpy).toHaveBeenCalledTimes(2)
    expect(pauseSpy).toHaveBeenCalledTimes(2)
    expect(playSpy).toHaveBeenCalledTimes(2)
  })

  it('should not reproduce a sound upon agent message received if the chat is open again', async () => {
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
    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('Necesitamos más información'),
    )
    minimizeHelpDeskChatWithFloatingButton()
    emitMessageHelDeskChat(ChatEventMother.agentTextMessage('Por favor'))
    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('proporcione más detalles'),
    )
    await screen.findByRole('button', {
      name: 'Open chat. You have 2 unread messages',
    })
    openHelpDeskChatWithPendingMessages(2)
    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('esperamos su respuesta'),
    )

    expect(loadSpy).toHaveBeenCalledTimes(2)
    expect(pauseSpy).toHaveBeenCalledTimes(2)
    expect(playSpy).toHaveBeenCalledTimes(2)
  })

  it('should not reproduce a sound upon agent message received if session storage key is not true', async () => {
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

    openContextualOptions()
    const contextualMenu = await within(helpDeskChat).findByRole('menu')
    toggleHelpDeskChatSoundEffects()
    await within(contextualMenu).findByRole('menuitem', {
      name: 'Unmute sound',
    })

    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('Necesitamos más información'),
    )
    minimizeHelpDeskChatWithFloatingButton()
    emitMessageHelDeskChat(ChatEventMother.agentTextMessage('Por favor'))
    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('proporcione más detalles'),
    )

    await screen.findByRole('button', {
      name: 'Open chat. You have 2 unread messages',
    })

    expect(loadSpy).toHaveBeenCalledTimes(0)
    expect(pauseSpy).toHaveBeenCalledTimes(0)
    expect(playSpy).toHaveBeenCalledTimes(0)
  })
})

describe('When tab is not active', () => {
  let playSpy: ReturnType<typeof vi.spyOn>
  let pauseSpy: ReturnType<typeof vi.spyOn>
  let loadSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
    pauseSpy = vi
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {})
    loadSpy = vi
      .spyOn(HTMLMediaElement.prototype, 'load')
      .mockImplementation(() => {})
    visibilitySpy.mockReturnValue('hidden')
    focusSpy.mockReturnValue(false)
  })

  afterEach(() => {
    playSpy.mockRestore()
    pauseSpy.mockRestore()
    loadSpy.mockRestore()
  })

  it('should reproduce a sound upon agent message received even if chat is open', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: ChatSetupMother.empty(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()

    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')

    emitMessageHelDeskChat(
      ChatEventMother.agentTextMessage('Necesitamos más información'),
    )

    await within(messages).findByText('Necesitamos más información')

    expect(pauseSpy).toHaveBeenCalledTimes(1)
    expect(loadSpy).toHaveBeenCalledTimes(1)
    expect(playSpy).toHaveBeenCalledTimes(1)
  })
})
