import { useCallback, useEffect, useRef, useState } from 'react'

import { ChatEvent } from 'app/chat/interfaces'

const BOTTOM_PIXELS_THRESHOLD = 50
const AGENT_TYPING_END_DELAY = 300

export const useChatAutoScroll = (
  events: ChatEvent[],
  isAgentTyping: boolean,
) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)
  const [isAgentTypingVisible, setIsAgentTypingVisible] =
    useState(isAgentTyping)
  const typingDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [])

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isCloseToBottom =
      scrollHeight - scrollTop - clientHeight < BOTTOM_PIXELS_THRESHOLD

    isAtBottomRef.current = isCloseToBottom
  }, [])

  useEffect(() => {
    if (isAgentTyping) {
      setIsAgentTypingVisible(true)
      return
    }

    typingDelayTimeoutRef.current = setTimeout(() => {
      setIsAgentTypingVisible(false)
      typingDelayTimeoutRef.current = null
    }, AGENT_TYPING_END_DELAY)

    return () => {
      if (typingDelayTimeoutRef.current) {
        clearTimeout(typingDelayTimeoutRef.current)
      }
    }
  }, [isAgentTyping])

  useEffect(() => {
    if (!typingDelayTimeoutRef.current) return

    clearTimeout(typingDelayTimeoutRef.current)
    typingDelayTimeoutRef.current = null
    setIsAgentTypingVisible(false)
  }, [events])

  useEffect(() => {
    if (!isAtBottomRef.current) return

    scrollToBottom()
  }, [events, isAgentTypingVisible, scrollToBottom])

  return {
    scrollContainerRef,
    handleScroll,
    isAgentTypingVisible,
  }
}
