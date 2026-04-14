import { Tracker } from 'services/tracker'

const EVENTS = {
  BREADCRUMB_CLICK: 'breadcrumb_click',
  SHARE_PRODUCT: 'share_product',
}

function sendBreadcrumbClickMetrics({ id, name }) {
  Tracker.sendInteraction(EVENTS.BREADCRUMB_CLICK, { id, name })
}

function sendShareProductMetrics({ id, display_name }) {
  Tracker.sendInteraction(EVENTS.SHARE_PRODUCT, { id, display_name })
}

export { sendBreadcrumbClickMetrics, sendShareProductMetrics }
