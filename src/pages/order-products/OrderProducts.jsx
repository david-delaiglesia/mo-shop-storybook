import { Component } from 'react'
import { connect } from 'react-redux'

import { func, object } from 'prop-types'

import { unsetEditingOrderMode } from 'app/catalog/actions'
import { EditProductsContainer } from 'app/order/containers/edit-products-container'
import EditPurchaseProvider from 'app/order/containers/edit-purchase-provider'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'

class OrderProducts extends Component {
  componentDidMount() {
    this.props.setHeaderType(LayoutHeaderType.GO_BACK)
  }

  componentWillUnmount() {
    this.props.unsetEditingOrderMode()
  }

  render() {
    return (
      <EditPurchaseProvider
        currentState={this.props.currentState}
        currentDispatch={this.props.dispatch}
        blackList={[
          { key: 'cart', value: { id: crypto.randomUUID(), products: {} } },
        ]}
      >
        <EditProductsContainer orderId={this.props.match.params.id} />
      </EditPurchaseProvider>
    )
  }
}

OrderProducts.propTypes = {
  currentState: object,
  match: object.isRequired,
  setHeaderType: func.isRequired,
  dispatch: func.isRequired,
  unsetEditingOrderMode: func.isRequired,
}

const mapDispatchToProps = (dispatch) => ({
  setHeaderType: (headerType) => dispatch(setHeaderType(headerType)),
  unsetEditingOrderMode: () => dispatch(unsetEditingOrderMode()),
  dispatch,
})

const ConnectedOrderProducts = connect(
  (state) => ({ currentState: state }),
  mapDispatchToProps,
)(OrderProducts)

export { ConnectedOrderProducts as OrderProducts }
