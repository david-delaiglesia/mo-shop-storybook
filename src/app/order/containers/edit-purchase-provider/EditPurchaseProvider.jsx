import { Component } from 'react'
import { Provider } from 'react-redux'

import createEditPurchaseStore from './createEditPurchaseStore'
import PropTypes from 'prop-types'

class EditPurchaseProvider extends Component {
  constructor(props) {
    super(props)

    let initialState = this.cleanInitialState(
      this.props.currentState,
      this.props.blackList,
    )

    this.store = createEditPurchaseStore(
      this.props.name,
      initialState,
      this.props.currentDispatch,
    )
  }

  cleanInitialState(currentState = {}, blackList = []) {
    let initialState = { ...currentState }

    for (let i = blackList.length - 1; i >= 0; i -= 1) {
      const { key, value } = blackList[i]
      initialState[key] = value
    }

    return initialState
  }

  render() {
    return <Provider store={this.store}>{this.props.children}</Provider>
  }
}

EditPurchaseProvider.propTypes = {
  name: PropTypes.string,
  currentState: PropTypes.object,
  currentDispatch: PropTypes.func.isRequired,
  blackList: PropTypes.array,
  children: PropTypes.node.isRequired,
}

export default EditPurchaseProvider
