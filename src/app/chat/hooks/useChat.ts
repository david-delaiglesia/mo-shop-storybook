import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { useUserUUID } from 'app/authentication'
import { ChatClient } from 'app/chat/client'
import { ANONYMOUS_USER_ID_KEY } from 'app/chat/constants'
import { ChatEvent as ChatEventDomain } from 'app/chat/domain/chat-event'
import { ChatStatus as ChatStatusDomain } from 'app/chat/domain/chat-status'
import { useChatSoundEffects } from 'app/chat/hooks/useChatSoundEffects'
import { useChatSoundPlayer } from 'app/chat/hooks/useChatSoundPlayer'
import { useSortedChatEvents } from 'app/chat/hooks/useSortedChatEvents'
import {
  AgentChatEvent,
  ChatEvent,
  ChatEventsContentType,
  ChatEventsType,
  ChatSetup,
  ChatStatusType,
  FileUploadingError,
  UserChatEvent,
  UserMessageTextChatEvent,
  UserUploadingFileChatEvent,
  UserUploadingFileErrorChatEvent,
} from 'app/chat/interfaces'
import type { ChatHelpSources } from 'app/chat/metrics'
import { ChatMetrics } from 'app/chat/metrics'
import { ChatSocket } from 'services/chat-socket'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'

const createOptimisticUserMessageEvent = (
  message: string,
): UserMessageTextChatEvent => {
  return {
    id: crypto.randomUUID(),
    type: ChatEventsType.CONVERSATION_USER_MESSAGE,
    payload: {
      content: {
        type: ChatEventsContentType.TEXT,
        text: message,
      },
    },
    receivedAt: new Date().toISOString(),
  }
}

const createUploadingFileEvent = (file: File): UserUploadingFileChatEvent => {
  return {
    id: crypto.randomUUID(),
    type: ChatEventsType.CONVERSATION_USER_MESSAGE,
    payload: {
      content: {
        type: ChatEventsContentType.UPLOADING_FILE,
        file,
      },
    },
  }
}

const createUploadingFileErrorEvent = (
  fileName: string,
  error: FileUploadingError,
  t: (key: string, options?: Record<string, unknown>) => string,
  language: string,
): UserUploadingFileErrorChatEvent => {
  let errorMessage = t('chat.message.upload.error.generic')

  if (error.code === 'file_size_exceeded') {
    errorMessage = t('chat.message.upload.error.file_size_exceeded', {
      limit: error.extra.limit,
    })
  }

  if (error.code === 'invalid_file_type') {
    const formatter = new Intl.ListFormat(language || 'es', {
      style: 'long',
      type: 'disjunction',
    })
    const allowedExtensions = error.extra.allowed_extensions.map((extension) =>
      extension.toUpperCase(),
    )
    const formattedAllowedExtensions = formatter.format(allowedExtensions)
    errorMessage = t('chat.message.upload.error.invalid_file_type', {
      allowed_extensions: formattedAllowedExtensions,
    })
  }

  return {
    id: crypto.randomUUID(),
    type: ChatEventsType.CONVERSATION_USER_MESSAGE,
    payload: {
      content: {
        type: ChatEventsContentType.UPLOADING_FILE_ERROR,
        fileName,
        errorMessage,
      },
    },
  }
}

const useChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [channelSetup, setChannelSetup] = useState<Omit<
    ChatSetup,
    'events'
  > | null>(null)
  const [chatStatus, setChatStatus] = useState<ChatStatusType>(
    ChatStatusType.IDLE,
  )
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isAgentTyping, setIsAgentTyping] = useState(false)
  const socketRef = useRef<ChatSocket | null>(null)
  const isChatOpenRef = useRef(isChatOpen)
  const chatOpenedAtRef = useRef<number | null>(null)
  const userId = useUserUUID()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const isWebNewSupportChatToggleSoundFlagActive = useFlag(
    knownFeatureFlags.WEB_NEW_SUPPORT_CHAT_TOGGLE_SOUND,
  )
  const [events, setEvents] = useSortedChatEvents()
  const { isSoundActive, toggleSound, setSoundDefaults } = useChatSoundEffects()
  useChatSoundPlayer({ events, chatStatus, isChatOpen, isSoundActive })

  const unreadMessagesCount = useMemo(() => {
    return events.filter((event) => {
      return (
        ChatEventDomain.isMessageFromAgent(event) && !event.payload?.readByUser
      )
    }).length
  }, [events])

  useEffect(() => {
    isChatOpenRef.current = isChatOpen
  }, [isChatOpen])

  const openChat = () => {
    setIsChatOpen(true)

    if (ChatStatusDomain.canStart(chatStatus)) {
      chatOpenedAtRef.current = Date.now()
      startNewChat()
    }

    setEventsReadByUser()
  }

  const minimizeChat = () => {
    setIsChatOpen(false)
  }

  const openRemote = (source: ChatHelpSources, message?: string) => {
    setIsChatOpen(true)

    ChatMetrics.chatHelpClick(source, location.pathname)

    if (ChatStatusDomain.isStarted(chatStatus) && message) {
      sendMessage(message)
      return
    }

    if (ChatStatusDomain.isStarted(chatStatus)) return

    chatOpenedAtRef.current = Date.now()
    startNewChat(message)
  }

  const sendNewChatFromFinishedConversationMetric = () => {
    if (chatStatus === ChatStatusType.FINISHED) {
      ChatMetrics.chatOpenNewConversation()
    }
  }

  const startNewChat = (message?: string) => {
    sendNewChatFromFinishedConversationMetric()
    if (userId) {
      setupChat(userId, message)
      return
    }
    anonymousSetup(message)
  }

  const setupChat = async (userId: string, message?: string) => {
    try {
      setChatStatus(ChatStatusType.LOADING)
      const setup = await ChatClient.setup({ userId, message })
      onSetup(setup)
    } catch {
      setChatStatus(ChatStatusType.FAILED)
    }
  }

  const anonymousSetup = async (message?: string) => {
    try {
      setChatStatus(ChatStatusType.LOADING)
      const anonymousId =
        localStorage.getItem(ANONYMOUS_USER_ID_KEY) ?? crypto.randomUUID()
      const setup = await ChatClient.anonymousSetup({ anonymousId, message })
      onSetup(setup)
      localStorage.setItem(ANONYMOUS_USER_ID_KEY, anonymousId)
    } catch {
      setChatStatus(ChatStatusType.FAILED)
    }
  }

  const onSetup = ({ events, id, auth, type }: ChatSetup) => {
    const eventsFromSetupMarkedAsReadByUser = events.map(getDecoratedEvent)
    setEvents(eventsFromSetupMarkedAsReadByUser)
    setChannelSetup({ id, auth, type })
    setupSocket({ id, auth })
    setChatStatus(ChatStatusType.STARTED)
    if (!isWebNewSupportChatToggleSoundFlagActive) return
    setSoundDefaults()
  }

  const setupSocket = ({ id, auth }: Omit<ChatSetup, 'events' | 'type'>) => {
    socketRef.current = new ChatSocket({ id, auth })
    socketRef.current.connect()
    socketRef.current.onEventReceived((event) => {
      if (ChatEventDomain.isAgentAssigned(event) && chatOpenedAtRef.current) {
        const timeSinceChatOpened = Date.now() - chatOpenedAtRef.current
        ChatMetrics.chatAssignedToAgent(
          id,
          event.payload.displayName,
          timeSinceChatOpened,
        )
      }

      if (ChatEventDomain.isAgentTypingStart(event)) {
        setIsAgentTyping(true)
        return
      }

      if (ChatEventDomain.isAgentTypingEnd(event)) {
        setIsAgentTyping(false)
        return
      }

      if (ChatEventDomain.isMessageFromAgent(event)) {
        setIsAgentTyping(false)
      }

      setEvents((prevEvents) => {
        if (ChatEventDomain.couldBeAnUpdate(event)) {
          return updateEvent(prevEvents, event)
        }

        if (ChatEventDomain.isConversationUpdated(event)) {
          setChannelSetup((prevChannelSetup) => {
            if (!prevChannelSetup) return null

            return {
              ...prevChannelSetup,
              type: event.payload.type,
            }
          })

          return prevEvents
        }

        return setNewEvent(prevEvents, getDecoratedEvent(event))
      })
    })
  }
  const updateEvent = (prevEvents: ChatEvent[], event: ChatEvent) => {
    if (ChatEventDomain.shouldDiscardEvent(event, prevEvents))
      return [...prevEvents]

    const eventToUpdatePosition = prevEvents.findIndex((event) =>
      ChatEventDomain.isUpdatable(event),
    )

    if (eventToUpdatePosition === -1) {
      return setNewEvent(prevEvents, event)
    }

    const newEvents = [...prevEvents]
    newEvents[eventToUpdatePosition] = event
    return newEvents
  }

  const setNewEvent = (prevEvents: ChatEvent[], event: ChatEvent) => {
    if (ChatEventDomain.isConversationReleased(event)) {
      socketRef.current?.disconnect()
      setChatStatus(ChatStatusType.FINISHED)
    }

    const isDuplicate = prevEvents.some(
      (prevEvent) => prevEvent.id === event.id,
    )
    if (isDuplicate) {
      return prevEvents
    }

    return [...prevEvents, event]
  }

  const sendMessage = (message: string) => {
    if (!channelSetup) return

    const userMessageEvent: UserMessageTextChatEvent =
      createOptimisticUserMessageEvent(message)

    setEvents((prevEvents) => [...prevEvents, userMessageEvent])

    void sendTextMessageEvent(userMessageEvent)
  }

  const sendTextMessageEvent = async (currentEvent: UserChatEvent) => {
    if (!channelSetup) return
    const { id, auth } = channelSetup

    try {
      setIsSendingMessage(true)
      await ChatClient.sendMessage({ id, event: currentEvent, auth })

      setEvents((prevEvents) =>
        updateMessageContentType(
          prevEvents,
          currentEvent.id,
          ChatEventsContentType.TEXT,
        ),
      )
    } catch {
      ChatMetrics.chatTextMessageSentError(id)
      setEvents((prevEvents) =>
        updateMessageContentType(
          prevEvents,
          currentEvent.id,
          ChatEventsContentType.TEXT_ERROR,
        ),
      )
    } finally {
      setIsSendingMessage(false)
    }
  }

  const updateMessageContentType = (
    events: ChatEvent[],
    eventId: string,
    type: ChatEventsContentType.TEXT | ChatEventsContentType.TEXT_ERROR,
  ) => {
    const currentEventPosition = events.findIndex(
      (event) => event.id === eventId,
    )

    if (currentEventPosition === -1) return events

    const newEvents = [...events]
    const currentEvent = newEvents[currentEventPosition]
    newEvents[currentEventPosition] = {
      ...currentEvent,
      payload: {
        content: {
          ...(currentEvent as UserChatEvent).payload.content,
          type,
        },
      },
    } as UserChatEvent

    return newEvents
  }

  const onSendFile = async (file: File) => {
    if (!channelSetup) return

    const { id, auth } = channelSetup

    const fileUploadingEvent = createUploadingFileEvent(file)

    setEvents((prevEvents) => [...prevEvents, fileUploadingEvent])

    try {
      const fileUploadedEvent = await ChatClient.sendFile({
        id: id,
        event: fileUploadingEvent,
        auth,
      })

      setEvents((prevEvents) => {
        const currentFileUploadingEventPosition = prevEvents.findIndex(
          (event) => event.id === fileUploadingEvent.id,
        )

        const newEvents = [...prevEvents]
        newEvents[currentFileUploadingEventPosition] = fileUploadedEvent
        return newEvents
      })
    } catch (error) {
      ChatMetrics.chatFileMessageSentError(id, file)
      const fileUploadingError = JSON.parse((error as Error).message).errors[0]

      setEvents((prevEvents) => {
        const currentFileUploadingEventPosition = prevEvents.findIndex(
          (event) => event.id === fileUploadingEvent.id,
        )

        const newEvents = [...prevEvents]
        const fileName = (
          newEvents[
            currentFileUploadingEventPosition
          ] as UserUploadingFileChatEvent
        ).payload.content.file.name

        newEvents[currentFileUploadingEventPosition] =
          createUploadingFileErrorEvent(
            fileName,
            fileUploadingError,
            t,
            i18n.language,
          )

        return newEvents
      })
    }
  }

  const finishChat = async () => {
    if (!channelSetup) return

    const { id, auth } = channelSetup

    setEvents((prevEvents) => [
      ...prevEvents,
      {
        id: crypto.randomUUID(),
        type: ChatEventsType.CONVERSATION_RELEASED,
      },
    ])

    socketRef.current?.disconnect()
    setIsChatOpen(false)

    await ChatClient.finish({ chatId: id, auth })

    setChatStatus(ChatStatusType.FINISHED)
  }

  const getDecoratedEvent = (event: ChatEvent) => {
    if (!ChatEventDomain.isMessageFromAgent(event)) return event

    return {
      ...event,
      payload: {
        ...event.payload,
        readByUser: isChatOpenRef.current,
      },
    } as AgentChatEvent
  }

  const setEventsReadByUser = () => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (!ChatEventDomain.isMessageFromAgent(event)) return event

        return {
          ...event,
          payload: {
            ...event.payload,
            readByUser: true,
          },
        } as AgentChatEvent
      }),
    )
  }

  return {
    isChatOpen,
    chatStatus,
    openChat,
    openRemote,
    events,
    sendMessage,
    sendTextMessageEvent,
    onSendFile,
    finishChat,
    startNewChat,
    channelSetup,
    unreadMessagesCount,
    setEventsReadByUser,
    isSendingMessage,
    isAgentTyping,
    minimizeChat,
    isSoundActive,
    toggleSound,
  }
}

export { useChat }
