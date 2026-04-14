import { Card } from '../../card'

describe('Card', () => {
  describe('isValid method', () => {
    describe('when the expiration status is VALID', () => {
      it('should return true', () => {
        const card = { expirationStatus: Card.EXPIRATION_STATUSES.VALID }

        const isValid = Card.isValid(card)

        expect(isValid).toBeTruthy()
      })
    })

    describe('when the expiration status is not VALID', () => {
      it('should return false', () => {
        const card = { expirationStatus: 'a not valid expiration status' }

        const isValid = Card.isValid(card)

        expect(isValid).toBeFalsy()
      })
    })
  })

  describe('isAboutToExpire method', () => {
    describe('when the expiration status is EXPIRES_SOON', () => {
      it('should return true', () => {
        const card = {
          expirationStatus: Card.EXPIRATION_STATUSES.EXPIRES_SOON,
        }

        const isAboutToExpire = Card.isAboutToExpire(card)

        expect(isAboutToExpire).toBeTruthy()
      })
    })

    describe('when the expiration status is not EXPIRES_SOON', () => {
      it('should return false', () => {
        const card = {
          expirationStatus: 'a not about to expire expiration status',
        }

        const isAboutToExpire = Card.isAboutToExpire(card)

        expect(isAboutToExpire).toBeFalsy()
      })
    })
  })

  describe('isExpired method', () => {
    describe('when the expiration status is EXPIRED', () => {
      it('should return true', () => {
        const card = { expirationStatus: Card.EXPIRATION_STATUSES.EXPIRED }

        const isExpired = Card.isExpired(card)

        expect(isExpired).toBeTruthy()
      })
    })

    describe('when the expiration status is not EXPIRED', () => {
      it('should return false', () => {
        const card = { expirationStatus: 'a not expired expiration status' }

        const isExpired = Card.isExpired(card)

        expect(isExpired).toBeFalsy()
      })
    })
  })
})
