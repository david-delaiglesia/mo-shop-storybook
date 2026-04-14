import classNames from 'classnames'
import { bool, elementType, func, oneOf, oneOfType, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Loader from 'components/loader'
import Icon from 'system-ui/icon'

import './styles/BaseButton.css'

const BaseButton = ({
  as: TagName,
  className,
  type,
  text,
  icon,
  fit,
  destructive,
  size,
  activeFeedback,
  t,
  ...props
}) => (
  <TagName
    type={TagName === 'button' ? type : null}
    className={classNames('btn', className, `btn--${size}`, {
      'btn--fit': fit,
      'btn--destructive': destructive,
      'btn--loading': activeFeedback,
    })}
    {...props}
  >
    {activeFeedback && <Loader />}
    {!activeFeedback && text && <span className="button__text">{t(text)}</span>}
    {!activeFeedback && icon && <Icon icon={icon} />}
  </TagName>
)

BaseButton.defaultProps = {
  className: '',
  type: 'button',
  text: '',
  icon: '',
  fit: false,
  destructive: false,
  size: 'default',
  as: 'button',
  activeFeedback: false,
}

BaseButton.propTypes = {
  className: string,
  type: oneOf(['button', 'submit', 'reset']),
  text: string,
  icon: string,
  fit: bool,
  destructive: bool,
  size: oneOf(['small', 'default', 'big']),
  as: oneOfType([elementType, string]),
  activeFeedback: bool,
  t: func.isRequired,
}

const ComposedBaseButton = withTranslate(BaseButton)

export { ComposedBaseButton as BaseButton }
