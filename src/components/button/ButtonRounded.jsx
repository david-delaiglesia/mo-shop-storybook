import { BaseButton } from './BaseButton'
import classNames from 'classnames'
import { string } from 'prop-types'

import withFeedback from 'wrappers/feedback'

import './styles/ButtonRounded.css'

const ButtonRounded = ({ className, ...props }) => (
  <BaseButton className={classNames('btn--rounded', className)} {...props} />
)

ButtonRounded.defaultProps = {
  className: '',
}

ButtonRounded.propTypes = {
  className: string,
}

ButtonRounded.withFeedback = withFeedback(ButtonRounded)

export { ButtonRounded }
