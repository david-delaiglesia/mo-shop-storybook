export function serializeServiceRatingFirstStep(firstStep) {
  if (!firstStep) return

  const { first_step_id: firstStepId, token } = firstStep

  return { firstStepId, token }
}

export function serializeServiceRatingStep(step) {
  if (!step) return

  const {
    id,
    title,
    layout,
    parent,
    subtitle,
    choices,
    order_id,
    show_chat,
    previous_answers,
    feedback_text,
  } = step

  return {
    id,
    title,
    layout,
    parent,
    subtitle,
    choices: choices.map(serializeChoice),
    orderId: order_id,
    showChat: show_chat,
    previousAnswers: previous_answers,
    feedbackText: feedback_text,
  }
}

function serializeChoice({ id, label }) {
  return { id, label }
}

export function serializeServiceRatingAnswer(answer) {
  if (!answer) return

  const {
    answer_id: answerId,
    text,
    first_step_id: firstStepId,
    token,
  } = answer

  return { answerId, text, firstStepId, token }
}
