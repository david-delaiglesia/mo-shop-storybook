import { Component } from 'react'
import { connect } from 'react-redux'

import { AddressPicker } from '../../components/address-picker'
import { bool, func, object, shape, string } from 'prop-types'

import { AddressClient } from 'app/address/client'

class AddressPickerContainer extends Component {
  state = {
    waitingApiResponse: true,
    addresses: undefined,
  }

  componentDidMount = () => {
    this.getUserAddresses()
  }

  getUserAddresses = async () => {
    const addresses = await AddressClient.getListByUserId(
      this.props.session.uuid,
    )
    this.setState({ waitingApiResponse: false })

    if (!addresses.length) {
      this.props.showForm()
      return
    }

    if (!addresses.length) {
      this.props.showForm()
      return
    }

    if (addresses.length === 1 && !this.props.hasEditedAddress) {
      this.setState(() => ({ addresses }))
      this.props.selectAddress(addresses[0])
      this.props.closeList()
      return
    }

    this.setState({ addresses })
  }

  confirm = () => {
    this.props.closeList()
    this.props.confirmAddress(this.props.selectedAddress)
  }

  render() {
    return (
      <AddressPicker
        showMargins
        waitingApiResponse={this.state.waitingApiResponse}
        addresses={this.state.addresses}
        title="commons.order.order_delivery.address_list.title"
        selectAddress={this.props.selectAddress}
        selectedAddress={this.props.selectedAddress}
        showForm={this.props.showForm}
        closeList={this.props.closeList}
        confirmAddress={this.confirm}
      />
    )
  }
}

const mapStateToProps = ({ session }) => ({ session })

AddressPickerContainer.propTypes = {
  session: shape({
    uuid: string.isRequired,
  }).isRequired,
  selectedAddress: object.isRequired,
  selectAddress: func.isRequired,
  showForm: func.isRequired,
  confirmAddress: func.isRequired,
  closeList: func.isRequired,
  hasEditedAddress: bool,
}

const ComposedAddressPickerContainer = connect(mapStateToProps)(
  AddressPickerContainer,
)

export { ComposedAddressPickerContainer as AddressPickerContainer }
