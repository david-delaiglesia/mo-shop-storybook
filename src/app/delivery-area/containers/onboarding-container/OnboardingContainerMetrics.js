import { PureComponent } from 'react'

import { INTERACTION_EVENTS } from '../../constants'
import { func, object, shape } from 'prop-types'

class OnboardingContainerMetrics extends PureComponent {
  metricsEvents = {
    onSave: this.onSave.bind(this),
    onEnterKeyPress: this.onEnterKeyPress.bind(this),
  }

  onSave() {
    this.trackEvent()
    this.props.onSave()
  }

  onEnterKeyPress() {
    this.trackEvent()
    this.props.onEnterKeyPress()
  }

  trackEvent() {
    const { trackInteraction, form } = this.props
    const { value } = form.fields.postalCode
    const options = {
      postal_code: value ?? '',
    }

    trackInteraction(INTERACTION_EVENTS.POSTAL_CODE_CONFIRMATION_CLICK, options)
  }

  render() {
    return this.props.children(this.metricsEvents)
  }
}

OnboardingContainerMetrics.propTypes = {
  children: func.isRequired,
  trackInteraction: func.isRequired,
  form: shape({
    fields: shape({
      postalCode: shape({
        validation: object.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  onSave: func,
  onEnterKeyPress: func,
}

export { OnboardingContainerMetrics }
