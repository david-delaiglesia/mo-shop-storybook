import { Tracker } from 'services/tracker'

const SOURCES = {
  SERVICE_RATING_PAGE: 'service_rating_page',
  SERVICE_RATING: 'service_rating',
  SERVICE_RATING_NOT_AVAILABLE: 'service_rating_not_available',
}

const EVENTS = {
  SERVICE_RATING_CLICK: 'service_rating_click',
  SERVICE_RATING_ACMO_CHAT_CLICK: 'service_rating_acmo_chat_click',
}

function sendServiceRatingPageViewMetrics() {
  Tracker.sendViewChange(SOURCES.SERVICE_RATING_PAGE)
}

function sendServiceRatingStepViewMetrics({ layout }) {
  Tracker.sendViewChange(SOURCES.SERVICE_RATING, { layout })
}

function sendServiceRatingNotAvailableViewMetrics() {
  Tracker.sendViewChange(SOURCES.SERVICE_RATING_NOT_AVAILABLE)
}

function sendServiceRatingClickMetrics({ id, comments, label }) {
  Tracker.sendInteraction(EVENTS.SERVICE_RATING_CLICK, { id, comments, label })
}

function sendServiceRatingAcmoChatClickMetrics(answers) {
  Tracker.sendInteraction(EVENTS.SERVICE_RATING_ACMO_CHAT_CLICK, answers)
}

export {
  sendServiceRatingPageViewMetrics,
  sendServiceRatingStepViewMetrics,
  sendServiceRatingNotAvailableViewMetrics,
  sendServiceRatingClickMetrics,
  sendServiceRatingAcmoChatClickMetrics,
}
