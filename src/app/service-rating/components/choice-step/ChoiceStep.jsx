import { useEffect } from 'react'

import { ServiceRatingStep } from '../service-rating-step'
import { Choice } from './Choice'
import { arrayOf, func, number, shape, string } from 'prop-types'

import {
  sendServiceRatingClickMetrics,
  sendServiceRatingStepViewMetrics,
} from 'app/service-rating/metrics'

import './styles/ChoiceStep.css'

const ChoiceStep = ({ step, rate, goBack }) => {
  useEffect(() => {
    const options = { layout: step.layout }
    sendServiceRatingStepViewMetrics(options)
  }, [])

  const sendRate = (answer) => {
    const { answerId: id, text: comments, label } = answer
    const options = { id, label, comments }
    sendServiceRatingClickMetrics(options)
    rate(answer)
  }

  return (
    <ServiceRatingStep step={step} goBack={goBack}>
      <div className="choice-step" data-testid="choice-step">
        <div className="choice-step__choices">
          {step.choices.map((choice) => (
            <Choice key={choice.id} choice={choice} rate={sendRate} />
          ))}
        </div>
      </div>
    </ServiceRatingStep>
  )
}

ChoiceStep.propTypes = {
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

export { ChoiceStep }
