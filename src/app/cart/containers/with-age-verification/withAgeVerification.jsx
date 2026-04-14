import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import ageImage from './assets/18@2x.png'
import { bool, func, number } from 'prop-types'

import { ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import {
  sendYearsoldCancelButtonClickViewMetrics,
  sendYearsoldConfirmationButtonClickViewMetrics,
  sendYearsoldModalViewMetrics,
} from 'app/order/metrics'
import { useModalContext } from 'app/shared/modal'

function withAgeVerification(WrappedComponent) {
  function WithAgeVerification(props) {
    const ModalService = useModalContext()
    const { t } = useTranslation()

    const dispatch = useDispatch()
    const { totalCart, requiresAgeCheck, confirm, cancel } = props

    const confirmButtonAction = async () => {
      ModalService.hideModal()
      sendYearsoldConfirmationButtonClickViewMetrics()
      await confirm()
    }

    const secondaryAction = () => {
      if (cancel) cancel()
      sendYearsoldCancelButtonClickViewMetrics()
      dispatch(hideAlert())
      ModalService.hideModal()
    }

    function showAgeConfirmationAlert() {
      sendYearsoldModalViewMetrics(totalCart)

      ModalService.showModal({
        size: ModalSize.MEDIUM,
        title: t('alerts.age_verification.title'),
        description: t('alerts.age_verification.message'),
        imageSrc: ageImage,
        primaryActionText: t('alerts.age_verification.confirm_button'),
        onPrimaryAction: confirmButtonAction,
        secondaryActionText: t('alerts.age_verification.cancel_button'),
        onSecondaryAction: secondaryAction,
      })
    }
    const buttonAction = requiresAgeCheck ? showAgeConfirmationAlert : confirm

    return (
      <Fragment>
        <WrappedComponent {...props} buttonAction={buttonAction} />
      </Fragment>
    )
  }

  WithAgeVerification.propTypes = {
    confirm: func.isRequired,
    cancel: func,
    requiresAgeCheck: bool.isRequired,
    totalCart: number.isRequired,
  }

  return WithAgeVerification
}

export default withAgeVerification
