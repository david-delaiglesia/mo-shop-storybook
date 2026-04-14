import { COOKIES, NECESSARY_COOKIES } from './constants'

import { Cookie } from '@mercadona/mo.library.web-services/cookies'

const ACCEPTED_COOKIES = import.meta.env.VITE_ACCEPTED_COOKIES

function areThirdPartyAccepted() {
  const cookie = Cookie.get(ACCEPTED_COOKIES)
  if (!cookie) return false
  return !!cookie.thirdParty
}

const isNecessary = (cookieName) => {
  return (
    NECESSARY_COOKIES.includes(cookieName) ||
    cookieName.startsWith(COOKIES.AMPLITUDE)
  )
}

const CookieService = {
  ...Cookie,
  areThirdPartyAccepted,
  isNecessary,
}

export { CookieService as Cookie }
