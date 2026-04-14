import { ChatEvent as ChatEventType, ChatEventsType } from 'app/chat/interfaces'

const isMessageFromAgent = (event: ChatEventType) => {
  return event.type === ChatEventsType.CONVERSATION_AGENT_MESSAGE
}

const isUnreadMessageFromAgent = (event: ChatEventType) => {
  return isMessageFromAgent(event) && !event.payload.readByUser
}

const isMessageFromUser = (event: ChatEventType) => {
  return event.type === ChatEventsType.CONVERSATION_USER_MESSAGE
}

const isAgentAssigned = (event: ChatEventType) => {
  return event.type === ChatEventsType.SUPPORT_AGENT_ASSIGNED
}

const isQueueUpdated = (event: ChatEventType) => {
  return event.type === ChatEventsType.QUEUE_UPDATED
}

const isConversationReleased = (event: ChatEventType) => {
  return event.type === ChatEventsType.CONVERSATION_RELEASED
}

const isConversationUpdated = (event: ChatEventType) => {
  return event.type === ChatEventsType.CONVERSATION_UPDATED
}

const isAgentTypingStart = (event: ChatEventType) => {
  return event.type === ChatEventsType.AGENT_TYPING_START
}

const isAgentTypingEnd = (event: ChatEventType) => {
  return event.type === ChatEventsType.AGENT_TYPING_END
}

const couldBeAnUpdate = (event: ChatEventType) => {
  return [isQueueUpdated(event), isAgentAssigned(event)].some(
    (eventCouldBeAnUpdate) => eventCouldBeAnUpdate === true,
  )
}

const isUpdatable = (event: ChatEventType) => {
  return isQueueUpdated(event)
}

const shouldDiscardEvent = (
  event: ChatEventType,
  currentEvents: ChatEventType[],
) => {
  return (
    isQueueUpdated(event) &&
    currentEvents.some((event) => isAgentAssigned(event))
  )
}

export const ChatEvent = {
  isMessageFromAgent,
  isUnreadMessageFromAgent,
  isMessageFromUser,
  isAgentAssigned,
  isQueueUpdated,
  isConversationReleased,
  isConversationUpdated,
  isAgentTypingStart,
  isAgentTypingEnd,
  isUpdatable,
  couldBeAnUpdate,
  shouldDiscardEvent,
}
