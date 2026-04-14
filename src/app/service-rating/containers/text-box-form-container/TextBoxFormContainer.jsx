import { Component } from 'react'

import { TextBoxStep } from '../../components/text-box-step'
import { arrayOf, func, number, shape, string } from 'prop-types'

import {
  sendServiceRatingClickMetrics,
  sendServiceRatingStepViewMetrics,
} from 'app/service-rating/metrics'

class TextBoxFormContainer extends Component {
  state = {
    message: '',
  }

  constructor() {
    super()

    this.onChange = this.onChange.bind(this)
    this.send = this.send.bind(this)
  }

  componentDidMount() {
    const { step } = this.props
    const options = { layout: step.layout }
    sendServiceRatingStepViewMetrics(options)
  }

  onChange(event) {
    this.setState({ message: event.target.value })
  }

  send() {
    const { step, rate } = this.props
    const [{ id: answerId }] = step.choices
    const answer = this.createAnswer(answerId, this.state.message)

    this.sendRateMetrics(answer)
    rate(answer)
  }

  sendRateMetrics(answer) {
    const { answerId: id, text: comments, label } = answer
    const options = { id, label, comments }
    sendServiceRatingClickMetrics(options)
  }

  createAnswer(answerId, text) {
    if (!text) {
      return { answerId }
    }

    return { answerId, text }
  }

  render() {
    const { step, goBack } = this.props

    return (
      <TextBoxStep
        updateMessage={this.onChange}
        sendMessage={this.send}
        message={this.state.message}
        step={step}
        goBack={goBack}
      />
    )
  }
}

TextBoxFormContainer.propTypes = {
  rate: func.isRequired,
  step: shape({
    title: string.isRequired,
    choices: arrayOf(
      shape({
        id: number.isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  goBack: func.isRequired,
}

export { TextBoxFormContainer }
