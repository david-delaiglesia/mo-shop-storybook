function isLast(step) {
  return !step.choices.length
}

function isFirst(step) {
  return !step.parent
}

function isIntermediate(step) {
  return !isFirst(step) && !isLast(step)
}

export const ServiceRatingStep = {
  isIntermediate,
}
