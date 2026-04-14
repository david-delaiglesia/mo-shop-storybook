import { CountryCode as IsoCountryCode } from 'libphonenumber-js'

export interface CountryCode {
  phoneCountryCode: string
  flag: string
  isoCountryCode: IsoCountryCode
}
