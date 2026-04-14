import { BaseButton } from './BaseButton'
import classNames from 'classnames'
import { string } from 'prop-types'

import withFeedback from 'wrappers/feedback'

import './styles/ButtonSecondary.css'

const ButtonSecondary = ({ className, ...props }) => (
  <BaseButton className={classNames('btn--secondary', className)} {...props} />
)

ButtonSecondary.defaultProps = {
  className: '',
}

ButtonSecondary.propTypes = {
  className: string,
}

ButtonSecondary.withFeedback = withFeedback(ButtonSecondary)

export { ButtonSecondary }
