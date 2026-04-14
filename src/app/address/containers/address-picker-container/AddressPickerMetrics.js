import { Component } from 'react'

import { bool, func, object } from 'prop-types'

import { eventTypes } from 'wrappers/metrics'

class AddressPickerMetrics extends Component {
  componentDidMount = () => {
    this.initialAddressId = this.props.selectedAddress.id
  }

  onConfirm = () => {
    const { trackInteraction, confirmAddress, selectedAddress, forceOpenList } =
      this.props
    const changedAddress = selectedAddress.id !== this.initialAddressId

    const options = {
      changed_address: changedAddress,
      forced_selector: forceOpenList,
    }

    trackInteraction(eventTypes.CHANGE_ADDRESS_SUBMIT_CLICK, options)
    confirmAddress(selectedAddress)
  }

  render = () => {
    return this.props.children({ confirmAddress: this.onConfirm })
  }
}

AddressPickerMetrics.propTypes = {
  children: func.isRequired,
  trackInteraction: func,
  confirmAddress: func,
  selectedAddress: object.isRequired,
  forceOpenList: bool,
}

AddressPickerMetrics.defaultProps = {
  forceOpenList: false,
}

export { AddressPickerMetrics }
