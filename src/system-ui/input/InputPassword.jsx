import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Input from '.'
import { bool, func, object, oneOf, oneOfType, string } from 'prop-types'

import './styles/InputPassword.css'

const InputPassword = (props) => {
  const [isPasswordVisible, setPasswordVisibility] = useState(false)
  const { t } = useTranslation()

  const togglePasswordVisibility = (event) => {
    event.preventDefault()
    if (!canBeShown()) {
      return
    }

    setPasswordVisibility(!isPasswordVisible)
  }

  const getPasswordIconClassName = () => {
    if (!canBeShown()) {
      return 'empty'
    }

    if (isPasswordVisible) {
      return 'shown'
    }

    return 'hidden'
  }

  const canBeShown = () => {
    const { passwordCanBeShown, password } = props
    return passwordCanBeShown && password && password.length
  }

  const getInputType = () => {
    return isPasswordVisible ? 'text' : 'password'
  }

  const {
    passwordCanBeShown,
    autoComplete,
    validation,
    autoFocus,
    reference,
    onChange,
    password,
    datatest,
    onBlur,
    label,
  } = props

  return (
    <div className="input-password">
      <Input
        validation={validation}
        type={getInputType()}
        name="password"
        label={label}
        value={password}
        onChange={onChange}
        autoComplete={autoComplete}
        onBlur={onBlur}
        autoFocus={autoFocus}
        reference={reference}
        datatest={datatest}
      />
      {passwordCanBeShown && (
        <button
          type="button"
          className="input-password__show-password"
          aria-label={t('accessibility_see_password')}
          onClick={togglePasswordVisibility}
          disabled={!canBeShown()}
        >
          <i
            className={`icon icon-pass-hidden-16 icon--${getPasswordIconClassName()}`}
          ></i>
        </button>
      )}
    </div>
  )
}

InputPassword.propTypes = {
  onChange: func.isRequired,
  onBlur: func,
  label: string,
  password: string,
  passwordCanBeShown: bool,
  autoComplete: oneOf(['off', 'new-password', 'current-password']),
  validation: object,
  autoFocus: bool,
  reference: oneOfType([func, object]),
  datatest: string,
}

InputPassword.defaultProps = {
  autoComplete: 'new-password',
  autoFocus: false,
  datatest: 'input-password',
}

export { InputPassword }
