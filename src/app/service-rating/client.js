import { HttpWithErrorHandler } from '../../services/http'
import {
  serializeServiceRatingAnswer,
  serializeServiceRatingFirstStep,
  serializeServiceRatingStep,
} from './serializer'

async function get(token) {
  const path = `/service-rating/${token}/`
  const options = {
    shouldCatchErrors: false,
  }

  return HttpWithErrorHandler.get(path, options).then(
    serializeServiceRatingFirstStep,
  )
}

async function getStepById(token, stepId) {
  const path = `/service-rating/${token}/steps/${stepId}/`
  const options = { shouldCatchErrors: false }

  return HttpWithErrorHandler.get(path, options).then(
    serializeServiceRatingStep,
  )
}

async function update(token, answer) {
  const path = `/service-rating/${token}/`
  const options = {
    shouldCatchErrors: false,
    body: JSON.stringify({ answer_id: answer.answerId, text: answer.text }),
  }

  return HttpWithErrorHandler.put(path, options).then(
    serializeServiceRatingAnswer,
  )
}

export const ServiceRatingClient = {
  get,
  getStepById,
  update,
}
