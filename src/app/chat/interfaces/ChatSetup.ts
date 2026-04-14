export interface ChatSetupResponse {
  id: string
  auth: {
    type: string
    token: string
  }
  type: ChatSetupType
  events: ChatEventResponse[]
}

export type ChatEventResponse =
  | AgentMessageTextChatEventResponse
  | AgentMessageImageChatEventResponse
  | AgentMessageFileChatEventResponse
  | UserMessageTextChatEventResponse
  | UserMessageImageChatEventResponse
  | AgentAssignedChatEventResponse
  | QueueUpdatedChatEventResponse
  | ConversationReleasedChatEventResponse

type BaseChatEventResponse = {
  id: string
  type: ChatEventsType
  received_at?: string
}

export interface AgentMessageChatEventResponse extends BaseChatEventResponse {
  type: ChatEventsType.CONVERSATION_AGENT_MESSAGE
}

export interface AgentMessageTextChatEventResponse extends AgentMessageChatEventResponse {
  payload: {
    author: {
      display_name: string
    }
    content: {
      media_url: null
      type: ChatEventsContentType.TEXT
      text: string
    }
  }
}

export interface AgentMessageImageChatEventResponse extends AgentMessageChatEventResponse {
  payload: {
    author: {
      display_name: string
    }
    content: {
      media_url: string
      type: ChatEventsContentType.IMAGE
      text: null
    }
  }
}

export interface AgentMessageFileChatEventResponse extends AgentMessageChatEventResponse {
  payload: {
    author: {
      display_name: string
    }
    content: {
      media_url: string
      type: ChatEventsContentType.FILE
      name: string
      text: null
    }
  }
}

export interface UserMessageTextChatEventResponse extends BaseChatEventResponse {
  type: ChatEventsType.CONVERSATION_USER_MESSAGE
  payload: {
    content: {
      type: ChatEventsContentType.TEXT
      text: string
    }
  }
}

export interface UserMessageImageChatEventResponse extends BaseChatEventResponse {
  type: ChatEventsType.CONVERSATION_USER_MESSAGE
  payload: {
    content: {
      type: ChatEventsContentType.IMAGE
      media_url: string
    }
  }
}

export interface AgentAssignedChatEventResponse extends BaseChatEventResponse {
  type: ChatEventsType.SUPPORT_AGENT_ASSIGNED
  payload: {
    display_name: string
  }
}

export interface QueueUpdatedChatEventResponse extends BaseChatEventResponse {
  type: ChatEventsType.QUEUE_UPDATED
  payload: {
    queue_position: number
  }
}

export interface ConversationReleasedChatEventResponse extends BaseChatEventResponse {
  type: ChatEventsType.CONVERSATION_RELEASED
}

export interface ChatSetup {
  id: string
  auth: {
    type: string
    token: string
  }
  type: ChatSetupType
  events: ChatEvent[]
}

export type ChatEvent =
  | AgentMessageTextChatEvent
  | AgentMessageImageChatEvent
  | AgentMessageFileChatEvent
  | UserMessageTextChatEvent
  | UserMessageTextErrorChatEvent
  | UserUploadingFileChatEvent
  | UserUploadingFileErrorChatEvent
  | UserMessageFileChatEvent
  | UserMessageImageChatEvent
  | AgentAssignedChatEvent
  | QueueUpdatedChatEvent
  | ConversationReleasedChatEvent
  | ConversationUpdatedChatEvent
  | AgentTypingStartChatEvent
  | AgentTypingEndChatEvent

type BaseChatEvent = {
  id: string
  type: ChatEventsType
  receivedAt?: string
}

export interface AgentMessageChatEvent extends BaseChatEvent {
  type: ChatEventsType.CONVERSATION_AGENT_MESSAGE
}

export interface AgentMessageTextChatEvent extends AgentMessageChatEvent {
  payload: {
    author: {
      displayName: string
    }
    content: {
      type: string
      name: null
      text: string
      mediaUrl: null
    }
    readByUser?: boolean
  }
}

export interface AgentMessageImageChatEvent extends AgentMessageChatEvent {
  payload: {
    author: {
      displayName: string
    }
    content: {
      type: string
      name: null
      text: null
      mediaUrl: string
    }
    readByUser?: boolean
  }
}

export interface AgentMessageFileChatEvent extends AgentMessageChatEvent {
  payload: {
    author: {
      displayName: string
    }
    content: {
      type: string
      name: string
      text: null
      mediaUrl: string
    }
    readByUser?: boolean
  }
}

