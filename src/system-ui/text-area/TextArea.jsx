import { PureComponent } from 'react'

import { any, func, number, object, string } from 'prop-types'

import './styles/TextArea.css'

class TextArea extends PureComponent {
  statuses = {
    ACTIVE: 'text-area--active',
    INACTIVE: '',
  }
  counter = {
    HAS_ERRORS: 'text-area__counter--error',
    IS_FINE: '',
  }

  constructor() {
    super()

    this.state = {
      isActive: false,
    }

    this.onFocus = this.onFocus.bind(this)
    this.onBlur = this.onBlur.bind(this)
  }

  onFocus() {
    this.props.onFocus && this.props.onFocus()
    this.setState({ isActive: true })
  }

  onBlur() {
    const hasValue = !!this.props.value
    this.setState({ isActive: hasValue })
  }

  getStatusClassName() {
    if (this.state.isActive || this.props.value) {
      return this.statuses.ACTIVE
    }

    return this.statuses.INACTIVE
  }

  getCounterErrorClassName() {
    const { value, maxLength } = this.props

    if (value.length === maxLength) {
      return this.counter.HAS_ERRORS
    }

    return this.counter.IS_FINE
  }

  getCounterText() {
    const { value, maxLength, t } = this.props

    if (value.length === 0) {
      return t('comments_max_length_hint', { maxLength })
    }

    return t('comments_current_length_hint', {
      currentLength: value.length,
      maxLength,
    })
  }

  render() {
    const { label, name, rows, onChange, reference, value, maxLength, t } =
      this.props
    const counterText = this.getCounterText()

    return (
      <div className={`text-area ${this.getStatusClassName()}`}>
        <label className="text-area__label" htmlFor="text-area">
          {t(label)}
        </label>
        <textarea
          id="text-area"
          className="text-area__input ym-hide-content"
          data-testid="text-area"
          value={value}
          aria-label={t(label)}
          name={name}
          rows={rows}
          maxLength={maxLength}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onChange={onChange}
          ref={reference}
        />
        <span
          className={`text-area__counter ${this.getCounterErrorClassName()}`}
        >
          {counterText}
        </span>
      </div>
    )
  }
}

TextArea.propTypes = {
  label: string,
  name: string.isRequired,
  value: any,
  maxLength: number.isRequired,
  rows: number,
  onChange: func.isRequired,
  onFocus: func,
  reference: object,
  t: func.isRequired,
}

TextArea.defaultProps = {
  rows: 1,
  value: '',
  label: '',
}

export { TextArea }
