import { PATHS } from 'pages/paths'

export const INTERACTION_EVENTS = {
  POSTAL_CODE_CONFIRMATION_CLICK: 'voyeur_modal_postal_code_confirmation_click',
  GO_TO_CLASSIC_CLICK: 'voyeur_modal_go_to_classic_click',
  RETRY_POSTAL_CODE_CLICK: 'voyeur_modal_postal_code_retry_click',
  NOTIFY_ME_CLICK: 'voyeur_modal_notify_me_click',
  NOTIFY_ME_CONFIRMATION: 'voyeur_modal_notify_me_confirmation_click',
  GO_TO_LANDING_CLICK: 'voyeur_modal_go_mercadonaes_click',
}

export const VIEW_CHANGE_EVENTS = {
  VOYEUR_MODAL: 'voyeur_modal',
}

export const PATHS_WITHOUT_POSTAL_CODE = [
  PATHS.PASSWORD_RECOVERY,
  PATHS.SERVICE_RATING,
  PATHS.PRODUCT,
  PATHS.PRODUCT_SLUG,
  PATHS.NOT_FOUND,
  PATHS.SERVER_ERROR,
]

export const ONBOARDING_URLS = [
  PATHS.HOME,
  PATHS.CATEGORIES,
  PATHS.CATEGORY,
  PATHS.SEARCH_RESULTS,
]

export const WAREHOUSE = {
  VLC1: 'vlc1',
  BCN1: 'bcn1',
}

export const OLD_URL = 'https://www.mercadona.es/ns/entrada.php?js=1&nidioma='

export const OLD_SHOP_LANGUAGES_ID = {
  es: 1,
  ca: 2,
  vai: 3,
  en: 5,
}

export const DEFAULT_WAREHOUSE = WAREHOUSE.VLC1
