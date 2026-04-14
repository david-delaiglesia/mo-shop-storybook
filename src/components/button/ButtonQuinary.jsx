import { BaseButton } from './BaseButton'
import classNames from 'classnames'
import { string } from 'prop-types'

import withFeedback from 'wrappers/feedback'

import './styles/ButtonQuinary.css'

const ButtonQuinary = ({ className, ...props }) => (
  <BaseButton className={classNames('btn--quinary', className)} {...props} />
)

ButtonQuinary.defaultProps = {
  className: '',
}

ButtonQuinary.propTypes = {
  className: string,
}

ButtonQuinary.withFeedback = withFeedback(ButtonQuinary)

export { ButtonQuinary }
