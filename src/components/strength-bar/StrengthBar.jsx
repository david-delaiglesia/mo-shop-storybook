import { PureComponent } from 'react'

import {
  containsLetters,
  containsNumbers,
  containsSpecificWord,
  containsSymbols,
  containsUpperCase,
  isAsciiPrintable,
} from '../../utils/strings'
import { func, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { TAB_INDEX } from 'utils/constants'

import './styles/StrengthBar.css'

const MIN_PASSWORD_LENGTH = 5
const SAFE_PASSWORD_LENGTH = 11
const MIN_NUMBER_OF_PASSING_RULES = 2
export const RESERVED_WORDS = ['mercadona']
export const STRENGTH_TYPES = {
  SAFE: 'SAFE',
  WEAK: 'WEAK',
  INVALID: 'INVALID',
  DEFAULT: 'DEFAULT',
  WRONG_FORMAT: 'WRONG_FORMAT',
}

export class StrengthBar extends PureComponent {
  isValid() {
    return this.props.password.length > MIN_PASSWORD_LENGTH
  }

  isWeak() {
    const { password } = this.props
    const isSafeEnough =
      this.getNumberOfPassingRules() > MIN_NUMBER_OF_PASSING_RULES
    const isLong = password.length > SAFE_PASSWORD_LENGTH
    const containsReservedWords = this.getReservedWords().some(
      this.containsReservedWord(password),
    )
    return containsReservedWords || (!isSafeEnough && !isLong)
  }

  containsReservedWord(password) {
    return function (reservedWord) {
      return containsSpecificWord(password, reservedWord)
    }
  }

  getReservedWords() {
    const userName = this.props.email.split('@')[0]
    return [...RESERVED_WORDS, userName]
  }

  isSafe() {
    const { password } = this.props
    const isLong = password.length > SAFE_PASSWORD_LENGTH
    const isSafeEnough =
      this.getNumberOfPassingRules() > MIN_NUMBER_OF_PASSING_RULES
    return isLong || isSafeEnough
  }

  getNumberOfPassingRules() {
    const { password } = this.props
    const rulesToCheck = [
      containsLetters(password),
      containsNumbers(password),
      containsSymbols(password),
      containsUpperCase(password),
    ]

    return rulesToCheck.filter((isPassingRule) => isPassingRule).length
  }

  hasProperFormat() {
    return isAsciiPrintable(this.props.password)
  }

  getStrengthType() {
    if (!this.props.password || this.props.password.length === 0) {
      return STRENGTH_TYPES.DEFAULT
    }

    if (!this.hasProperFormat()) {
      return STRENGTH_TYPES.WRONG_FORMAT
    }

    if (!this.isValid()) {
      return STRENGTH_TYPES.INVALID
    }

    if (this.isWeak()) {
      return STRENGTH_TYPES.WEAK
    }

    if (this.isSafe()) {
      return STRENGTH_TYPES.SAFE
    }
  }

  getStrength() {
    const { t } = this.props
    const STRENGTH_TYPES = {
      SAFE: {
        message: t('password_strength_strong_description'),
        className: 'strength-bar--safe',
      },
      WEAK: {
        message: t('password_strength_weak_description'),
        className: 'strength-bar--weak',
      },
      INVALID: {
        message: t('password_strength_invalid_description'),
        className: 'strength-bar--invalid',
      },
      DEFAULT: {
        message: null,
        className: '',
      },
      WRONG_FORMAT: {
        message: t('password_invalid_characters'),
        className: 'strength-bar--wrong-format',
      },
    }

    return STRENGTH_TYPES[this.getStrengthType()]
  }

  render() {
    const { message, className } = this.getStrength()

    return (
      <div className={`strength-bar ${className}`} data-testid="strength-bar">
        <div className="strength-bar__level-indicator">
          <span className="strength-bar__level strength-bar__level--invalid"></span>
          <span className="strength-bar__level strength-bar__level--weak"></span>
          <span className="strength-bar__level strength-bar__level--safe"></span>
        </div>
        {message && (
          <p
            className="strength-bar__message caption1-sb"
            tabIndex={TAB_INDEX.ENABLED}
          >
            {message}
          </p>
        )}
      </div>
    )
  }
}

StrengthBar.propTypes = {
  password: string,
  email: string,
  t: func.isRequired,
}

StrengthBar.defaultProps = {
  password: '',
  email: '',
}

export default withTranslate(StrengthBar)
