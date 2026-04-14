import { ChatStatusType } from 'app/chat/interfaces'

const isIdle = (chatStatusType: ChatStatusType) => {
  return chatStatusType === ChatStatusType.IDLE
}

const isStarted = (chatStatusType: ChatStatusType) => {
  return chatStatusType === ChatStatusType.STARTED
}

const isFinished = (chatStatusType: ChatStatusType) => {
  return chatStatusType === ChatStatusType.FINISHED
}

const isFailed = (chatStatusType: ChatStatusType) => {
  return chatStatusType === ChatStatusType.FAILED
}

const canStart = (chatStatusType: ChatStatusType) => {
  return [isIdle(chatStatusType), isFinished(chatStatusType)].some(
    (chatStatusTypeCanStart) => chatStatusTypeCanStart === true,
  )
}

export const ChatStatus = {
  isIdle,
  isStarted,
  isFinished,
  isFailed,
  canStart,
}
