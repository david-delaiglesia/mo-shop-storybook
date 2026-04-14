import { Centrifuge, PublicationContext, Subscription } from 'centrifuge'

import { snakeCaseToCamelCase } from '@mercadona/mo.library.dashtil'

import { ChatEvent, ChatEventResponse, ChatSetup } from 'app/chat'

export class ChatSocket {
  private instance: Centrifuge
  private subscription: Subscription | null = null
  private parameters: Omit<ChatSetup, 'events' | 'type'>

  public constructor(parameters: Omit<ChatSetup, 'events' | 'type'>) {
    const WS_CHAT_HOST = import.meta.env.VITE_WS_CHAT_HOST
    this.parameters = parameters
    this.instance = new Centrifuge(WS_CHAT_HOST, {
      token: this.parameters.auth.token,
    })
  }

  public connect(): void {
    this.instance.connect()
    this.subscription = this.instance.newSubscription(this.parameters.id)
    this.subscription?.subscribe()
  }

  public disconnect(): void {
    this.instance.disconnect()
    this.subscription?.unsubscribe()
    this.subscription = null
  }

  public onEventReceived(callback: (event: ChatEvent) => void): void {
    this.subscription?.on('publication', (ctx: PublicationContext) => {
      const event = ctx.data as ChatEventResponse

      callback(snakeCaseToCamelCase(event))
    })
  }
}
