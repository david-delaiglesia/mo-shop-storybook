import { serializeServiceRatingAnswer } from '../serializer'

export const mockedServiceRating = {
  first_step_id: 1,
  token: 'foo',
}

const serviceRatingStep = {
  id: 1,
  title: 'How was your experience buying at Mercadona Online?',
  subtitle: 'Your opinion is key',
  parent: 1,
  choices: [
    {
      id: 1,
      label: 'It was grand.',
    },
    {
      id: 2,
      label: 'It was OK I guess.',
    },
    {
      id: 3,
      label: 'You have no SEO, it was terrible.',
    },
  ],
}

export const mockedServiceRatingLastStep = {
  ...serviceRatingStep,
  layout: 4,
  choices: [],
}

export const mockedServiceRatingFirstStep = {
  ...serviceRatingStep,
  layout: 1,
  parent: null,
}

export const mockedServiceRatingIntermediateStep = {
  ...serviceRatingStep,
  layout: 2,
}

export const mockedServiceRatingStepWithoutTitles = {
  ...serviceRatingStep,
  title: null,
  subtitle: null,
}

export const mockedServiceRatingStepWithMoodLayout = {
  ...serviceRatingStep,
  layout: 1,
}

export const mockedServiceRatingStepWithChoiceLayout = {
  ...serviceRatingStep,
  layout: 2,
}

export const mockedServiceRatingStepWithTextBoxLayout = {
  ...serviceRatingStep,
  layout: 3,
}

export const mockedServiceRatingStepWithAcknowledgeLayout = {
  ...serviceRatingStep,
  layout: 4,
}

export const mockedServiceRatingStepWithAcknowledgeLayoutAndWithShowChat = {
  ...mockedServiceRatingStepWithAcknowledgeLayout,
  showChat: true,
  orderId: '1',
  feedbackText: 'feedback text',
  previousAnswers: [
    { question: 'foo?', answer: '1' },
    { question: 'bar?', answer: '2' },
    { question: 'baz?', answer: '3' },
  ],
}

export const mockedServiceRatingAnswer = {
  ...mockedServiceRating,
  answer_id: 1,
  text: 'I was not happy with how my products were delivered.',
}

export const mockedSerializedServiceRatingAnswer = serializeServiceRatingAnswer(
  mockedServiceRatingAnswer,
)
