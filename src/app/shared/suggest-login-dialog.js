import cartImage from 'app/assets/repeat-replace@2x.png'
import {
  sendForceLoginPopupAlertCancelClickMetrics,
  sendForceLoginPopupAlertLoginClickMetrics,
  sendForceLoginPopupAlertViewMetrics,
} from 'app/authentication/metrics'
import { URL_PARAMS } from 'pages/paths'

const navigateToLogin = (hideModal, history) => {
  sendForceLoginPopupAlertLoginClickMetrics()
  hideModal()
  const { location } = history
  const searchParams = new URLSearchParams(location.search)
  searchParams.set(URL_PARAMS.AUTHENTICATE_USER, '')

  history.push(
    { pathname: location.pathname, search: searchParams.toString() },
    { isBeingAuthorizedFromSuggestion: true },
  )
}

const hideSuggestLoginDialog = (hideModal) => {
  sendForceLoginPopupAlertCancelClickMetrics()
  hideModal()
}

export const showSuggestLoginDialog = (showModal, hideModal, t, history) => {
  const options = {
    imageSrc: cartImage,
    title: t('unlogged_alert_title'),
    description: t('unlogged_alert_description'),
    primaryActionText: t('unlogged_alert_login_button'),
    primaryAction: () => navigateToLogin(hideModal, history),
    secondaryActionText: t('unlogged_alert_notnow_button'),
    secondaryAction: () => hideSuggestLoginDialog(hideModal),
  }
  sendForceLoginPopupAlertViewMetrics()
  showModal(options)
}