export type AgentChatEvent =
  | AgentMessageTextChatEvent
  | AgentMessageImageChatEvent
  | AgentMessageFileChatEvent

export interface UserMessageChatEvent extends BaseChatEvent {
  type: ChatEventsType.CONVERSATION_USER_MESSAGE
}

export interface UserMessageTextChatEvent extends UserMessageChatEvent {
  payload: {
    content: {
      type: ChatEventsContentType.TEXT
      text: string
    }
  }
}

export interface UserMessageTextErrorChatEvent extends UserMessageChatEvent {
  payload: {
    content: {
      type: ChatEventsContentType.TEXT_ERROR
      text: string
    }
  }
}

export type UserChatEvent =
  | UserMessageTextChatEvent
  | UserMessageTextErrorChatEvent

export interface UserUploadingFileChatEvent extends BaseChatEvent {
  type: ChatEventsType.CONVERSATION_USER_MESSAGE
  payload: {
    content: {
      type: ChatEventsContentType.UPLOADING_FILE
      file: File
    }
  }
}

export interface UserUploadingFileErrorChatEvent extends BaseChatEvent {
  type: ChatEventsType.CONVERSATION_USER_MESSAGE
  payload: {
    content: {
      type: ChatEventsContentType.UPLOADING_FILE_ERROR
      fileName: string
      errorMessage: string
    }
  }
}

export interface UserMessageImageChatEvent extends BaseChatEvent {
  type: ChatEventsType.CONVERSATION_USER_MESSAGE
  payload: {
    content: {
      type: ChatEventsContentType.IMAGE
      mediaUrl: string
    }
  }
}

export interface UserMessageFileChatEvent extends BaseChatEvent {
  type: ChatEventsType.CONVERSATION_USER_MESSAGE
  payload: {
    content: {
      type: ChatEventsContentType.FILE
      name: string
      mediaUrl: string
    }
  }
}

export interface AgentAssignedChatEvent extends BaseChatEvent {
  type: ChatEventsType.SUPPORT_AGENT_ASSIGNED
  payload: {
    displayName: string
  }
}

export interface QueueUpdatedChatEvent extends BaseChatEvent {
  type: ChatEventsType.QUEUE_UPDATED
  payload: {
    queuePosition: number
  }
}

export interface ConversationReleasedChatEvent extends BaseChatEvent {
  type: ChatEventsType.CONVERSATION_RELEASED
}

export interface ConversationUpdatedChatEvent extends BaseChatEvent {
  type: ChatEventsType.CONVERSATION_UPDATED
  payload: {
    type: ChatSetupType
  }
}

export interface AgentTypingStartChatEvent extends BaseChatEvent {
  type: ChatEventsType.AGENT_TYPING_START
}

export interface AgentTypingEndChatEvent extends BaseChatEvent {
  type: ChatEventsType.AGENT_TYPING_END
}

export enum ChatEventsType {
  CONVERSATION_AGENT_MESSAGE = 'conversation:agent_message',
  CONVERSATION_USER_MESSAGE = 'conversation:user_message',
  SUPPORT_AGENT_ASSIGNED = 'support:agent_assigned',
  QUEUE_UPDATED = 'queue:updated',
  CONVERSATION_RELEASED = 'conversation:released',
  CONVERSATION_UPDATED = 'conversation:updated',
  AGENT_TYPING_START = 'conversation:agent_typing:start',
  AGENT_TYPING_END = 'conversation:agent_typing:end',
}

export enum ChatSetupType {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export enum ChatStatusType {
  IDLE = 'idle',
  STARTED = 'started',
  FINISHED = 'finished',
  FAILED = 'failed',
  LOADING = 'loading',
}

export enum ChatEventsContentType {
  TEXT = 'text',
  TEXT_ERROR = 'text-error',
  IMAGE = 'image',
  FILE = 'file',
  UPLOADING_FILE = 'uploading-file',
  UPLOADING_FILE_ERROR = 'file-error',
}

export type FileUploadingError =
  | {
      code: 'file_size_exceeded'
      detail: string
      extra: {
        limit: string
      }
    }
  | {
      code: 'invalid_file_type'
      detail: string
      extra: {
        allowed_extensions: string[]
      }
    }
  | {
      code: 'unknown_file_upload_error'
    }
