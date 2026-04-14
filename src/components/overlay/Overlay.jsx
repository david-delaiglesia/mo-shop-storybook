import { Component } from 'react'

import { bool, func, node } from 'prop-types'

import { createScrollBlocker } from 'libs/scroll-blocker'

import './styles/Overlay.css'

export const OVERLAY_CLASS = {
  OVERLAY_SHOW: 'overlay--show',
}

class Overlay extends Component {
  state = {
    showClass: '',
  }

  overlayBlocker = null

  componentDidMount() {
    this.scrollBlocker = createScrollBlocker()
    this.changeOverlayState(this.props.open)
  }

  componentDidUpdate(prevProps) {
    const { open: prevOpen } = prevProps
    const { open } = this.props

    if (open !== prevOpen) {
      this.changeOverlayState(open)
    }
  }

  componentWillUnmount() {
    this.scrollBlocker.unBlock()
  }

  changeOverlayState(open) {
    if (open) {
      this.scrollBlocker.block()
      return this.setState({ showClass: OVERLAY_CLASS.OVERLAY_SHOW })
    }
    this.scrollBlocker.unBlock()
    return this.setState({ showClass: '' })
  }

  render() {
    const { onClick, children } = this.props
    return (
      <div
        className={'overlay ' + this.state.showClass}
        data-testid="overlay-container"
      >
        <div
          className="overlay__background"
          data-testid="overlay"
          onClick={onClick}
        />
        {children}
      </div>
    )
  }
}

Overlay.propTypes = {
  children: node.isRequired,
  open: bool.isRequired,
  onClick: func,
}

export { Overlay }
