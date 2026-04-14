import { Component } from 'react'
import { createPortal } from 'react-dom'

import { node } from 'prop-types'

class ModalInfoPortal extends Component {
  modalRoot = document.getElementById('modal-info')

  render() {
    return createPortal(this.props.children, this.modalRoot)
  }
}

ModalInfoPortal.propTypes = {
  children: node.isRequired,
}

export { ModalInfoPortal }
