import { Centrifuge } from 'centrifuge'

import { camelCaseToSnakeCase } from '@mercadona/mo.library.dashtil'

import { ChatEventMother } from 'app/chat/__scenarios__/ChatEventMother'
import { ChatSocket } from 'services/chat-socket'

vi.unmock('services/chat-socket')

let messageReceived: (message: { data: unknown }) => void = () => {}
const mockCentrifugeDisconnect = vi.fn()
const mockCentrifugeConnect = vi.fn()
const mockCentrifugeSubscribe = vi.fn()
const mockSubscriptionOn = vi.fn().mockImplementation((_, callback) => {
  messageReceived = callback
})
const mockCentrifugeUnsubscribe = vi.fn()

const mockInstance = {
  on: mockSubscriptionOn,
  subscribe: mockCentrifugeSubscribe,
  unsubscribe: mockCentrifugeUnsubscribe,
}

const mockCentrifugeNewSubscription = vi.fn().mockReturnValue(mockInstance)

vi.mock('centrifuge', async () => {
  const centrifuge =
    await vi.importActual<typeof import('centrifuge')>('centrifuge')

  return {
    ...centrifuge,
    Centrifuge: vi.fn().mockImplementation(() => ({
      connect: mockCentrifugeConnect,
      disconnect: mockCentrifugeDisconnect,
      newSubscription: mockCentrifugeNewSubscription,
    })),
  }
})

const dummyParameters = {
  id: 'chat-id',
  auth: { token: '123', type: 'Bearer' },
}

describe('ChatSocket', () => {
  it('should init with the right URL in centrifuge on instance ChatSocket', () => {
    new ChatSocket(dummyParameters)

    expect(Centrifuge).toHaveBeenCalledWith(
      'wss://shop-conversations-api-centrifugo-websockets.sta.monline/connection/websocket',
      { token: '123' },
    )
  })

  it('should call to centrifuge connect when connect', () => {
    const chatSocket = new ChatSocket(dummyParameters)
    chatSocket.connect()

    expect(mockCentrifugeConnect).toHaveBeenCalled()
    expect(mockCentrifugeSubscribe).toHaveBeenCalled()
    expect(mockCentrifugeNewSubscription).toHaveBeenCalledWith(
      dummyParameters.id,
    )
  })

  it('should call to centrifuge disconnect and unsubscribe when disconnect', () => {
    const chatSocket = new ChatSocket(dummyParameters)
    chatSocket.connect()
    chatSocket.disconnect()

    expect(mockCentrifugeDisconnect).toHaveBeenCalled()
    expect(mockCentrifugeUnsubscribe).toHaveBeenCalled()
  })

  it('should can set callback on centrifuge channel', () => {
    const dummyCallback = vi.fn()

    const chatSocket = new ChatSocket(dummyParameters)
    chatSocket.connect()
    chatSocket.onEventReceived(dummyCallback)

    expect(mockSubscriptionOn).toHaveBeenCalledWith(
      'publication',
      expect.any(Function),
    )
  })

  it('should can call to the callback on receive message from centrifuge channel', () => {
    const dummyCallback = vi.fn()
    const dummyMessage = ChatEventMother.agentTextMessage('Hola')

    const chatSocket = new ChatSocket(dummyParameters)
    chatSocket.connect()
    chatSocket.onEventReceived(dummyCallback)
    messageReceived({
      data: camelCaseToSnakeCase(dummyMessage),
    })

    expect(dummyCallback).toHaveBeenCalledWith(dummyMessage)
  })
})
