import { PureComponent } from 'react'

import classNames from 'classnames'
import { bool, func, node, string } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'
import { Icon } from '@mercadona/mo.library.shop-ui/icon/Icon'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

import './styles/ModalContent.css'

class ModalContent extends PureComponent {
  componentDidMount() {
    if (!this.props.ariaFocus) {
      return
    }

    this.props.ariaFocus()
  }

  render() {
    const {
      onClose,
      title,
      children,
      ariaLabelModal,
      ariaLabelClose,
      t,
      showButtonModal = false,
    } = this.props

    return (
      <div
        className="modal-content"
        role="dialog"
        aria-label={t(ariaLabelModal)}
      >
        <div
          className={classNames('modal-content__header', {
            'modal-content__without-header': !onClose,
          })}
        >
          {showButtonModal && (
            <button
              type="button"
              data-testid="modal-close-button"
              className="modal-content__close"
              onClick={onClose}
              aria-label={t(ariaLabelClose)}
            >
              <Icon icon="close" />
            </button>
          )}
          {title && <span className="modal-content__title">{t(title)}</span>}
        </div>
        {children}
      </div>
    )
  }
}

ModalContent.propTypes = {
  title: string,
  children: node.isRequired,
  onClose: func,
  ariaLabelModal: string,
  ariaLabelClose: string,
  ariaFocus: func,
  t: func,
  showButtonModal: bool,
}

ModalContent.defaultProps = {
  ariaLabelClose: 'dialog_close',
}

const ComposedModalContent = compose(withTranslate)(ModalContent)

export { ComposedModalContent as ModalContent }
