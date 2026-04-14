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
  dragFileOverChat,
  dropFilesInChat,
  generateFile,
  openHelpDeskChat,
} from 'pages/home/__tests__/helpers'
import { emitMessageHelDeskChat } from 'services/chat-socket/__tests__/ChatSocket.mock'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

const generateNotAllowedFileFormatFile = ({ name }: { name: string }) => {
  const sizeInBytes = 1048576
  const file = new File(['(⌐□_□)'], `${name}.webp`, {
    type: 'image/webp',
  })
  Object.defineProperty(file, 'size', { value: sizeInBytes })
  return file
}

describe('Home - Chat - Files messages', () => {
  const jpgFile = generateFile({ name: 'tornillo', extension: 'jpg' })
  const mockFileClient = vi
    .spyOn(ChatClient, 'sendFile')
    .mockResolvedValue(ChatEventMother.userImageMessage())

  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should can only select a jpg, jpeg or png image to send to the support agent', async () => {
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

    expect(
      within(helpDeskChat).getByRole('contentinfo', {
        name: 'Send messages and files',
      }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Attach images or files')).toHaveAttribute(
      'accept',
      '.jpg,.jpeg,.png,.pdf',
    )
  })

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

    expect(mockFileClient).toHaveBeenCalledWith({
      auth: {
        token: 'fake-token',
        type: 'Bearer',
      },
      event: {
        id: '10000000-1000-4000-8000-100000000000',
        payload: {
          content: {
            file: jpgFile,
            type: 'uploading-file',
          },
        },
        type: 'conversation:user_message',
      },
      id: 'chat-id',
    })
  })

  it('should can see the started value of proccess when is uploading', async () => {
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

    expect(within(messages).getByText('977KB')).toBeInTheDocument()
    expect(within(messages).getByText('tornillo.jpg')).toBeInTheDocument()
    expect(
      within(messages).getByLabelText('file upload progress'),
    ).toHaveTextContent('0%')
    expect(within(messages).getByRole('progressbar')).toHaveAttribute(
      'aria-valuemin',
      '0',
    )
    expect(within(messages).getByRole('progressbar')).toHaveAttribute(
      'aria-valuemax',
      '100',
    )
    expect(within(messages).getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    )
  })

  it('should can see the see the value of proccess updated when is uploading', async () => {
    vi.useFakeTimers()
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
    vi.advanceTimersByTime(500)

    expect(within(messages).getByText('977KB')).toBeInTheDocument()
    expect(within(messages).getByText('tornillo.jpg')).toBeInTheDocument()
    expect(
      within(messages).getByLabelText('file upload progress'),
    ).toHaveTextContent('50%')
    expect(within(messages).getByRole('progressbar')).toHaveAttribute(
      'aria-valuemax',
      '100',
    )
    expect(within(messages).getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '50',
    )
    vi.useRealTimers()
  })

  it('should can see the see the max value of upload proccess updated', async () => {
    vi.useFakeTimers()
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
    vi.advanceTimersByTime(1500)

    expect(within(messages).getByText('977KB')).toBeInTheDocument()
    expect(within(messages).getByText('tornillo.jpg')).toBeInTheDocument()
    expect(
      within(messages).getByLabelText('file upload progress'),
    ).toHaveTextContent('100%')
    expect(within(messages).getByRole('progressbar')).toHaveAttribute(
      'aria-valuemax',
      '100',
    )
    expect(within(messages).getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    )
    vi.useRealTimers()
  })

  it('should can see the sended image when receive the confirmation', async () => {
    const jpgFile = generateFile({ name: 'tornillo', extension: 'jpg' })
    const expectedFormData = new FormData()
    expectedFormData.append('file', jpgFile)

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
    const chatImage = await within(messages).findByAltText(
      'image sent to the chat',
    )

    expect(chatImage).toHaveAttribute(
      'src',
      'https://mercadona.zendesk.com/sc/attachments/v2/1234/tornillo.jpg',
    )
    expect(within(messages).queryByText('1024KB')).not.toBeInTheDocument()
    expect(within(messages).queryByText('tornillo.jpg')).not.toBeInTheDocument()
    expect(within(messages).queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('should can see the sended file when receive the confirmation', async () => {
    const pdfFile = generateFile({ name: 'document', extension: 'pdf' })
    const expectedFormData = new FormData()
    expectedFormData.append('file', pdfFile)
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
    sendFileToHelDeskChat(jpgFile)
    const chatFile = await within(messages).findByRole('link', {
      name: 'Open document',
    })

    expect(chatFile).toHaveAttribute(
      'href',
      'https://mercadona.zendesk.com/sc/attachments/v2/1234/document.pdf',
    )
    expect(chatFile).toHaveAttribute('target', '_blank')
    expect(chatFile).toHaveAttribute('rel', 'noopener noreferrer')
    expect(
      within(messages).getByLabelText(
        'document document.pdf sent successfully',
      ),
    )
    expect(within(messages).queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('should see the received image from the agent', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: ChatSetupMother.withMultipleMessages(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')
    const receivedImageFromAgent = await within(messages).findByAltText(
      'image received in the chat',
    )

    expect(receivedImageFromAgent).toHaveAttribute(
      'src',
      'https://mercadona.zendesk.com/sc/attachments/v2/1234/agent_image.jpg',
    )
  })

  it('should render only one bubble when the agent sends an image and conversation is received in the setup', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: ChatSetupMother.withAgentImageMessage(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')
    const bubbles = within(messages).getAllByRole('listitem')
    const receivedImageFromAgent = await within(messages).findByAltText(
      'image received in the chat',
    )

    expect(receivedImageFromAgent).toBeInTheDocument()
    expect(bubbles).toHaveLength(1)
  })

  it('should render only one bubble when the agent sends an image', async () => {
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
    emitMessageHelDeskChat(ChatEventMother.agentImageMessage())
    const receivedImageFromAgent = await within(messages).findByAltText(
      'image received in the chat',
    )
    const bubbles = within(messages).getAllByRole('listitem')

    expect(receivedImageFromAgent).toBeInTheDocument()
    expect(bubbles).toHaveLength(1)
  })

  it('should see the received file from the agent', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/conversations/chats/setup/',
        method: 'post',
        requestBody: {
          user_id: '1',
        },
        responseBody: ChatSetupMother.withMultipleMessages(),
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openHelpDeskChat()
    const helpDeskChat = await screen.findByLabelText('Customer service')
    const messages = await within(helpDeskChat).findByRole('log')
    const fileLink = await within(messages).findByText('Open document')

    expect(
      within(fileLink.closest('li') as HTMLLIElement).getByText(
        'agent_file.pdf',
      ),
    ).toBeInTheDocument()
    expect(fileLink).toHaveAttribute(
      'href',
      'https://mercadona.zendesk.com/sc/attachments/v2/1234/agent_file.pdf',
    )
  })
})

describe('Render file upload Error', () => {
  const jpgFile = generateFile({ name: 'tornillo', extension: 'jpg' })
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should show a file format error', async () => {
    const webpFile = generateNotAllowedFileFormatFile({ name: 'tornillo' })
    vi.spyOn(ChatClient, 'sendFile').mockRejectedValue(
      new Error(
        JSON.stringify(ChatEventMother.userImageFileFormatErrorMessage()),
      ),
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
    sendFileToHelDeskChat(webpFile)

    expect(within(messages).getByText('tornillo.webp')).toBeInTheDocument()
    expect(
      await within(messages).findByText(
        'Incompatible file. Use PNG, JPG, or JPEG.',
      ),
    ).toBeInTheDocument()
  })

  it('should show a file size limit error', async () => {
    vi.spyOn(ChatClient, 'sendFile').mockRejectedValue(
      new Error(JSON.stringify(ChatEventMother.userFileSizeErrorMessage())),
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
    sendFileToHelDeskChat(jpgFile)

    expect(within(messages).getByText('tornillo.jpg')).toBeInTheDocument()
    expect(
      await within(messages).findByText(
        'It exceeds the permitted limit (50MB)',
      ),
    ).toBeInTheDocument()
  })

  it('should show a generic error', async () => {
    vi.spyOn(ChatClient, 'sendFile').mockRejectedValue(
      new Error(JSON.stringify(ChatEventMother.userUnknownErrorMessage())),
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
    sendFileToHelDeskChat(jpgFile)

    expect(within(messages).getByText('tornillo.jpg')).toBeInTheDocument()
    expect(
      await within(messages).findByText('Failed to upload. Please try again.'),
    ).toBeInTheDocument()
  })

  it('should reset the form after submitting', async () => {
    const pdfFile = generateFile({ name: 'document', extension: 'pdf' })

    const sendFileSpy = vi.spyOn(ChatClient, 'sendFile')
    const formResetSpy = vi.spyOn(HTMLFormElement.prototype, 'reset')

    sendFileSpy.mockResolvedValueOnce(
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

    sendFileToHelDeskChat(pdfFile)
    await within(messages).findByText('document.pdf')

    expect(formResetSpy).toHaveBeenCalled()
  })
})

describe('Drag and drop files', () => {
  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.NEW_SUPPORT_CHAT])
  })

  it('should show instructions while dragging over the droppable zone', async () => {
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

    dragFileOverChat(within(messages).getByRole('list'), pdfFile)

    const dropZone = within(helpDeskChat).getByRole('region', {
      name: 'Release to send',
    })
    expect(within(dropZone).getByRole('presentation')).toBeInTheDocument()
    expect(
      within(dropZone).getByRole('heading', {
        name: 'Release to send',
        level: 2,
      }),
    ).toBeInTheDocument()
    expect(
      within(dropZone).getByText('Supported files: PNG, JPEG, JPG and PDF'),
    ).toBeInTheDocument()
  })

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

    const chatFile = await within(messages).findByRole('link', {
      name: 'Open document',
    })

    expect(chatFile).toHaveAttribute(
      'href',
      'https://mercadona.zendesk.com/sc/attachments/v2/1234/document.pdf',
    )
    expect(chatFile).toHaveAttribute('target', '_blank')
    expect(chatFile).toHaveAttribute('rel', 'noopener noreferrer')
    expect(
      within(messages).getByLabelText(
        'document document.pdf sent successfully',
      ),
    ).toBeInTheDocument()
    expect(within(messages).queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('should upload only one file when dropping it directly into the chat', async () => {
    const pdfFile = generateFile({ name: 'document', extension: 'pdf' })
    const pdfFile2 = generateFile({ name: 'document2', extension: 'pdf' })

    const sendFileSpy = vi
      .spyOn(ChatClient, 'sendFile')
      .mockResolvedValue(ChatEventMother.userFileMessage('document.pdf'))

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

    dropFilesInChat(within(messages).getByRole('list'), [pdfFile, pdfFile2])

    await within(messages).findByLabelText(
      'document document.pdf sent successfully',
    )
    expect(sendFileSpy).toHaveBeenCalledTimes(1)
  })

  it('should show a file format error when dropping a wrong file type file', async () => {
    const webpFile = generateNotAllowedFileFormatFile({ name: 'tornillo' })
    vi.spyOn(ChatClient, 'sendFile').mockRejectedValue(
      new Error(
        JSON.stringify(ChatEventMother.userImageFileFormatErrorMessage()),
      ),
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
    dropFilesInChat(within(messages).getByRole('list'), webpFile)

    expect(within(messages).getByText('tornillo.webp')).toBeInTheDocument()
    expect(
      await within(messages).findByText(
        'Incompatible file. Use PNG, JPG, or JPEG.',
      ),
    ).toBeInTheDocument()
  })
})
