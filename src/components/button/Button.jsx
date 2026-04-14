import { PureComponent } from 'react'

import Icon from '../../system-ui/icon'
import withFeedback from '../../wrappers/feedback'
import Loader from '../loader'
import {
  bool,
  func,
  number,
  object,
  oneOf,
  oneOfType,
  string,
} from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

import './styles/Button.css'

export const DEFAULT_CLASS = 'button button-primary'

export class Button extends PureComponent {
  getButtonClass() {
    let buttonClass = DEFAULT_CLASS
    if (this.props.type) {
      buttonClass = `button button-${this.props.type}`
    }
    if (this.props.disabled) {
      this.props.type
        ? (buttonClass = `button button-${this.props.type}--disabled`)
        : (buttonClass = 'button button-primary--disabled')
    }
    if (this.props.size) {
      this.props.type
        ? (buttonClass += ` button-${this.props.type}--${this.props.size} button--${this.props.size}`)
        : (buttonClass += ` button-${this.props.size}`)
    }
    if (this.props.activeFeedback) {
      buttonClass += ' button-loader'
    }
    if (this.props.className) {
      buttonClass += ` ${this.props.className}`
    }
    return `${buttonClass}`
  }

  render() {
    const {
      id,
      text,
      icon,
      disabled,
      activeFeedback,
      ariaLabel,
      onClick,
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      datatest,
      tabIndex,
      buttonType,
      t,
      forwardedRef,
    } = this.props

    if (activeFeedback) {
      return (
        <button id={id} type="button" className={this.getButtonClass()}>
          <Loader />
        </button>
      )
    }
    return (
      <button
        ref={forwardedRef}
        id={id}
        type={buttonType}
        aria-label={ariaLabel || t(text) || icon}
        className={this.getButtonClass()}
        disabled={disabled}
        onClick={!disabled ? onClick : undefined}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        data-testid={datatest}
        tabIndex={tabIndex}
      >
        <span className="button__text">{t(text)}</span>
        {icon && <Icon datatest={ariaLabel} ariaHidden icon={icon} />}
      </button>
    )
  }
}

Button.propTypes = {
  id: string,
  onClick: func,
  onMouseDown: func,
  onMouseUp: func,
  onMouseLeave: func,
  text: oneOfType([string, object]),
  icon: string,
  type: string,
  buttonType: string,
  disabled: bool,
  size: oneOf(['small', 'big', 'default']),
  activeFeedback: bool,
  className: string,
  ariaLabel: string,
  datatest: string,
  tabIndex: number,
  t: func.isRequired,
  forwardedRef: object,
}

Button.defaultProps = {
  datatest: 'button',
  fit: false,
  buttonType: 'button',
}

export const ButtonWithFeedback = withFeedback(withTranslate(Button))

export default withTranslate(Button)
