import { Component } from 'react'
import { connect } from 'react-redux'

import { DeliveryAreaClient } from '../../client'
import { NotifyMe } from '../../components/notify-me'
import { ThankYou } from '../../components/thank-you'
import { UnavailableArea } from '../../components/unavailable-area'
import { OLD_SHOP_LANGUAGES_ID, OLD_URL } from '../../constants'
import { withUnavailableAreaStepsMetrics } from './UnavailableAreaStepsMetrics'
import { func, string } from 'prop-types'
import { compose } from 'redux'

import { I18nClient } from 'app/i18n/client'
import Modal from 'components/modal'
import {
  getDefaultValidation,
  getEmailValidation,
  getPostalCodeValidation,
  getUpdatedFormValidation,
  resetForm,
  validateForm,
} from 'utils/input-validators'
import { clearPendingAction } from 'wrappers/feedback/actions'

const STEPS = {
  UNAVAILABLE_AREA: withUnavailableAreaStepsMetrics(UnavailableArea),
  NOTIFY_ME: withUnavailableAreaStepsMetrics(NotifyMe),
  THANK_YOU: withUnavailableAreaStepsMetrics(ThankYou),
}

class UnavailableAreaContainer extends Component {
  state = {
    step: STEPS.UNAVAILABLE_AREA,
    form: {
      fields: {
        postalCode: {
          value: undefined,
          validation: getDefaultValidation(),
          getValidation: getPostalCodeValidation,
        },
        email: {
          value: undefined,
          validation: getDefaultValidation(),
          getValidation: getEmailValidation,
        },
      },
      isValid: false,
    },
  }

  goToTheClassicWeb = () => {
    const currentLanguage = I18nClient.getCurrentLanguage()
    window.location.href = OLD_URL + OLD_SHOP_LANGUAGES_ID[currentLanguage]
  }

  goToNotifyMe = () => {
    this.setState(({ form }) => ({
      step: STEPS.NOTIFY_ME,
      form: resetForm(form),
    }))
  }

  onChange = (event) => {
    const { name, value } = event.target

    this.setState({
      form: getUpdatedFormValidation(this.state.form, name, value),
    })
  }

  notifyMe = async () => {
    const { isValid, fields } = validateForm(this.state.form)

    if (!isValid) {
      this.setState({ form: { isValid, fields } })
      return
    }

    await DeliveryAreaClient.notifyMe(
      fields.email.value,
      fields.postalCode.value,
    )
    this.setState({ step: STEPS.THANK_YOU })
    this.props.clearPendingAction()
  }

  cancelNotifyMe = () => {
    this.setState({ step: STEPS.UNAVAILABLE_AREA })
  }

  goToLandingPage = () => {
    window.location.href = `//${import.meta.env.VITE_ONBOARDING_URL}`
  }

  render = () => {
    const { postalCode, enterAnotherPostalCode } = this.props
    const { step: StepComponent, form } = this.state

    if (!StepComponent) {
      return null
    }

    return (
      <Modal clickout={false} blockScroll>
        <StepComponent
          form={form}
          notifyMe={this.notifyMe}
          onEnterKeyPress={this.notifyMe}
          onChange={this.onChange}
          goToTheClassicWeb={this.goToTheClassicWeb}
          goToNotifyMe={this.goToNotifyMe}
          cancelNotifyMe={this.cancelNotifyMe}
          goToLandingPage={this.goToLandingPage}
          postalCode={postalCode}
          enterAnotherPostalCode={enterAnotherPostalCode}
        />
      </Modal>
    )
  }
}

UnavailableAreaContainer.propTypes = {
  postalCode: string.isRequired,
  enterAnotherPostalCode: func.isRequired,
  clearPendingAction: func.isRequired,
}

const mapDispatchToProps = {
  clearPendingAction,
}

const ComposedUnavailableAreaContainer = compose(
  connect(null, mapDispatchToProps),
)(UnavailableAreaContainer)

export { ComposedUnavailableAreaContainer as UnavailableAreaContainer }
