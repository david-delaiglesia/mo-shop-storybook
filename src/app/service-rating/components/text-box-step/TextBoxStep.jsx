import { ServiceRatingStep } from '../service-rating-step'
import { arrayOf, func, shape, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Button from 'components/button'
import { TextArea } from 'system-ui/text-area'

import './styles/TextBoxStep.css'

const TextBoxStep = ({
  message,
  step,
  updateMessage,
  sendMessage,
  goBack,
  t,
}) => {
  const [{ label }] = step.choices

  return (
    <ServiceRatingStep step={step} goBack={goBack}>
      <div className="text-field-step" data-testid="text-box-step">
        <TextArea
          name="text-field-message"
          label={label}
          value={message}
          onChange={updateMessage}
          maxLength={400}
          rows={6}
          t={t}
        />
        <Button
          text="service_rating_text_field_send_button"
          onClick={sendMessage}
          datatest="rate-with-comment"
        />
      </div>
    </ServiceRatingStep>
  )
}

TextBoxStep.propTypes = {
  message: string.isRequired,
  step: shape({
    title: string.isRequired,
    choices: arrayOf(
      shape({
        label: string.isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  updateMessage: func.isRequired,
  sendMessage: func.isRequired,
  goBack: func.isRequired,
  t: func.isRequired,
}

const TextBoxStepWithTranslate = withTranslate(TextBoxStep)

export { TextBoxStepWithTranslate as TextBoxStep }
