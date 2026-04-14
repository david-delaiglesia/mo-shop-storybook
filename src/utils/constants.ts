import { PATHS } from '../pages/paths'

const { VITE_DEFAULT_LANGUAGE, VITE_AVAILABLE_LANGUAGES } = import.meta.env

const defaultLanguage = VITE_DEFAULT_LANGUAGE
let availableLanguages = [VITE_DEFAULT_LANGUAGE]

if (VITE_AVAILABLE_LANGUAGES) {
  availableLanguages = JSON.parse(VITE_AVAILABLE_LANGUAGES)
}

export const SCREEN_SIZES = {
  EXTRA_HD_VIEW_PORT: 1440,
  HD_VIEW_PORT: 1200,
  LARGE_VIEW_PORT: 992,
  SMALL_VIEW_PORT: 648,
} as const

export const constants = {
  MIN_PURCHASE: 50,

  MEDIAQUERIES: {
    MEDIUMVIEWPORT: '(min-width: 768px)',
    LARGEVIEWPORT: '(min-width: 992px)',
    HDVIEWPORT: '(min-width: 1200px)',
    EXTRAHDVIEWPORT: '(min-width: 1440px)',
  },

  DISPLAY: {
    NONE: 'none',
    BLOCK: 'block',
  },

  CELL_WIDTH: 216,
  MAX_WATER_LITERS: 100,

  DEFAULT_PHONE_COUNTRY: 'ES',

  DEFAULT_LANGUAGE: defaultLanguage,
  AVAILABLE_LANGUAGES: availableLanguages,
} as const

export const TAB_INDEX = {
  ENABLED: 0,
  DISABLED: -1,
} as const

export const MOBILE_BLOCKER_WHITELIST = [
  PATHS.PASSWORD_RECOVERY,
  PATHS.SERVICE_RATING,
  PATHS.NOT_FOUND,
  PATHS.SERVER_ERROR,
] as const
