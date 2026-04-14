import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { number } from 'prop-types'

import { OrderClient } from 'app/order/client'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import {
  sendUnsavedEditionModalClickMetrics,
  sendUnsavedEditionModalViewMetrics,
} from 'app/shared/metrics'
import alertCartIcon from 'system-ui/assets/img/alert_cart.png'

const DELAY_ALERT = 60 * 60 * 1000

export const OrderTimer = ({ orderId }) => {
  const dispatch = useDispatch()

  const [time, setTime] = useState(null)
  const session = useSelector((state) => state.session)

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(time)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [time])

  const handleIfDraftByCustomer = async () => {
    try {
      return await OrderClient.getIfCartDraftByCustomer(session.uuid)
    } catch {
      return
    }
  }

  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'hidden') {
      const idleTimeout = setTimeout(async () => {
        const isDraft = await handleIfDraftByCustomer()
        if (!isDraft) return
        showDraftAlert()
        sendUnsavedEditionModalViewMetrics(orderId, 'true')
      }, DELAY_ALERT)
      setTime(idleTimeout)
    } else {
      clearTimeout(time)
    }
  }

  const closeDraftAlert = () => {
    dispatch(hideAlert())
    clearTimeout(time)
  }

  const handleSeeChangesButton = () => {
    sendUnsavedEditionModalClickMetrics(orderId, 'view_changes')
    closeDraftAlert()
  }
  const handleLaterButton = () => {
    sendUnsavedEditionModalClickMetrics(orderId, 'view_later')
    closeDraftAlert()
  }

  const showDraftAlert = () => {
    const alertUnpublishedProducts = {
      imageSrc: alertCartIcon,
      title: 'draft_unsaved_changes_title',
      description: 'draft_unsaved_changes_body',
      confirmButtonText: 'draft_unsaved_changes_confirm',
      confirmButtonAction: () => handleSeeChangesButton(),
      secondaryActionText: 'draft_unsaved_changes_cancel',
      secondaryAction: () => handleLaterButton(),
    }
    dispatch(showAlert(alertUnpublishedProducts))
  }

  return <></>
}

OrderTimer.propTypes = {
  orderId: number.isRequired,
}
