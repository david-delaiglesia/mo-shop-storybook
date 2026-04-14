import { useEffect } from 'react'
import { matchPath, useLocation } from 'react-router-dom'

import { sendCleanOngoingOrderCartOnPageStart } from 'app/order/metrics'
import { PATHS } from 'pages/paths'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'

const CleanOngoingCart = () => {
  const location = useLocation()
  const matchEditionPath = matchPath(location.pathname, {
    path: PATHS.EDIT_ORDER_PRODUCTS,
  })

  useEffect(() => {
    if (matchEditionPath != null && matchEditionPath.isExact) return
    if (!Storage.getItem(STORAGE_KEYS.CART_TO_ONGOING_ORDER)) return

    Storage.removeItem(STORAGE_KEYS.CART_TO_ONGOING_ORDER)
    sendCleanOngoingOrderCartOnPageStart()
  }, [])

  return null
}

export { CleanOngoingCart }
