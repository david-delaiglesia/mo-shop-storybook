import { connect } from 'react-redux'

import { deleteNotification } from './actions'
import { array, func } from 'prop-types'

import { SnackBars } from 'components/snack-bars'

const NotificationsContainer = ({ notifications, deleteNotification }) => {
  return (
    <SnackBars
      notifications={notifications}
      deleteNotification={deleteNotification}
    />
  )
}

NotificationsContainer.propTypes = {
  notifications: array,
  deleteNotification: func,
}

const mapStateToProps = ({ notifications }) => ({
  notifications,
})

const mapDispatchToProps = {
  deleteNotification,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NotificationsContainer)
