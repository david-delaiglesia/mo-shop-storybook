import { BaseModal } from './BaseModal'
import { MOOD } from './constants'
import classNames from 'classnames'
import { bool, func, node, oneOf, string } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'
import { MOOD as BUTTON_MOOD } from '@mercadona/mo.library.shop-ui/button/constants'

import './styles/SmallModal.css'

const SmallModal = ({
  className,
  title,
  description,
  hideModal,
  primaryActionText,
  primaryAction,
  primaryActionDisabled,
  primaryActionLoading,
  secondaryActionText,
  secondaryAction,
  imageSrc,
  imageAlt,
  mood = MOOD.POSITIVE,
  handleLoading = false,
  loadingText,
  children,
}) => {
  const showActions = primaryAction && primaryActionText
  const showSecondaryButton = secondaryAction && secondaryActionText
  const buttonMoods = {
    [MOOD.POSITIVE]: {
      primary: BUTTON_MOOD.POSITIVE,
      secondary: BUTTON_MOOD.POSITIVE,
    },
    [MOOD.DESTRUCTIVE]: {
      primary: BUTTON_MOOD.DESTRUCTIVE,
      secondary: BUTTON_MOOD.NEUTRAL,
    },
  }

  return (
    <BaseModal
      onClose={hideModal}
      aria-label={title}
      className={classNames('ui-small-modal', className)}
    >
      {imageSrc && (
        <img className="ui-small-modal__image" src={imageSrc} alt={imageAlt} />
      )}
      <p className="ui-small-modal__title title2-b">{title}</p>
      {description && (
        <p className="ui-small-modal__description body1-r">{description}</p>
      )}
      {children}
      {showActions && (
        <div className="ui-small-modal__actions">
          {showSecondaryButton && (
            <Button
              variant="secondary"
              fullWidth={true}
              mood={buttonMoods[mood].secondary}
              onClick={secondaryAction}
              disabled={primaryActionLoading}
            >
              {secondaryActionText}
            </Button>
          )}
          <Button
            variant="primary"
            mood={buttonMoods[mood].primary}
            fullWidth={true}
            onClick={primaryAction}
            handleLoading={handleLoading}
            loadingText={loadingText}
            disabled={primaryActionDisabled}
            loading={primaryActionLoading}
          >
            {primaryActionText}
          </Button>
        </div>
      )}
    </BaseModal>
  )
}

SmallModal.propTypes = {
  title: string.isRequired,
  description: string,
  className: string,
  primaryActionText: string,
  primaryAction: func,
  primaryActionDisabled: bool,
  primaryActionLoading: bool,
  secondaryActionText: string,
  secondaryAction: func,
  imageSrc: string,
  imageAlt: string,
  hideModal: func.isRequired,
  mood: oneOf([MOOD.POSITIVE, MOOD.DESTRUCTIVE]),
  children: node,
  handleLoading: bool,
  loadingText: string,
}

export { SmallModal }
