import { Cookie } from 'services/cookie'

const { VITE_COOKIE_DOMAIN, VITE_USER_INFO } = import.meta.env

export function changeLanguageCookie(language) {
  const currentCookie = Cookie.get(VITE_USER_INFO) || {}

  currentCookie.language = language

  Cookie.save(currentCookie, VITE_USER_INFO, VITE_COOKIE_DOMAIN, {
    secure: true,
    samesite: 'none',
  })
}
