import { createContext } from 'react'

import { ChatStatusType } from '../interfaces'
import type { ChatEvent, ChatSetup, UserChatEvent } from '../interfaces'
import type { ChatHelpSources } from '../metrics'

export interface ChatContextValue {
  isChatOpen: boolean
  chatStatus: ChatStatusType
  events: ChatEvent[]
  channelSetup: Omit<ChatSetup, 'events'> | null
  unreadMessagesCount: number
  isSendingMessage: boolean
  isAgentTyping: boolean
  isSoundActive?: boolean

  openChat: () => void
  open: (source: ChatHelpSources, message?: string) => void
  minimizeChat: () => void
  sendMessage: (message: string) => void
  sendTextMessageEvent: (event: UserChatEvent) => void
  onSendFile: (file: File) => void
  finishChat: () => void
  startNewChat: (message?: string) => void
  setEventsReadByUser: () => void
  toggleSound?: () => void
}

export const fallbackChatContextState: ChatContextValue = {
  isChatOpen: false,
  chatStatus: ChatStatusType.IDLE,
  events: [],
  channelSetup: null,
  unreadMessagesCount: 0,
  isSendingMessage: false,
  isAgentTyping: false,
  isSoundActive: false,
  openChat: () => {},
  open: () => {},
  minimizeChat: () => {},
  sendMessage: () => {},
  sendTextMessageEvent: () => {},
  onSendFile: () => {},
  finishChat: () => {},
  startNewChat: () => {},
  setEventsReadByUser: () => {},
  toggleSound: () => {},
}

export const ChatContext = createContext<ChatContextValue | null>(null)
