import { Component } from 'react'

import { bool, func, string } from 'prop-types'

import './styles/Checkbox.css'

class Checkbox extends Component {
  buildID(seed) {
    if (!seed) {
      return this.getRandomID()
    }

    return seed.replace(' ', '-')
  }

  getRandomID() {
    const MIN = 1
    const MAX = 9999
    return Math.floor(Math.random() * (MAX - MIN)) + MIN
  }

  render() {
    const { checked, inputLabel, label, onChange } = this.props
    const id = this.buildID(label)

    return (
      <div className="checkbox">
        <input
          id={id}
          {...(inputLabel && { 'aria-label': inputLabel })}
          className="checkbox__input"
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <label htmlFor={id} className="checkbox__label" role="checkbox">
          {label}
        </label>
      </div>
    )
  }
}

Checkbox.propTypes = {
  checked: bool,
  onChange: func,
  label: string,
  inputLabel: string,
}

export default Checkbox
