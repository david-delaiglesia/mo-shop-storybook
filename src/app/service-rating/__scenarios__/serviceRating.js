const serviceRating = {
  answer_id: 46,
  first_step_id: 1,
  text: null,
  token: '12345',
}

const moodStep = {
  id: 1,
  title: 'How was your order?',
  subtitle: 'We want to improve the service we offer and we need your opinion.',
  layout: 1,
  parent: null,
  show_chat: false,
  order_id: 304298,
  feedback_text: null,
  previous_answers: [],
  choices: [
    {
      id: 2,
      label: 'Happy face',
    },
    {
      id: 4,
      label: 'Neutral face',
    },
    {
      id: 46,
      label: 'Neutral face',
    },
  ],
}

const choicesStep = {
  id: 4,
  title: '¿Has encontrado algún problema?',
  subtitle: null,
  layout: 2,
  parent: 1,
  show_chat: false,
  order_id: 50331,
  feedback_text: null,
  previous_answers: [],
  choices: [
    {
      id: 5,
      label: 'Estado de los productos',
    },
    {
      id: 6,
      label: 'Error con los productos',
    },
    {
      id: 10,
      label: 'Otro',
    },
  ],
}

const textBoxStep = {
  id: 2,
  title: '¿Quieres decirnos lo que más te gustó?',
  subtitle:
    'Si crees que hay algo que merezca la pena destacar, no dudes en decírnoslo. Queremos saber lo que te gustó.',
  layout: 3,
  parent: 1,
  show_chat: false,
  order_id: 50331,
  feedback_text: null,
  previous_answers: [],
  choices: [
    {
      id: 3,
      label: 'Lo que más me gustó es…',
    },
  ],
}

const thankYouStep = {
  id: 86,
  title: 'Gracias por tu opinión',
  subtitle: '',
  layout: 4,
  parent: 84,
  show_chat: true,
  order_id: '50331',
  feedback_text: 'Ha llegado tarde',
  previous_answers: [
    {
      question: '¿Cuándo llegó el pedido?',
      answer: 'Entrega impuntual',
    },
    {
      question: '¿Qué pasó concretamente?',
      answer: 'Tarde',
    },
  ],
  choices: [],
}

export { serviceRating, moodStep, textBoxStep, choicesStep, thankYouStep }
