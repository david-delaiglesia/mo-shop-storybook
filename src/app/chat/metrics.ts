import { Tracker } from 'services/tracker'

const CHAT_HELP_CLICK = 'chat_help_click'
const CHAT_WIDGET_CLICK = 'chat_widget_click'
const CHAT_FILE_SENT = 'chat_file_sent'
const CHAT_SOUND_TOGGLED = 'chat_sound_toggled'
const CHAT_ASSIGNED_TO_AGENT = 'chat_assigned_to_agent'
const CHAT_OPEN_NEW_CONVERSATION = 'chat_open_new_conversation'

export enum ChatHelpSources {
  USER_MENU = 'user_menu',
  LOGIN = 'login',
  RESTORE_PASSWORD = 'restore_password',
  SERVICE_RATING = 'service_rating',
  HELP = 'help',
  PENDING_ORDER = 'pending_order',
}

export enum AttachmentSources {
  FORM = 'form',
  DROP = 'drop',
}

export enum ChatMinimizeSources {
  FLOATING_BUTTON = 'floating_button',
  MINIMIZE_BUTTON = 'minimize_button',
}

const chatOpenNewConversation = () => {
  Tracker.sendInteraction(CHAT_OPEN_NEW_CONVERSATION)
}

const chatHelpClick = (source: ChatHelpSources, view: string) => {
  Tracker.sendInteraction(CHAT_HELP_CLICK, {
    view,
    source,
  })
}

const chatWidgetClick = (view: string) => {
  Tracker.sendInteraction(CHAT_WIDGET_CLICK, {
    view,
  })
}

const chatMinimize = (source: ChatMinimizeSources, view: string) => {
  Tracker.sendInteraction('chat_minimize', {
    view,
    source,
  })
}

const chatTextMessageSentError = (chatId: string) => {
  Tracker.sendInteraction('chat_message_sent_error', {
    chatId,
    hasAttachment: false,
  })
}

const chatFileMessageSentError = (chatId: string, file: File) => {
  Tracker.sendInteraction('chat_message_sent_error', {
    chatId,
    hasAttachment: true,
    fileType: file.type,
  })
}

const chatPrivacyLinkClicked = () => {
  Tracker.sendInteraction('chat_privacy_link_clicked')
}

const chatMessageSentRetry = (chatId: string) => {
  Tracker.sendInteraction('chat_message_sent_retry', {
    chatId,
  })
}

const chatFileSent = (
  attachmentSource: AttachmentSources,
  view: string,
  chatId?: string,
) => {
  Tracker.sendInteraction(CHAT_FILE_SENT, {
    attachment_source: attachmentSource,
    platform: 'web',
    view,
    chat_id: chatId,
  })
}

const chatSoundToggled = (chatId: string, status: 'on' | 'off') => {
  Tracker.sendInteraction(CHAT_SOUND_TOGGLED, {
    chat_id: chatId,
    status,
  })
}

const chatAssignedToAgent = (
  sessionId: string,
  agentName: string,
  timeSinceChatOpenedMs: number,
) => {
  const timeSinceChatOpenedSeconds = Math.round(timeSinceChatOpenedMs / 1000)

  Tracker.sendInteraction(CHAT_ASSIGNED_TO_AGENT, {
    session_id: sessionId,
    agent_name: agentName,
    time_since_chat_opened: timeSinceChatOpenedSeconds,
  })
}

export const ChatMetrics = {
  chatOpenNewConversation,
  chatHelpClick,
  ChatHelpSources,
  chatWidgetClick,
  chatMinimize,
  chatTextMessageSentError,
  chatFileMessageSentError,
  chatPrivacyLinkClicked,
  chatMessageSentRetry,
  AttachmentSources,
  chatFileSent,
  chatSoundToggled,
  chatAssignedToAgent,
}
