import {
  sendFailedAuthenticationAlertCloseClickMetrics,
  sendFailedAuthenticationAlertViewMetrics,
} from 'app/payment/metrics'
import alertImage from 'system-ui/assets/img/default-alert@2x.png'

export const actionTypes = {
  SHOW_ALERT: 'SHOW_ALERT',
  HIDE_ALERT: 'HIDE_ALERT',
}

/**
 * @deprecated Use showModal from ModalContext instead
 */
export const showAlert = (alertOptions) => ({
  type: actionTypes.SHOW_ALERT,
  payload: alertOptions,
})

/**
 * @deprecated Use hideModal from ModalContext instead
 */
export const hideAlert = () => ({
  type: actionTypes.HIDE_ALERT,
})

/**
 * @deprecated Use showModal from ModalContext instead
 */
export const showAddPaymentKoAlert = ({ flow, confirmButtonAction }) => {
  sendFailedAuthenticationAlertViewMetrics()
  return showAlert({
    title: 'tokenization_failed_authentication_alert_title',
    description: 'tokenization_failed_authentication_alert_explanation',
    confirmButtonText: 'tokenization_failed_authentication_alert_close_button',
    confirmButtonAction: () => {
      sendFailedAuthenticationAlertCloseClickMetrics({ flow })
      confirmButtonAction()
    },
    imageSrc: alertImage,
  })
}
