import { Component } from 'react'
import { connect } from 'react-redux'

import { func, string } from 'prop-types'

function withBlockCancelActions(WrappedComponent) {
  class WithBlockCancelActions extends Component {
    constructor() {
      super()

      this.onCancel = this.onCancel.bind(this)
      this.onClose = this.onClose.bind(this)
    }

    onCancel() {
      const { onCancel } = this.props

      this.launchAction(onCancel)
    }

    onClose() {
      const { onClose, onCancel, onConfirm } = this.props
      const onCloseAction = onClose || onCancel || onConfirm

      this.launchAction(onCloseAction)
    }

    launchAction(callback) {
      const { pendingActionUuid } = this.props

      if (pendingActionUuid) {
        return
      }

      callback()
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          onCancel={this.onCancel}
          onClose={this.onClose}
        />
      )
    }
  }

  WithBlockCancelActions.WrappedComponent = WrappedComponent

  WithBlockCancelActions.displayName = `WithEnterKeyPress(${getDisplayName(
    WrappedComponent,
  )})`

  WithBlockCancelActions.propTypes = {
    onConfirm: func.isRequired,
    onCancel: func,
    onClose: func,
    pendingActionUuid: string,
  }

  const WithBlockCancelActionsConnected = connect(mapStateToProps)(
    WithBlockCancelActions,
  )

  return WithBlockCancelActionsConnected
}

function mapStateToProps({ pendingActionUuid }) {
  return {
    pendingActionUuid: pendingActionUuid,
  }
}

const getDisplayName = (wrappedComponent) => {
  if (!wrappedComponent) {
    return 'Component'
  }
  return wrappedComponent.displayName || wrappedComponent.name
}

export default withBlockCancelActions
