import { array, func } from 'prop-types'

import { SnackBarInfo } from '@mercadona/mo.library.shop-ui/snack-bar-info'

import './styles/SnackBars.css'

const SnackBars = ({ notifications, deleteNotification }) => (
  <div className="snack-bars">
    {notifications.map((notification) => (
      <SnackBarInfo
        key={notification.uuid}
        uuid={notification.uuid}
        text={notification.text}
        remove={deleteNotification}
      />
    ))}
  </div>
)

SnackBars.propTypes = {
  notifications: array.isRequired,
  deleteNotification: func.isRequired,
}

export { SnackBars }
