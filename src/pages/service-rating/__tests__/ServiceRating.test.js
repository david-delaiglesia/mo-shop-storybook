import { screen } from '@testing-library/react'

import {
  fillRatingMessage,
  finishServiceRating,
  goToPreviousStep,
  openACMOChat,
  selectChoice,
  selectMood,
  sendRate,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  choicesStep,
  moodStep,
  serviceRating,
  textBoxStep,
  thankYouStep,
} from 'app/service-rating/__scenarios__/serviceRating'
import { Support } from 'services/support'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Service Rating', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const token = '12345'

  afterEach(() => {
    Tracker.sendViewChange.mockClear()
    Tracker.sendInteraction.mockClear()
  })

  it('should display the proper layout', async () => {
    const responses = [
      {
        path: `/service-rating/${token}/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/${token}/steps/1/`,
        responseBody: moodStep,
      },
    ]
    wrap(App).atPath(`/service-rating/${token}`).withNetwork(responses).mount()

    await screen.findByText('How was your order?')

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.queryByLabelText('Search')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Show cart')).not.toBeInTheDocument()
    expect(screen.queryByText('Categories')).not.toBeInTheDocument()
    expect(screen.queryByText('My Essentials')).not.toBeInTheDocument()
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('service_rating_page')
  })

  it('should display the proper information for the mood step', async () => {
    const responses = [
      {
        path: `/service-rating/${token}/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/${token}/steps/1/`,
        responseBody: moodStep,
      },
    ]
    wrap(App).atPath(`/service-rating/${token}`).withNetwork(responses).mount()

    await screen.findByText('How was your order?')

    expect(screen.getByText('How was your order?')).toBeInTheDocument()
    expect(
      screen.getByText(
        'We want to improve the service we offer and we need your opinion.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Happy face')).toBeInTheDocument()
    expect(screen.getByLabelText('Neutral face')).toBeInTheDocument()
    expect(screen.getByLabelText('Disappointed face')).toBeInTheDocument()
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('service_rating', {
      layout: 1,
    })
  })

  it('should display the proper information for the text box step', async () => {
    const responses = [
      {
        path: `/service-rating/${token}/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/${token}/steps/1/`,
        responseBody: textBoxStep,
      },
    ]
    wrap(App).atPath(`/service-rating/${token}`).withNetwork(responses).mount()

    const stepTitle = await screen.findByText(
      '¿Quieres decirnos lo que más te gustó?',
    )

    const stepSubtitle = screen.getByText(
      'Si crees que hay algo que merezca la pena destacar, no dudes en decírnoslo. Queremos saber lo que te gustó.',
    )
    expect(stepTitle).toBeInTheDocument()
    expect(stepSubtitle).toBeInTheDocument()
    expect(screen.getByLabelText('Lo que más me gustó es…')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Lo que más me gustó es…').closest('div'),
    ).toHaveTextContent('Max. 400')
    expect(screen.getByText('Send')).toBeInTheDocument()
    expect(screen.getByText('Back')).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('service_rating', {
      layout: 3,
    })
  })

  it('should display the proper information for the choices step', async () => {
    const responses = [
      {
        path: `/service-rating/${token}/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/${token}/steps/1/`,
        responseBody: choicesStep,
      },
    ]
    wrap(App).atPath(`/service-rating/${token}`).withNetwork(responses).mount()

    await screen.findByText('¿Has encontrado algún problema?')

    expect(screen.getByText('Error con los productos')).toBeInTheDocument()
    expect(screen.getByText('Otro')).toBeInTheDocument()
    expect(screen.getByText('Back')).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('service_rating', {
      layout: 2,
    })
  })

  it('should display the proper information for the thank you step', async () => {
    const responses = [
      {
        path: `/service-rating/${token}/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/${token}/steps/1/`,
        responseBody: thankYouStep,
      },
    ]
    wrap(App).atPath(`/service-rating/${token}`).withNetwork(responses).mount()

    await screen.findByText('Gracias por tu opinión')

    expect(screen.getByAltText('Check icon')).toBeInTheDocument()
    expect(screen.getByText('Ok')).toBeInTheDocument()
    expect(
      screen.getByText('Start chat with customer support'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('service_rating', {
      layout: 4,
    })
  })

  it('should allow to go back to the previous step', async () => {
    const responses = [
      {
        path: `/service-rating/${token}/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/${token}/steps/1/`,
        responseBody: moodStep,
      },
      {
        path: `/service-rating/${token}/`,
        method: 'put',
        requestBody: { answer_id: 2 },
        responseBody: {
          token,
          first_step_id: 1,
          answer_id: 2,
          text: null,
        },
      },
      {
        path: `/service-rating/${token}/steps/2/`,
        responseBody: textBoxStep,
      },
    ]
    wrap(App).atPath(`/service-rating/${token}`).withNetwork(responses).mount()

    await screen.findByText('How was your order?')
    selectMood('Happy face')
    await screen.findByText('¿Quieres decirnos lo que más te gustó?')
    goToPreviousStep()
    await screen.findByText('How was your order?')

    expect(screen.getByText('How was your order?')).toBeInTheDocument()
    expect(
      screen.getByText(
        'We want to improve the service we offer and we need your opinion.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Happy face')).toBeInTheDocument()
    expect(screen.getByLabelText('Neutral face')).toBeInTheDocument()
    expect(screen.getByLabelText('Disappointed face')).toBeInTheDocument()
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('service_rating', {
      layout: 1,
    })
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('service_rating', {
      layout: 3,
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'service_rating_click',
      { id: 2, label: 'Happy face', comments: undefined },
    )
  })

  it('should allow to finish a happy service rating process without comment', async () => {
    const responses = [
      {
        path: `/service-rating/${token}/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/${token}/steps/1/`,
        responseBody: moodStep,
      },
      {
        path: `/service-rating/${token}/`,
        method: 'put',
        requestBody: { answer_id: 2 },
        responseBody: {
          token,
          first_step_id: 1,
          answer_id: 2,
          text: null,
        },
      },
      {
        path: `/service-rating/${token}/steps/2/`,
        responseBody: textBoxStep,
      },
      {
        path: `/service-rating/${token}/`,
        method: 'put',
        requestBody: { answer_id: 3 },
        responseBody: {
          token,
          first_step_id: 1,
          answer_id: 3,
          text: null,
        },
      },
      {
        path: `/service-rating/${token}/steps/3/`,
        responseBody: thankYouStep,
      },
      {
        path: '/home/',
        responseBody: homeWithGrid,
      },
    ]
    wrap(App).atPath(`/service-rating/${token}`).withNetwork(responses).mount()

    await screen.findByText('How was your order?')
    selectMood('Happy face')
    await screen.findByText('¿Quieres decirnos lo que más te gustó?')
    sendRate()
    await screen.findByText('Gracias por tu opinión')

    expect(screen.getByText('Ok')).toBeInTheDocument()
    expect(
      screen.getByText('Start chat with customer support'),
    ).toBeInTheDocument()

    finishServiceRating()
    await screen.findByText('Novedades')

    expect(Tracker.sendViewChange).toHaveBeenCalledWith('service_rating', {
      layout: 1,
    })
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('service_rating', {
      layout: 3,
    })
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('service_rating', {
      layout: 4,
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'service_rating_click',
      { id: 2, label: 'Happy face', comments: undefined },
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'service_rating_click',
      { id: 3, comments: undefined, label: undefined },
    )
  })

  it('should allow to finish a service rating process with choices', async () => {
    const responses = [
      {
        path: `/service-rating/${token}/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/${token}/steps/1/`,
        responseBody: moodStep,
      },
      {
        path: `/service-rating/${token}/`,
        method: 'put',
        requestBody: { answer_id: 4 },
        responseBody: {
          token,
          first_step_id: 1,
          answer_id: 4,
          text: null,
        },
      },
      {
        path: `/service-rating/${token}/steps/4/`,
        responseBody: choicesStep,
      },
      {
        path: `/service-rating/${token}/`,
        method: 'put',
        requestBody: { answer_id: 5 },
        responseBody: {
          token,
          first_step_id: 1,
          answer_id: 5,
          text: null,
        },
      },
      {
        path: `/service-rating/${token}/steps/5/`,
        responseBody: textBoxStep,
      },
      {
        path: `/service-rating/${token}/`,
        method: 'put',
        requestBody: { answer_id: 3, text: 'Todo genial' },
        responseBody: {
          token,
          first_step_id: 1,
          answer_id: 3,
          text: 'Todo genial',
        },
      },
      {
        path: `/service-rating/${token}/steps/3/`,
        responseBody: thankYouStep,
      },
      {
        path: '/home/',
        responseBody: homeWithGrid,
      },
    ]
    wrap(App).atPath(`/service-rating/${token}`).withNetwork(responses).mount()

    await screen.findByText('How was your order?')
    selectMood('Neutral face')
    await screen.findByText('¿Has encontrado algún problema?')
    selectChoice('Estado de los productos')
    await screen.findByText('¿Quieres decirnos lo que más te gustó?')
    fillRatingMessage('Todo genial')
    sendRate()
    await screen.findByText('Gracias por tu opinión')

    expect(screen.getByText('Ok')).toBeInTheDocument()
    expect(
      screen.getByText('Start chat with customer support'),
    ).toBeInTheDocument()

    finishServiceRating()
    await screen.findByText('Novedades')

    expect(Tracker.sendViewChange).toHaveBeenCalledWith('service_rating', {
      layout: 1,
    })
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('service_rating', {
      layout: 3,
    })
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('service_rating', {
      layout: 4,
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'service_rating_click',
      { id: 4, label: 'Neutral face', comments: undefined },
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'service_rating_click',
      { id: 3, comments: 'Todo genial', label: undefined },
    )
  })

  it('should allow to contact to ACMO in the service rating last step', async () => {
    const responses = [
      {
        path: `/service-rating/${token}/`,
        responseBody: serviceRating,
      },
      {
        path: `/service-rating/${token}/steps/1/`,
        responseBody: thankYouStep,
      },
      {
        path: '/home/',
        responseBody: homeWithGrid,
      },
    ]
    wrap(App).atPath(`/service-rating/${token}`).withNetwork(responses).mount()

    await screen.findByText('Gracias por tu opinión')
    openACMOChat()
    await screen.findByText('Novedades')

    expect(Support.popoutChatWindow).toHaveBeenCalled()
    expect(Support.sendMessage).toHaveBeenCalledWith(
      'Id pedido: 50331 \n\n Entrega impuntual > Tarde \n\n Ha llegado tarde',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'service_rating_acmo_chat_click',
      [
        { answer: 'Entrega impuntual', question: '¿Cuándo llegó el pedido?' },
        { answer: 'Tarde', question: '¿Qué pasó concretamente?' },
      ],
    )
  })

  it('should inform about the service rating already completed', async () => {
    const responses = [
      {
        path: `/service-rating/${token}/`,
        status: 410,
        errors: [
          { detail: 'Ya has valorado este pedido, gracias por tu ayuda.' },
        ],
      },
    ]
    wrap(App).atPath(`/service-rating/${token}`).withNetwork(responses).mount()

    const title = await screen.findByText(
      'You have already rated this order, thank you for your help.',
    )

    const image = screen.getByAltText('Check icon')
    const button = screen.getByText('Ok')
    expect(title).toBeInTheDocument()
    expect(image).toBeInTheDocument()
    expect(button).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'service_rating_not_available',
    )
  })

  it('should redirect to home after finishing a service rating', async () => {
    const responses = [
      {
        path: `/service-rating/${token}/`,
        status: 410,
        errors: [
          { detail: 'Ya has valorado este pedido, gracias por tu ayuda.' },
        ],
      },
      {
        path: '/home/',
        responseBody: homeWithGrid,
      },
    ]
    wrap(App).atPath(`/service-rating/${token}`).withNetwork(responses).mount()

    await screen.findByText(
      'You have already rated this order, thank you for your help.',
    )
    finishServiceRating()

    expect(await screen.findByText('Novedades')).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'service_rating_not_available',
    )
  })
})
