import { Component } from 'react'
import { connect } from 'react-redux'

import { func, shape, string } from 'prop-types'

import { AddressClient } from 'app/address/client'
import { AddressPicker } from 'app/address/components/address-picker'
import { AddressFormContainer } from 'app/address/containers/address-form-container'
import { closeDeliveryArea } from 'app/delivery-area/actions'
import Modal, { TYPE } from 'components/modal'
import { Address } from 'domain/address'

class AddressModalContainer extends Component {
  state = {
    isAddressFormVisible: true,
    selectedAddress: null,
    hasAddresses: false,
    waitingApiResponse: true,
  }

  componentDidMount = () => {
    this.getAddresses()
  }

  getAddresses = async () => {
    const addresses = await AddressClient.getListByUserId(
      this.props.session.uuid,
    )

    if (addresses.length) {
      const selectedAddress = addresses.find(Address.isPermanent)
      this.showAddressPicker(selectedAddress, addresses)
      return
    }

    this.setState({ waitingApiResponse: false })
  }

  showAddressPicker = (selectedAddress, addresses) => {
    this.setState({
      addresses,
      selectedAddress,
      hasAddresses: true,
      isAddressFormVisible: false,
      waitingApiResponse: false,
    })
  }

  openForm = () => {
    this.setState({ isAddressFormVisible: true })
  }

  closeForm = () => {
    this.setState((currentState) => ({
      ...currentState,
      isAddressFormVisible: false,
    }))
  }

  selectAddress = (address) => {
    this.setState({ selectedAddress: address })
  }

  confirmSelectedAddress = async () => {
    const { session, closeDeliveryArea } = this.props

    await AddressClient.makeDefault(session.uuid, this.state.selectedAddress.id)

    closeDeliveryArea()
  }

  confirmAddedAddress = async (address) => {
    const { session, closeDeliveryArea } = this.props

    await AddressClient.makeDefault(session.uuid, address.id)

    closeDeliveryArea()
  }

  hasAddresses = () => {
    return this.state.hasAddresses
  }

  render = () => {
    const {
      isAddressFormVisible,
      selectedAddress,
      waitingApiResponse,
      addresses,
    } = this.state
    const { closeDeliveryArea } = this.props

    if (waitingApiResponse) {
      return null
    }

    return (
      <Modal
        onClose={closeDeliveryArea}
        title="address_list_title"
        type={TYPE.BIG}
      >
        {!isAddressFormVisible && (
          <AddressPicker
            waitingApiResponse={waitingApiResponse}
            addresses={addresses}
            selectAddress={this.selectAddress}
            selectedAddress={selectedAddress}
            showForm={this.openForm}
            closeList={closeDeliveryArea}
            confirmAddress={this.confirmSelectedAddress}
          />
        )}

        {isAddressFormVisible && (
          <AddressFormContainer
            onClose={this.closeForm}
            success={this.confirmAddedAddress}
            hasAddresses={this.hasAddresses}
          />
        )}
      </Modal>
    )
  }
}

AddressModalContainer.propTypes = {
  closeDeliveryArea: func.isRequired,
  session: shape({
    uuid: string.isRequired,
  }),
}

const mapDispatchToProps = {
  closeDeliveryArea,
}

const mapStateToProps = ({ session }) => ({ session })

const ComposedAddressModalContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddressModalContainer)

export { ComposedAddressModalContainer as AddressModalContainer }
