import Icon from '../../system-ui/icon'
import classNames from 'classnames'
import { bool, func, string } from 'prop-types'

import './styles/Arrow.css'

const Arrow = ({ direction, click, ariaLabel, isVisible, disabled }) => {
  const arrowClass = classNames(
    'arrow',
    `arrow--${direction}`,
    { hidden: !isVisible },
    { disabled: disabled },
  )

  const onClick = () => {
    if (disabled) return

    click()
  }

  const arrowAriaLabel = ariaLabel ? ariaLabel : `arrow--${direction}`

  return (
    <div
      aria-hidden={true}
      onClick={onClick}
      disabled={disabled}
      className={arrowClass}
      aria-label={arrowAriaLabel}
    >
      <Icon icon="big-chevron" />
    </div>
  )
}

Arrow.propTypes = {
  direction: string.isRequired,
  click: func.isRequired,
  ariaLabel: string,
  isVisible: bool,
  disabled: bool,
}

Arrow.defaultProps = {
  isVisible: true,
  isDisabled: false,
}

export default Arrow
