import { Component } from 'react'
import { connect } from 'react-redux'

import { setPendingAction } from './actions'
import { bool, func, shape, string } from 'prop-types'
import { bindActionCreators } from 'redux'

function withFeedback(WrappedComponent) {
  class WithFeedback extends Component {
    state = {
      uuid: '',
      activeFeedback: false,
    }

    constructor(props) {
      super(props)

      this.setFeedback = this.setFeedback.bind(this)
    }

    componentDidUpdate(prevProps) {
      const { pendingActionUuid } = this.props
      const { pendingActionUuid: prevPendingActionUuid } = prevProps

      if (pendingActionUuid === prevPendingActionUuid) {
        return
      }

      const { uuid } = this.state

      const shouldEnableFeedback = uuid.length > 0 && pendingActionUuid === uuid
      const shouldDisableFeedback =
        !pendingActionUuid && prevPendingActionUuid === uuid

      if (shouldEnableFeedback) {
        return this.setState({ activeFeedback: true })
      }

      if (shouldDisableFeedback) {
        return this.setState({ activeFeedback: false })
      }
    }

    setFeedback(event) {
      const { autoBlock, pendingActionUuid, isAsync, actions, onClick } =
        this.props
      const isActionBlocked = autoBlock && pendingActionUuid

      if (event) {
        event.preventDefault()
      }

      if (!isAsync) {
        onClick()
        return
      }

      if (isActionBlocked) {
        return
      }

      const actionUuid = crypto.randomUUID()
      actions.setPendingAction(actionUuid)
      this.setUuid(actionUuid)
      onClick(actionUuid)
    }

    setUuid(uuid) {
      this.setState({ uuid })
    }

    render() {
      const { ...wrappedComponentProps } = this.props

      return (
        <WrappedComponent
          {...wrappedComponentProps}
          onClick={this.setFeedback}
          activeFeedback={this.state.activeFeedback}
        />
      )
    }
  }

  WithFeedback.propTypes = {
    onClick: func.isRequired,
    pendingActionUuid: string,
    autoBlock: bool,
    actions: shape({
      setPendingAction: func.isRequired,
    }).isRequired,
    isAsync: bool,
  }

  WithFeedback.defaultProps = {
    isAsync: true,
  }

  function mapStateToProps({ pendingActionUuid }) {
    return {
      pendingActionUuid: pendingActionUuid,
    }
  }

  function mapDispatchToProps(dispatch) {
    const actions = {
      setPendingAction: bindActionCreators(setPendingAction, dispatch),
    }
    return { actions }
  }

  const WithFeedbackConnected = connect(
    mapStateToProps,
    mapDispatchToProps,
  )(WithFeedback)

  return WithFeedbackConnected
}

export default withFeedback
