import { Card, CardService } from '../../card'

describe('CardService', () => {
  describe('hasAtLeastOneValidCard', () => {
    const { EXPIRED, VALID } = Card.EXPIRATION_STATUSES

    describe('when does NOT have any card', () => {
      it('should return false', () => {
        const cards = []

        const hasAtLeastOneValidCard = CardService.hasAtLeastOneValidCard(cards)

        expect(hasAtLeastOneValidCard).toBeFalsy()
      })
    })

    describe('when all the cards are expired', () => {
      it('should return false', () => {
        const cards = [{ expirationStatus: EXPIRED }]

        const hasAtLeastOneValidCard = CardService.hasAtLeastOneValidCard(cards)

        expect(hasAtLeastOneValidCard).toBeFalsy()
      })
    })

    describe('when at least one of the cards is NOT expired', () => {
      it('should return true', () => {
        const cards = [{ expirationStatus: VALID }]

        const hasAtLeastOneValidCard = CardService.hasAtLeastOneValidCard(cards)

        expect(hasAtLeastOneValidCard).toBeTruthy()
      })
    })
  })
})
