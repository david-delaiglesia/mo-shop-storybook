import {
  isValidPhoneNumber,
  parsePhoneNumberWithError,
} from 'libphonenumber-js'

import { type CountryCode } from 'system-ui/input'

export const PhoneUtils = {
  formatPhoneNumber: ({
    countryCode,
    nationalNumber,
    country,
  }: {
    countryCode: string
    nationalNumber: string
    country?: CountryCode['isoCountryCode']
  }): string => {
    try {
      const parsedPhone = parsePhoneNumberWithError(
        `+${countryCode}${nationalNumber}`,
        country,
      )

      if (!parsedPhone) return `+${countryCode} ${nationalNumber}`
      return parsedPhone.formatInternational()
    } catch {
      return `+${countryCode} ${nationalNumber}`
    }
  },

  isValidPhone: (phone: {
    country: CountryCode['isoCountryCode']
    countryCode: string
    nationalNumber: string
  }): boolean => {
    const prefixedPhoneNumber = `+${phone.countryCode} ${phone.nationalNumber}`
    return isValidPhoneNumber(prefixedPhoneNumber, phone.country)
  },
}
