import ProgressBarConfirmed from './ProgressBarConfirmed.svg'
import ProgressBarDelivering from './ProgressBarDelivering.svg'
import ProgressBarIncidenceOne from './ProgressBarIncidenceOne.svg'
import ProgressBarIncidenceTwo from './ProgressBarIncidenceTwo.svg'
import ProgressBarPreparing from './ProgressBarPreparing.svg'

import { OrderStatusUI } from 'app/order'

type ProgressBarStatus =
  | OrderStatusUI
  | 'payment_failed'
  | 'reprepared_pending_payment'

const progressBarByStatus: Record<ProgressBarStatus, string | undefined> = {
  [OrderStatusUI.CONFIRMED]: ProgressBarConfirmed,
  [OrderStatusUI.PREPARING]: ProgressBarPreparing,
  [OrderStatusUI.PREPARED]: ProgressBarPreparing,
  [OrderStatusUI.DELIVERING]: ProgressBarDelivering,
  [OrderStatusUI.NEXT_TO_DELIVERY]: ProgressBarDelivering,
  payment_failed: ProgressBarIncidenceOne,
  reprepared_pending_payment: ProgressBarIncidenceOne,
  [OrderStatusUI.DISRUPTED_BY_CUSTOMER]: ProgressBarIncidenceTwo,
  [OrderStatusUI.DISRUPTED_BY_SYSTEM]: ProgressBarIncidenceTwo,

  [OrderStatusUI.DELIVERED]: undefined,
  [OrderStatusUI.CANCELLED_BY_USER]: undefined,
  [OrderStatusUI.CANCELLED_BY_SYSTEM]: undefined,
}

interface OrderStatusProgressBarProps {
  status: ProgressBarStatus
}

export const OrderStatusProgressBar = ({
  status,
}: OrderStatusProgressBarProps) => {
  return (
    <img
      role="progressbar"
      src={progressBarByStatus[status]}
      alt={status}
      aria-hidden
    />
  )
}
