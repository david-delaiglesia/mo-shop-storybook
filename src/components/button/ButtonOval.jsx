import { BaseButton } from './BaseButton'
import classNames from 'classnames'
import { string } from 'prop-types'

import withFeedback from 'wrappers/feedback'

import './styles/ButtonOval.css'

const ButtonOval = ({ className, ...props }) => (
  <BaseButton className={classNames('btn--oval', className)} {...props} />
)

ButtonOval.defaultProps = {
  className: '',
}

ButtonOval.propTypes = {
  className: string,
}

ButtonOval.withFeedback = withFeedback(ButtonOval)

export { ButtonOval }
