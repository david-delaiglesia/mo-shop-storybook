import { BaseButton } from './BaseButton'
import classNames from 'classnames'
import { string } from 'prop-types'

import withFeedback from 'wrappers/feedback'

import './styles/ButtonQuaternary.css'

const ButtonQuaternary = ({ className, ...props }) => (
  <BaseButton className={classNames('btn--quaternary', className)} {...props} />
)

ButtonQuaternary.defaultProps = {
  className: '',
}

ButtonQuaternary.propTypes = {
  className: string,
}

ButtonQuaternary.withFeedback = withFeedback(ButtonQuaternary)

export { ButtonQuaternary }
