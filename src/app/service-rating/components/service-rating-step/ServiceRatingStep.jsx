import { PureComponent } from 'react'

import { array, func, node, number, shape, string } from 'prop-types'

import Button from 'components/button'
import { ServiceRatingStep as Step } from 'domain/service-rating'
import { TAB_INDEX } from 'utils/constants'

import './styles/ServiceRatingStep.css'

class ServiceRatingStep extends PureComponent {
  constructor() {
    super()

    this.goToPreviousStep = this.goToPreviousStep.bind(this)
  }

  goToPreviousStep() {
    const { step, goBack } = this.props

    goBack(step.parent)
  }

  render() {
    const { step, children } = this.props
    const { title, subtitle } = step

    return (
      <div className="service-rating-step" data-testid="service-rating-step">
        {title && (
          <h3
            className="title2-b service-rating-step__title"
            data-testid="service-rating-step-title"
            tabIndex={TAB_INDEX.ENABLED}
          >
            {title}
          </h3>
        )}
        {subtitle && (
          <p
            className="body1-r service-rating-step__subtitle"
            tabIndex={TAB_INDEX.ENABLED}
            data-testid="service-rating-step-subtitle"
          >
            {subtitle}
          </p>
        )}
        {children}
        {Step.isIntermediate(step) && (
          <Button
            className="service-rating-step__button"
            icon="back-28"
            text="service_rating_modal_back_button"
            onClick={this.goToPreviousStep}
            datatest="service-rating-step-button"
          />
        )}
      </div>
    )
  }
}

ServiceRatingStep.propTypes = {
  step: shape({
    title: string,
    subtitle: string,
    choices: array.isRequired,
    parent: number,
  }),
  children: node.isRequired,
  goBack: func,
}

ServiceRatingStep.defaultProps = {
  step: {
    choices: [],
  },
}

export { ServiceRatingStep }
