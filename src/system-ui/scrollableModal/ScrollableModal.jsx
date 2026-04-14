import { func, node, string } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'
import { BaseModal } from '@mercadona/mo.library.shop-ui/modal'

import './ScrollableModal.css'

const ScrollableModal = ({
  title,
  hideModal,
  primaryActionText,
  primaryAction,
  secondaryActionText,
  secondaryAction,
  children,
}) => {
  return (
    <BaseModal
      onClose={hideModal}
      aria-label={title}
      className="ui-scrollable-modal"
    >
      <h3 className="ui-scrollable-modal__title title2-b">{title}</h3>
      <div className="ui-scrollable-modal__content">{children}</div>
      <div className="ui-scrollable-modal__actions">
        {secondaryActionText && (
          <Button
            variant="secondary"
            fullWidth={true}
            onClick={secondaryAction}
          >
            {secondaryActionText}
          </Button>
        )}
        <Button variant="primary" fullWidth={true} onClick={primaryAction}>
          {primaryActionText}
        </Button>
      </div>
    </BaseModal>
  )
}

ScrollableModal.propTypes = {
  title: string.isRequired,
  primaryActionText: string.isRequired,
  primaryAction: func,
  secondaryActionText: string,
  secondaryAction: func,
  hideModal: func.isRequired,
  children: node,
}

export { ScrollableModal }
