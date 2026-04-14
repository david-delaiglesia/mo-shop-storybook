import { useContext } from 'react'

import {
  ChatContext,
  ChatContextValue,
  fallbackChatContextState,
} from './ChatContext'

export const useChatContext = (): ChatContextValue => {
  const context = useContext(ChatContext)

  if (!context) {
    return fallbackChatContextState
  }

  return context
}
