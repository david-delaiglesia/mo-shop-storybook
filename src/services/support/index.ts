import { DOWNLOAD_INVOICE_URL, FAQS_URL } from './constants'
import {
  hideButton,
  identify,
  initialize,
  logout,
  openWidget,
  popoutChatWindow,
  sendMessage,
  setHelpCenterSuggestions,
  setLocale,
  showButton,
  updateSettings,
} from './zendesk'

export const Support = {
  initialize,
  identify,
  setLocale,
  showButton,
  hideButton,
  openWidget,
  setHelpCenterSuggestions,
  sendMessage,
  popoutChatWindow,
  logout,
  updateSettings,
  FAQS_URL,
  DOWNLOAD_INVOICE_URL,
}
