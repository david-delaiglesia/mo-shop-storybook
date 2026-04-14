const SPAIN_POSTAL_CODE_LENGTH = 5
const POSTAL_CODE_REGEX = /^0[1-9][0-9]{3}|[1-4][0-9]{4}|5[0-2][0-9]{3}$/

export const PostalCode = {
  isValidFormat(postalCode) {
    return (
      postalCode &&
      POSTAL_CODE_REGEX.test(postalCode) &&
      postalCode.length === SPAIN_POSTAL_CODE_LENGTH
    )
  },
}
