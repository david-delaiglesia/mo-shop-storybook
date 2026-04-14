import { BaseButton } from './BaseButton'
import classNames from 'classnames'
import { string } from 'prop-types'

import withFeedback from 'wrappers/feedback'

import './styles/ButtonPrimary.css'

const ButtonPrimary = ({ className, ...props }) => (
  <BaseButton className={classNames('btn--primary', className)} {...props} />
)

ButtonPrimary.defaultProps = {
  className: '',
}

ButtonPrimary.propTypes = {
  className: string,
}

ButtonPrimary.withFeedback = withFeedback(ButtonPrimary)

export { ButtonPrimary }
