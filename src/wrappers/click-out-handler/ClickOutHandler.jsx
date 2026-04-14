import { Component, createRef } from 'react'

import PropTypes from 'prop-types'

export function withClickOutside(WrappedComponent) {
  class WithClickOutside extends Component {
    constructor(props) {
      super(props)

      this.isClickBlocked = false

      this.contentRef = createRef()

      this.handleClickOutside = this.handleClickOutside.bind(this)
      this.blockClick = this.blockClick.bind(this)
      this.unBlockClick = this.unBlockClick.bind(this)
    }

    componentDidMount() {
      document.addEventListener('click', this.handleClickOutside)
      this.contentRef.current.addEventListener('mousedown', this.blockClick)
    }

    componentWillUnmount() {
      document.removeEventListener('click', this.handleClickOutside)
      this.contentRef.current.removeEventListener('mousedown', this.blockClick)
    }

    blockClick() {
      this.isClickBlocked = true
    }

    unBlockClick() {
      this.isClickBlocked = false
    }

    handleClickOutside(event) {
      if (!this.contentRef.current) return

      const isEventInsideContentRef = this.contentRef.current.contains(
        event.target,
      )

      if (!this.isClickBlocked && !isEventInsideContentRef) {
        return this.props.handleClickOutside()
      }

      this.unBlockClick()
    }

    render() {
      return (
        <div className="click-out" ref={this.contentRef}>
          <WrappedComponent {...this.props} />
        </div>
      )
    }
  }

  WithClickOutside.displayName = `withClickOutside(${getDisplayName(
    WrappedComponent,
  )})`

  WithClickOutside.propTypes = {
    handleClickOutside: PropTypes.func,
  }

  return WithClickOutside
}

function getDisplayName(WrappedComponent) {
  return (
    WrappedComponent && (WrappedComponent.displayName || WrappedComponent.name)
  )
}
