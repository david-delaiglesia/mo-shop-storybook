import { matchPath } from 'react-router-dom'

import { PATHS } from 'pages/paths'

export function getCartMode(currentPath: string) {
  const isEditPage = matchPath(currentPath, { path: PATHS.EDIT_ORDER_PRODUCTS })

  if (isEditPage) {
    return 'edit' as const
  }

  return 'purchase' as const
}
