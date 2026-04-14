import { PostalCode } from '../PostalCode'

describe('PostalCode', () => {
  describe('isValidFormat', () => {
    it('return false if postalCode is undefined', () => {
      const postalCode = undefined

      const hasValidPostalCode = PostalCode.isValidFormat(postalCode)

      expect(hasValidPostalCode).toBeFalsy()
    })

    it('return false if have invalid length', () => {
      const postalCode = '1234567898765432'

      const hasValidPostalCode = PostalCode.isValidFormat(postalCode)

      expect(hasValidPostalCode).toBeFalsy()
    })

    it('return false if not contain only numbers', () => {
      const postalCode = '1234b'

      const hasValidPostalCode = PostalCode.isValidFormat(postalCode)

      expect(hasValidPostalCode).toBeFalsy()
    })

    it('return true if is valid format', () => {
      const postalCode = '12345'

      const hasValidPostalCode = PostalCode.isValidFormat(postalCode)

      expect(hasValidPostalCode).toBeTruthy()
    })
  })
})
