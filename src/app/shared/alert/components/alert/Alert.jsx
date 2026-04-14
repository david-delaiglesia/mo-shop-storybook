import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { MediumModal, SmallModal } from '@mercadona/mo.library.shop-ui/modal'

import { hideAlert as hideAlertAction } from 'app/shared/alert/actions'

const ALERT_SIZES = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
}

const Alert = () => {
  const {
    visible,
    size = ALERT_SIZES.SMALL,
    title,
    description,
    imageSrc,
    imageAlt = '',
    confirmButtonText = 'button.agreed',
    confirmButtonAction,
    secondaryActionText,
    secondaryAction,
    mood = 'positive',
    handleLoading = false,
    children,
  } = useSelector(({ ui }) => ui.alert)
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const hideAlert = () => {
    dispatch(hideAlertAction())
  }

  const getDescriptionText = () => {
    if (!description) return ''

    if (description.key) {
      return t(description.key, description.interpolation)
    }

    return t(description)
  }

  if (!visible) return null

  const isMediumModal = size === ALERT_SIZES.MEDIUM || imageSrc
  const hasSecondaryButton = secondaryActionText && secondaryAction

  const descriptionForAriaLabel = getDescriptionText()
    ? `. ${getDescriptionText()}`
    : ''

  const ariaLabel = `${t(title)}${descriptionForAriaLabel}`

  const baseProps = {
    ariaLabel,
    title: t(title),
    description: getDescriptionText(),
    primaryActionText: t(confirmButtonText),
    primaryAction: confirmButtonAction || hideAlert,
    handleLoading,
    loadingText: t('aria_loading'),
    hideModal: hideAlert,
    ...(hasSecondaryButton && {
      secondaryActionText: t(secondaryActionText),
      secondaryAction,
    }),
    mood: mood,
  }

  if (isMediumModal) {
    return createPortal(
      <MediumModal
        ariaLabel={ariaLabel}
        {...baseProps}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
      >
        {children}
      </MediumModal>,
      document.getElementById('modal-info'),
    )
  }
  return createPortal(
    <SmallModal {...baseProps} />,
    document.getElementById('modal-info'),
  )
}

export { Alert, ALERT_SIZES }
