import { Component } from 'react'
import { connect } from 'react-redux'

import { toggleModal } from './actions'
import classNames from 'classnames'
import { bool, func, node, oneOf, shape, string } from 'prop-types'
import { bindActionCreators } from 'redux'

import { FocusTrap } from '@mercadona/mo.library.shop-ui/accessibility'

import { ModalContent } from 'components/modal-content'
import { createScrollBlocker } from 'libs/scroll-blocker'

import './styles/Modal.css'

export const TYPE = {
  SMALL: 'small',
  MEDIUM: 'medium',
  BIG: 'big',
}

/**
 * @deprecated Use Modal from @mercadona/mo.library.shop-ui/modal instead
 */
class Modal extends Component {
  scrollBlocker = null

  componentDidMount = () => {
    this.scrollBlocker = createScrollBlocker()
    this.scrollBlocker.block()
    this.props.actions.toggleModal()
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount = () => {
    this.props.actions.toggleModal()
    this.scrollBlocker.unBlock()
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown = (event) => {
    const { onClose } = this.props
    if (event.key !== 'Escape') return

    if (!onClose) return
    onClose(event)

    event.stopPropagation()
  }

  handleClickOutside = (event) => {
    const { clickout, onClose } = this.props

    if (!clickout || !onClose) return

    onClose(event)
  }

  render = () => {
    const { datatest, type, className } = this.props

    const computedClassName = classNames(
      'modal',
      { [`modal--${type}`]: type },
      { [className]: className },
    )

    return (
      <FocusTrap restoreFocus>
        <div className={computedClassName} data-testid={datatest}>
          <div
            data-testid="mask"
            className="modal__click-outside"
            onClick={this.handleClickOutside}
          />
          <div>
            <ModalContent {...this.props} />
          </div>
        </div>
      </FocusTrap>
    )
  }
}

export const mapDispatchToProps = (dispatch) => ({
  actions: {
    toggleModal: bindActionCreators(toggleModal, dispatch),
  },
})

Modal.propTypes = {
  children: node.isRequired,
  title: string,
  onClose: func,
  clickout: bool,
  blockScroll: bool,
  isFocusDisabled: bool,
  actions: shape({
    toggleModal: func.isRequired,
  }).isRequired,
  datatest: string,
  type: oneOf([TYPE.SMALL, TYPE.MEDIUM, TYPE.BIG]).isRequired,
  className: string,
}

Modal.defaultProps = {
  clickout: true,
  blockScroll: false,
  datatest: 'modal',
  type: TYPE.MEDIUM,
}

/** @deprecated Use Modal from @mercadona/mo.library.shop-ui/modal instead */
const ModalConnected = connect(null, mapDispatchToProps)(Modal)

export const PlainModal = Modal

export default ModalConnected
