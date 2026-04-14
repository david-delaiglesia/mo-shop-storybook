import { Component } from 'react'

import classNames from 'classnames'
import PropTypes from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { TAB_INDEX } from 'utils/constants'

import './styles/Input.css'

export const INPUT_CONSTANTS = {
  TYPE_TEXT: 'text',
  ACTIVE_CLASS_NAME: 'active',
  DISABLED_CLASS_NAME: 'disabled',
  SPACE_KEY_CODE: 32,
  INPUT_CLASS_NAME: 'input-text',
  INPUT_CLASS_LABEL: 'input-text__label',
  INPUT_BIG: 'input-text-big',
  INPUT_CLASS_BIG: 'input-text-big',
  INPUT_CLASS_BIG_LABEL: 'input-big__label',
  MESSAGE_CLASS_NAME: 'input-text__message',
  DISABLED_INPUT_CLASS_NAME: 'input-disabled',
  EMPTY_CLASS_NAME: '',
}

const SIZE = {
  BIG: 'big',
  DEFAULT: 'default',
}

export class Input extends Component {
  constructor() {
    super()

    this.state = {
      isActive: false,
      shouldShowValidationFeedback: true,
    }

    this.onFocus = this.onFocus.bind(this)
    this.onBlur = this.onBlur.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  onFocus(event) {
    this.setState({
      isActive: true,
      shouldShowValidationFeedback: false,
    })

    this.props.onFocus && this.props.onFocus(event)
  }

  onBlur(event) {
    const { value, onBlur } = this.props
    const hasValue = !!value

    this.setState({
      isActive: hasValue,
      shouldShowValidationFeedback: true,
    })

    onBlur && onBlur(event)
  }

  onChange(event) {
    this.setState({ shouldShowValidationFeedback: false })

    this.props.onChange && this.props.onChange(event)
  }

  onKeyDown(event) {
    const { value } = event.target
    if (value.length === 0 && this.isSpaceKey(event.keyCode)) {
      return event.preventDefault()
    }
  }

  isSpaceKey(keyCode) {
    return keyCode === INPUT_CONSTANTS.SPACE_KEY_CODE
  }

  getClassNameByStatus() {
    const { ACTIVE_CLASS_NAME, EMPTY_CLASS_NAME, DISABLED_CLASS_NAME } =
      INPUT_CONSTANTS
    const isAlreadyActiveOrHasValue = this.state.isActive || !!this.props.value

    if (!isAlreadyActiveOrHasValue) {
      return EMPTY_CLASS_NAME
    }

    if (this.props.disabled) {
      return DISABLED_CLASS_NAME
    }

    return ACTIVE_CLASS_NAME
  }

  buildErrorClassName(currentClassName) {
    if (!this.shouldShowError()) {
      return INPUT_CONSTANTS.EMPTY_CLASS_NAME
    }

    return `${currentClassName}--${this.props.validation.type}`
  }

  disabledClassName() {
    if (this.props.disabled) {
      return INPUT_CONSTANTS.DISABLED_INPUT_CLASS_NAME
    }
  }

  shouldShowError() {
    const { validation } = this.props
    const hasValidationMessage = validation && validation.message

    return hasValidationMessage && this.state.shouldShowValidationFeedback
  }

  getClassName() {
    const isBig = this.props.size === SIZE.BIG

    return classNames(
      INPUT_CONSTANTS.INPUT_CLASS_NAME,
      { [INPUT_CONSTANTS.INPUT_CLASS_BIG]: isBig },
      this.buildErrorClassName(INPUT_CONSTANTS.INPUT_CLASS_NAME),
      this.disabledClassName(),
    )
  }

  getLabelClassName() {
    return classNames(
      INPUT_CONSTANTS.INPUT_CLASS_LABEL,
      this.getClassNameByStatus(),
    )
  }

  getErrorClassName() {
    const { MESSAGE_CLASS_NAME } = INPUT_CONSTANTS
    return `${MESSAGE_CLASS_NAME} ${this.buildErrorClassName(
      MESSAGE_CLASS_NAME,
    )}`
  }

  render() {
    const {
      validation,
      inputId,
      reference,
      label,
      datatest,
      children,
      t,
      ...rest
    } = this.props

    return (
      <div className={this.getClassName()}>
        <label className={this.getLabelClassName()}>{t(label)}</label>

        <div className="input-container">
          <input
            {...rest}
            className="ym-hide-content"
            id={inputId}
            aria-label={t(label)}
            ref={reference}
            onChange={this.onChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onKeyDown={this.onKeyDown}
            data-testid={datatest}
          />
          {children}
        </div>

        {this.shouldShowError() && (
          <p
            data-testid="input-error"
            className={this.getErrorClassName()}
            tabIndex={TAB_INDEX.ENABLED}
          >
            {t(validation.message)}
          </p>
        )}
      </div>
    )
  }
}

Input.propTypes = {
  inputId: PropTypes.string,
  type: PropTypes.string,
  size: PropTypes.oneOf([SIZE.BIG, SIZE.DEFAULT]),
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onBlur: PropTypes.func,
  validation: PropTypes.object,
  name: PropTypes.string,
  maxLength: PropTypes.number,
  reference: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  autoFocus: PropTypes.bool,
  autoComplete: PropTypes.oneOf([
    'off',
    'on',
    'new-password',
    'current-password',
    'email',
  ]),
  onFocus: PropTypes.func,
  datatest: PropTypes.string,
  tabIndex: PropTypes.number,
  disabled: PropTypes.bool,
  children: PropTypes.node,
  t: PropTypes.func.isRequired,
}

Input.defaultProps = {
  type: INPUT_CONSTANTS.TYPE_TEXT,
  value: '',
  autoFocus: false,
  disabled: false,
  autoComplete: 'on',
  datatest: 'input',
}

export default withTranslate(Input)
