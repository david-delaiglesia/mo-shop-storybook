import { Component } from 'react'
import { connect } from 'react-redux'

import OfflineNotify from '../../components/offline-notify'
import { setOffline, setOnline } from './actions'
import { bool, func, shape } from 'prop-types'

import { compose, createThunk } from '@mercadona/mo.library.dashtil'

import { getFromStoreAndUpdateCartAfterOffline } from 'app/cart/commands'
import {
  sendLogNetworkRecoveredMetrics,
  sendLostConnectivityEditingOrderMetrics,
} from 'app/shared/metrics'

class OfflineInspectorContainer extends Component {
  componentDidMount = () => {
    window.addEventListener('offline', this.props.setOffline, false)
    window.addEventListener('online', this.recoversConnection, false)
  }

  componentWillUnmount = () => {
    window.removeEventListener('offline', this.props.setOffline)
    window.removeEventListener('online', this.recoversConnection)
  }

  recoversConnection = () => {
    const {
      getFromStoreAndUpdateCartAfterOffline,
      setOnline,
      editingOrder,
      network,
    } = this.props
    const disconnectionTime = Date.now() - network.offlineTimeStamp

    getFromStoreAndUpdateCartAfterOffline()

    setOnline()

    sendLogNetworkRecoveredMetrics(disconnectionTime)

    if (!editingOrder) return

    sendLostConnectivityEditingOrderMetrics()
  }

  render() {
    if (!this.props.network.isOffline) {
      return null
    }

    return <OfflineNotify />
  }
}

OfflineInspectorContainer.propTypes = {
  network: shape({
    isOffline: bool.isRequired,
  }).isRequired,
  getFromStoreAndUpdateCartAfterOffline: func.isRequired,
  setOffline: func.isRequired,
  setOnline: func.isRequired,
  editingOrder: bool,
}

const mapStateToProps = ({ network, ui: { productModal } }) => ({
  network,
  editingOrder: productModal.editingOrder,
})

const mapDispatchToProps = {
  setOffline,
  setOnline,
  getFromStoreAndUpdateCartAfterOffline: createThunk(
    getFromStoreAndUpdateCartAfterOffline,
  ),
}

const ComposedOfflineInspectorContainer = compose(
  connect(mapStateToProps, mapDispatchToProps),
)(OfflineInspectorContainer)

export { ComposedOfflineInspectorContainer as OfflineInspectorContainer }
