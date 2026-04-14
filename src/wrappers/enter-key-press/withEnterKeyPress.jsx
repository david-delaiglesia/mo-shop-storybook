import { PureComponent } from 'react'

import { bool, func } from 'prop-types'

const withEnterKeyPress = (WrappedComponent) => {
  class WithEnterKeyPress extends PureComponent {
    constructor(props) {
      super(props)

      this.onEnterKeyPress = this.onEnterKeyPress.bind(this)
    }

    hasPressedAKey(type) {
      return type === 'keypress'
    }

    isEnterKey(key) {
      return key === 'Enter'
    }

    onEnterKeyPress(event) {
      const { type, key } = event

      const { onEnterKeyPress, shouldPerformKeyPress } = this.props

      if (this.hasPressedAKey(type) && !this.isEnterKey(key)) {
        return
      }

      if (this.isEnterKey(key) && !shouldPerformKeyPress) {
        return event.preventDefault()
      }

      event.preventDefault()
      event.target.blur()
      onEnterKeyPress && onEnterKeyPress()
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          onEnterKeyPress={this.onEnterKeyPress}
        />
      )
    }
  }

  WithEnterKeyPress.WrappedComponent = WrappedComponent

  WithEnterKeyPress.displayName = `WithEnterKeyPress(${getDisplayName(
    WrappedComponent,
  )})`

  WithEnterKeyPress.propTypes = {
    onEnterKeyPress: func,
    shouldPerformKeyPress: bool,
  }

  WithEnterKeyPress.defaultProps = {
    shouldPerformKeyPress: true,
  }

  return WithEnterKeyPress
}

const getDisplayName = (wrappedComponent) => {
  if (!wrappedComponent) {
    return 'Component'
  }
  return wrappedComponent.displayName || wrappedComponent.name
}

export default withEnterKeyPress
