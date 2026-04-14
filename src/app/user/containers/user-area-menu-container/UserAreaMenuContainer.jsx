import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router'

import { UserAreaMenu } from '../../components/user-area-menu'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { logout } from 'app/authentication/commands'
import { sendLogoutClickMetrics } from 'app/authentication/metrics'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import { useUser } from 'app/user'
import { PATHS } from 'pages/paths'

const menuOptions = [
  {
    to: PATHS.USER_AREA_ORDERS,
    label: 'user_area.menu.orders',
    icon: 'orders-28',
  },
  {
    to: PATHS.USER_AREA_PERSONAL_INFO,
    label: 'user_area.menu.personal_info',
    icon: 'account-28',
  },
  {
    to: PATHS.USER_AREA_ADDRESS,
    label: 'user_area.menu.addresses',
    icon: 'pin-28',
  },
  {
    to: PATHS.USER_AREA_PAYMENTS,
    label: 'user_area.menu.payment_methods',
    icon: 'card-small-28',
  },
]

export const UserAreaMenuContainer = () => {
  const history = useHistory()
  const { user } = useUser()
  const dispatch = useDispatch()

  const handleLogout = () => {
    sendLogoutClickMetrics()
    history.push(PATHS.HOME)
    dispatch(createThunk(logout)())
    dispatch(hideAlert())
  }

  const handleToggleLogoutAlert = () => {
    dispatch(
      showAlert({
        title: 'alerts.log_out.title',
        description: {
          key: 'alerts.log_out.message',
          interpolation: { userName: user.name },
        },
        confirmButtonText: 'alerts.log_out.close_session',
        confirmButtonAction: handleLogout,
        secondaryActionText: 'button.cancel',
        secondaryAction: () => dispatch(hideAlert()),
      }),
    )
  }

  return (
    <UserAreaMenu
      menu={menuOptions}
      toggleLogoutAlert={handleToggleLogoutAlert}
    />
  )
}
