import { BaseButton } from './BaseButton'
import classNames from 'classnames'
import { string } from 'prop-types'

import withFeedback from 'wrappers/feedback'

import './styles/ButtonTertiary.css'

const ButtonTertiary = ({ className, ...props }) => (
  <BaseButton className={classNames('btn--tertiary', className)} {...props} />
)

ButtonTertiary.defaultProps = {
  className: '',
}

ButtonTertiary.propTypes = {
  className: string,
}

ButtonTertiary.withFeedback = withFeedback(ButtonTertiary)

export { ButtonTertiary }
