import { ChatEvent } from 'app/chat'

let onEventReceivedCallback: ((event: ChatEvent) => void) | null = null
export const disconnectSocketMock = vi.fn()

export const emitMessageHelDeskChat = (event: ChatEvent) => {
  if (!onEventReceivedCallback) return
  onEventReceivedCallback(event)
}

export const createChatSocketMock = () => ({
  ChatSocket: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    onEventReceived: vi.fn((callback: (event: ChatEvent) => void) => {
      onEventReceivedCallback = callback
    }),
    disconnect: disconnectSocketMock,
  })),
})
