import { MOBILE_OS } from 'libs/mobile-detector'

const MOBILE_APP_STORE_URL = {
  [MOBILE_OS.IOS]: 'https://itunes.apple.com/app/apple-store/id1368037685',
  [MOBILE_OS.ANDROID]:
    'https://play.google.com/store/apps/details?id=es.mercadona.tienda',
}

const APP_NOT_FOUND_QUERY_STRING = 'appNotFound'

export { MOBILE_APP_STORE_URL, APP_NOT_FOUND_QUERY_STRING }
