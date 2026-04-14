const EXPIRATION_STATUSES = {
  VALID: 'valid',
  EXPIRES_SOON: 'expires_soon',
  EXPIRED: 'expired',
}

const TYPES = {
  0: 'unknown',
  1: 'visa',
  2: 'mastercard',
  // 3 : 'discover',
  // 4 : 'amex',
  // 5 : 'diners',
  // 6 : 'unionpay',
  // 7 : 'jcb',
  8: 'maestro',
}

function isValid(card) {
  return card.expirationStatus === EXPIRATION_STATUSES.VALID
}

function isAboutToExpire(card) {
  return card.expirationStatus === EXPIRATION_STATUSES.EXPIRES_SOON
}

function isExpired(card) {
  return card.expirationStatus === EXPIRATION_STATUSES.EXPIRED
}

function isDefault(card) {
  return card.defaultCard
}

function getExpiryDateMMYY(card) {
  const { expiresMonth, expiresYear } = card
  const shortYear = expiresYear.slice(-2)

  return `${expiresMonth}/${shortYear}`
}

export const Card = {
  EXPIRATION_STATUSES,
  TYPES,
  isValid,
  isAboutToExpire,
  isExpired,
  isDefault,
  getExpiryDateMMYY,
}
