import { Component } from 'react'
import { connect } from 'react-redux'

import PropTypes from 'prop-types'

import { Tracker } from 'services/tracker'

function withInteractionMetrics(WrappedMetrics) {
  return (WrappedComponent) => {
    class WithInteractionMetrics extends Component {
      trackInteraction = (interactionName, options) => {
        if (options) {
          Tracker.sendInteraction(interactionName, options)
          Tracker.setSuperProperties()
          return
        }
        Tracker.sendInteraction(interactionName)
        Tracker.setSuperProperties()
      }

      composeChildComponent = (metricsEvents) => {
        return <WrappedComponent {...this.props} {...metricsEvents} />
      }

      render = () => {
        return (
          <WrappedMetrics
            {...this.props}
            trackInteraction={this.trackInteraction}
            source={this.props.source}
          >
            {this.composeChildComponent}
          </WrappedMetrics>
        )
      }
    }

    WithInteractionMetrics.WrappedComponent = WrappedComponent

    WithInteractionMetrics.displayName = `WithInteractionMetrics(${getDisplayName(
      WrappedComponent,
    )})`

    WithInteractionMetrics.propTypes = {
      source: PropTypes.string,
      isAuth: PropTypes.bool,
    }

    return connect(mapStateToProps)(WithInteractionMetrics)
  }
}

const getDisplayName = (wrappedComponent) => {
  if (!wrappedComponent) {
    return 'Component'
  }
  return wrappedComponent.displayName || wrappedComponent.name
}

const mapStateToProps = ({ session }) => ({
  isAuth: session.isAuth,
})

export default withInteractionMetrics
