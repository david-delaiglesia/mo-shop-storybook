import { PATHS } from '../pages/paths'

const isPathWithRecommendedQuantity = () => {
  if (!window.location.pathname || !window.location.pathname.endsWith) {
    return false
  }

  const params = new URLSearchParams(window.location.search)
  const isEditOrderMyRegularsTab =
    window.location.pathname.includes('/edit/products') &&
    params.get('my-regulars') === 'true'

  return (
    window.location.pathname === PATHS.SHOPPING_LISTS_MY_REGULARS ||
    window.location.pathname.startsWith(PATHS.SHOPPING_LISTS) ||
    window.location.pathname === PATHS.MY_REGULARS ||
    isEditOrderMyRegularsTab
  )
}

const isHomePagePath = (path: string) => {
  if (!window?.location?.pathname || !window?.location?.pathname?.includes) {
    return false
  }

  return path === PATHS.HOME || path?.includes('/home/')
}

export const LocationService = {
  isHomePagePath,
  isPathWithRecommendedQuantity,
}
