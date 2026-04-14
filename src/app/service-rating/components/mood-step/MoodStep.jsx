import { useEffect } from 'react'

import { ServiceRatingStep } from '../service-rating-step'
import { MoodEmoji } from './MoodEmoji'
import { arrayOf, func, number, shape, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider/withTranslate'
import {
  sendServiceRatingClickMetrics,
  sendServiceRatingStepViewMetrics,
} from 'app/service-rating/metrics'
import { TAB_INDEX } from 'utils/constants'

import './styles/MoodStep.css'

const MoodStep = ({ step, rate, t }) => {
  const [happyChoice, neutralChoice, unhappyChoice] = step.choices

  useEffect(() => {
    const options = { layout: step.layout }
    sendServiceRatingStepViewMetrics(options)
  })

  const sendRate = (answer) => {
    const { answerId: id, text: comments, label } = answer
    const options = { id, label, comments }
    sendServiceRatingClickMetrics(options)
    rate(answer)
  }

  return (
    <ServiceRatingStep step={step}>
      <div className="mood-step" data-testid="mood-step">
        <div className="mood-step__choices">
          <MoodEmoji choice={happyChoice} name="happy" rate={sendRate} />
          <MoodEmoji choice={neutralChoice} name="neutral" rate={sendRate} />
          <MoodEmoji choice={unhappyChoice} name="unhappy" rate={sendRate} />
        </div>
        <p className="mood-step__explanation" tabIndex={TAB_INDEX.ENABLED}>
          {t('service_rating_modal_mood_explanation')}
        </p>
      </div>
    </ServiceRatingStep>
  )
}

MoodStep.propTypes = {
  rate: func.isRequired,
  step: shape({
    title: string.isRequired,
    subtitle: string,
    choices: arrayOf(
      shape({
        id: number.isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  t: func.isRequired,
}

const MoodStepWithTranslate = withTranslate(MoodStep)

export { MoodStepWithTranslate as MoodStep }
