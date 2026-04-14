import { PureComponent } from 'react'

import { INTERACTION_EVENTS } from '../../constants'
import { func, object, shape } from 'prop-types'

import { validateForm } from 'utils/input-validators'
import { withInteractionMetrics } from 'wrappers/metrics'

export const withUnavailableAreaStepsMetrics = (step) => {
  class WithUnavailableAreaStepsMetrics extends PureComponent {
    metricsEvents = {
      goToTheClassicWeb: this.goToTheClassicWeb.bind(this),
      enterAnotherPostalCode: this.enterAnotherPostalCode.bind(this),
      goToNotifyMe: this.goToNotifyMe.bind(this),
      notifyMe: this.notifyMe.bind(this),
      onEnterKeyPress: this.onEnterKeyPress.bind(this),
      goToLandingPage: this.goToLandingPage.bind(this),
    }

    goToTheClassicWeb() {
      const { trackInteraction, goToTheClassicWeb } = this.props

      trackInteraction(INTERACTION_EVENTS.GO_TO_CLASSIC_CLICK)
      goToTheClassicWeb()
    }

    enterAnotherPostalCode() {
      const { trackInteraction, enterAnotherPostalCode } = this.props

      trackInteraction(INTERACTION_EVENTS.RETRY_POSTAL_CODE_CLICK)
      enterAnotherPostalCode()
    }

    goToNotifyMe() {
      const { trackInteraction, goToNotifyMe } = this.props

      trackInteraction(INTERACTION_EVENTS.NOTIFY_ME_CLICK)
      goToNotifyMe()
    }

    notifyMe() {
      const { trackInteraction, notifyMe, form } = this.props
      const { email, postalCode } = form.fields
      const { isValid } = validateForm(form)
      const options = {
        email: email.value,
        postal_code: postalCode.value,
        is_valid: isValid,
      }

      trackInteraction(INTERACTION_EVENTS.NOTIFY_ME_CONFIRMATION, options)
      notifyMe()
    }

    onEnterKeyPress() {
      const { trackInteraction, onEnterKeyPress, form } = this.props
      const { email, postalCode } = form.fields
      const { isValid } = validateForm(form)
      const options = {
        email: email.value,
        postal_code: postalCode.value,
        is_valid: isValid,
      }

      trackInteraction(INTERACTION_EVENTS.NOTIFY_ME_CONFIRMATION, options)
      onEnterKeyPress()
    }

    goToLandingPage() {
      const { trackInteraction, goToLandingPage } = this.props

      trackInteraction(INTERACTION_EVENTS.GO_TO_LANDING_CLICK)
      goToLandingPage()
    }

    render() {
      return this.props.children(this.metricsEvents)
    }
  }

  WithUnavailableAreaStepsMetrics.propTypes = {
    form: shape({
      fields: shape({
        email: object.isRequired,
        postalCode: object.isRequired,
      }).isRequired,
    }).isRequired,
    children: func.isRequired,
    trackInteraction: func.isRequired,
    goToTheClassicWeb: func.isRequired,
    enterAnotherPostalCode: func.isRequired,
    goToNotifyMe: func.isRequired,
    notifyMe: func.isRequired,
    onEnterKeyPress: func.isRequired,
    goToLandingPage: func.isRequired,
  }

  return withInteractionMetrics(WithUnavailableAreaStepsMetrics)(step)
}
