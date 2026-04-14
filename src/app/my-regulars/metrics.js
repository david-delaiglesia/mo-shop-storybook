import { MY_REGULARS_TYPE, SORTING_METHODS } from 'app/my-regulars/constants'
import { Tracker } from 'services/tracker'

export const EVENTS = {
  REMOVE_FROM_MY_REGULARS: 'remove_from_my_regulars',
}

const SOURCES = {
  [MY_REGULARS_TYPE.PRECISION]: 'my_regulars_precision',
  [MY_REGULARS_TYPE.RECALL]: 'my_regulars_recall',
}

function sendRemoveFromMyRegularsMetrics({ id, displayName, sourceCode }) {
  const options = {
    source: SOURCES[sourceCode],
    display_name: displayName,
    id,
  }
  Tracker.sendInteraction(EVENTS.REMOVE_FROM_MY_REGULARS, options)
}

function sendMyRegularsSortingMethodClickMetrics({ sortingMethod }) {
  const METHODS = {
    [SORTING_METHODS.BY_IMPORTANCE]: 'relevance',
    [SORTING_METHODS.BY_CATEGORY]: 'categories',
  }
  Tracker.sendInteraction('my_regulars_sorting_method_click', {
    method: METHODS[sortingMethod],
  })
}

export {
  sendRemoveFromMyRegularsMetrics,
  sendMyRegularsSortingMethodClickMetrics,
}
