import { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { HTTP_STATUS, NetworkError } from '../../../../services/http'
import { ServiceRatingClient } from '../../client'
import { AcknowledgeStep } from '../../components/acknowledge-step'
import { ChoiceStep } from '../../components/choice-step'
import { MoodStep } from '../../components/mood-step'
import { NotAvailableStep } from '../../components/not-available-step'
import { STEP_LAYOUTS } from '../../constants'
import { TextBoxFormContainer } from '../../containers/text-box-form-container'
import { func, string } from 'prop-types'
import { compose } from 'redux'

import { sendServiceRatingPageViewMetrics } from 'app/service-rating/metrics'

const { MOOD, CHOICE, TEXT_BOX, THANK_YOU } = STEP_LAYOUTS

const STEP_COMPONENTS = {
  [MOOD]: MoodStep,
  [CHOICE]: ChoiceStep,
  [TEXT_BOX]: TextBoxFormContainer,
  [THANK_YOU]: AcknowledgeStep,
}

class ServiceRatingContainer extends Component {
  state = {
    step: null,
    token: null,
    isAvailable: true,
    answerId: null,
  }

  constructor() {
    super()

    this.rate = this.rate.bind(this)
    this.getParentStep = this.getParentStep.bind(this)
  }

  async componentDidMount() {
    sendServiceRatingPageViewMetrics()
    try {
      const { token, firstStepId } = await ServiceRatingClient.get(
        this.props.token,
      )
      this.getStep(token, firstStepId)
    } catch (error) {
      this.handleErrors(error)
    }
  }

  componentDidUpdate(prevProps) {
    const { language: prevLanguage } = prevProps
    const { language: currentLanguage } = this.props

    if (!prevLanguage) {
      return
    }

    if (prevLanguage === currentLanguage) {
      return
    }

    this.getStep(this.state.token, this.state.answerId)
  }

  async rate(answer) {
    try {
      const { token, answerId } = await ServiceRatingClient.update(
        this.state.token,
        answer,
      )
      this.getStep(token, answerId)
    } catch (error) {
      this.handleErrors(error)
    }
  }

  async getStep(token, answerId) {
    const step = await ServiceRatingClient.getStepById(token, answerId)
    this.setState({ step, token, answerId })
  }

  async getParentStep(parentId) {
    try {
      const step = await ServiceRatingClient.getStepById(
        this.state.token,
        parentId,
      )
      this.setState({ step, answerId: parentId })
    } catch (error) {
      this.handleErrors(error)
    }
  }

  handleErrors(error) {
    if (error.status === HTTP_STATUS.GONE) {
      this.setState({ isAvailable: false })
      return
    }

    NetworkError.publish(error)
  }

  render() {
    const { onFinish } = this.props
    const { isAvailable, step } = this.state

    if (!isAvailable) return <NotAvailableStep onFinish={onFinish} />

    if (!step) {
      return null
    }

    const StepComponent = STEP_COMPONENTS[step.layout]

    return (
      <div onClick={(event) => event.stopPropagation()}>
        <StepComponent
          step={step}
          rate={this.rate}
          onFinish={onFinish}
          goBack={this.getParentStep}
        />
      </div>
    )
  }
}

ServiceRatingContainer.propTypes = {
  token: string.isRequired,
  onFinish: func.isRequired,
  language: string.isRequired,
}

const mapStateToProps = ({ language }) => ({ language })

const ComposedServiceRatingContainer = compose(
  connect(mapStateToProps),
  withRouter,
)(ServiceRatingContainer)

export { ComposedServiceRatingContainer as ServiceRatingContainer }
