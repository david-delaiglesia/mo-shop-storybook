import { ServiceRatingClient } from '../client'
import {
  mockedServiceRating,
  mockedServiceRatingAnswer,
  mockedServiceRatingStepWithMoodLayout,
} from './service-rating.mock'
import { vi } from 'vitest'

import { HttpWithErrorHandler } from 'services/http'

describe('ServiceRatingClient', () => {
  describe('get method', () => {
    const token = 'foo'

    beforeEach(() => {
      vi.clearAllMocks()
      HttpWithErrorHandler.get = vi.fn().mockResolvedValue(mockedServiceRating)
    })

    it('should retrieve the service rating details', async () => {
      await ServiceRatingClient.get(token)

      const expectedPath = `/service-rating/${token}/`
      const expectedOptions = { shouldCatchErrors: false }
      expect(HttpWithErrorHandler.get).toHaveBeenCalledWith(
        expectedPath,
        expectedOptions,
      )
    })

    it('should fulfill the service rating agreement', async () => {
      const { first_step_id: firstStepId, token } = mockedServiceRating
      const expectedServiceRating = { firstStepId, token }

      const serviceRating = await ServiceRatingClient.get(token)

      expect(serviceRating).toEqual(expectedServiceRating)
    })
  })

  describe('getStepById method', () => {
    const stepId = 1
    const token = 'foo'

    beforeEach(() => {
      vi.clearAllMocks()
      HttpWithErrorHandler.get = vi
        .fn()
        .mockResolvedValue(mockedServiceRatingStepWithMoodLayout)
    })

    it('should retrieve a service rating step by id', async () => {
      const expectedPath = `/service-rating/${token}/steps/${stepId}/`
      const expectedOptions = { shouldCatchErrors: false }

      await ServiceRatingClient.getStepById(token, stepId)

      expect(HttpWithErrorHandler.get).toHaveBeenCalledWith(
        expectedPath,
        expectedOptions,
      )
    })

    it('should fulfill the service rating step agreement', async () => {
      const expectedServiceRatingStep = {
        ...mockedServiceRatingStepWithMoodLayout,
      }

      const serviceRatingStep = await ServiceRatingClient.getStepById(token)

      expect(serviceRatingStep).toEqual(expectedServiceRatingStep)
    })
  })

  describe('update method', () => {
    const answer = { answerId: 1, text: 'bar' }
    const token = 'foo'

    beforeEach(() => {
      vi.clearAllMocks()
      HttpWithErrorHandler.put = vi
        .fn()
        .mockResolvedValue(mockedServiceRatingAnswer)
    })

    it('should update the service rating', async () => {
      const expectedPath = `/service-rating/${token}/`
      const body = JSON.stringify({
        answer_id: answer.answerId,
        text: answer.text,
      })
      const expectedOptions = { body, shouldCatchErrors: false }

      await ServiceRatingClient.update(token, answer)

      expect(HttpWithErrorHandler.put).toHaveBeenCalledWith(
        expectedPath,
        expectedOptions,
      )
    })

    it('should fulfill the service rating answer agreement', async () => {
      const {
        answer_id: answerId,
        text,
        first_step_id: firstStepId,
        token,
      } = mockedServiceRatingAnswer
      const expectedServiceRatingAnswer = { answerId, text, firstStepId, token }

      const serviceRatingAnswer = await ServiceRatingClient.update(
        token,
        answer,
      )

      expect(serviceRatingAnswer).toEqual(expectedServiceRatingAnswer)
    })
  })
})
