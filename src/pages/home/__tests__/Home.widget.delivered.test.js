import { screen, within } from '@testing-library/react'

import {
  closeModal,
  goToPendingOrderDetailFromCard,
  rateOrder,
} from './helpers'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { repeatOrderLines } from 'app/cart/__scenarios__/cart'
import {
  homeWithDeliveredAndRatedWidget,
  homeWithDeliveredWidget,
} from 'app/catalog/__scenarios__/home'
import { order, preparedLines } from 'app/order/__scenarios__/orderDetail'
import {
  moodStep,
  serviceRating,
  textBoxStep,
} from 'app/service-rating/__scenarios__/serviceRating'
import { selectMood } from 'pages/service-rating/__tests__/helpers'
import {
  cancelRepeatOrder,
  confirmRepeatOrder,
  repeatOrder,
} from 'pages/user-area/__tests__/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Widget', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
  })

  it('should show the delivered order widget', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredWidget,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    expect(screen.getByTestId('purchase-status-image')).toBeInTheDocument()
    expect(screen.getByText('Order 1005')).toBeInTheDocument()
    expect(screen.getByText('Delivered')).toBeInTheDocument()
    expect(screen.getByText('Tell us how it was.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rate' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Repeat order' }),
    ).toBeInTheDocument()
  })

  it('should show the delivered order widget', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredWidget,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    expect(screen.getByTestId('purchase-status-image')).toBeInTheDocument()
    expect(screen.getByText('Order 1005')).toBeInTheDocument()
    expect(screen.getByText('Delivered')).toBeInTheDocument()
    expect(screen.getByText('Tell us how it was.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rate' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Repeat order' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('See order')).not.toBeInTheDocument()
  })

  it('should show the delivered and rated order widget', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredAndRatedWidget,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    expect(screen.getByTestId('purchase-status-image')).toBeInTheDocument()
    expect(screen.getByText('Order 1005')).toBeInTheDocument()
    expect(screen.getByText('Delivered')).toBeInTheDocument()
    expect(
      screen.getByText('Delivery Tuesday 25 from 21:00 to 22:00'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Tell us how it was.')).not.toBeInTheDocument()
    expect(screen.getByText('See order')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Repeat order' }),
    ).toBeInTheDocument()
  })

  it('should allow to repeat the order', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredWidget,
      },
      {
        path: '/customers/1/orders/1005/repeat/',
        responseBody: { results: repeatOrderLines },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    repeatOrder()
    const repeatOrderModal = screen.getByRole('dialog', {
      name: 'Repeat order. By continuing, the products and quantities of this order will be added to your cart. Do not forget to check the cart to make sure you have everything you need.',
    })
    confirmRepeatOrder()
    await screen.findByText('Cart updated')

    const cartButton = screen.getByLabelText('Show cart')
    expect(repeatOrderModal).not.toBeInTheDocument()
    expect(within(cartButton).getByText('5')).toBeInTheDocument()
    expect(within(cartButton).getByText('10,70 €')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'repeat_purchase_click',
      {
        is_cart_empty: true,
        purchase_id: 1005,
        source: 'widget',
      },
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('widget_click', {
      id: 1005,
      slot_date: {
        start: '2020-08-25T19:00:00Z',
        end: '2020-08-25T20:00:00Z',
      },
      status: 'delivered',
      action: 'repeat_purchase',
    })
  })

  it('should allow to cancel the repeat order action', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredWidget,
      },
      {
        path: '/customers/1/orders/1005/repeat/',
        responseBody: { results: repeatOrderLines },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    repeatOrder()
    const repeatOrderModal = screen.getByRole('dialog', {
      name: 'Repeat order. By continuing, the products and quantities of this order will be added to your cart. Do not forget to check the cart to make sure you have everything you need.',
    })
    cancelRepeatOrder()

    expect(repeatOrderModal).not.toBeInTheDocument()
  })

  it('should show the order detail clicking in the widget', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithDeliveredWidget },
      {
        path: '/customers/1/orders/1005/',
        responseBody: { ...order, id: 1005 },
      },
      {
        path: '/customers/1/orders/1005/lines/prepared/',
        responseBody: preparedLines,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    goToPendingOrderDetailFromCard(1005)
    await screen.findByText('My orders')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('widget_click', {
      id: 1005,
      slot_date: {
        start: '2020-08-25T19:00:00Z',
        end: '2020-08-25T20:00:00Z',
      },
      status: 'delivered',
      action: 'card',
    })
  })

  it('should show the order detail clicking in the card widget', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredWidget,
      },
      {
        path: '/customers/1/orders/1005/',
        responseBody: { ...order, id: 1005 },
      },
      {
        path: '/customers/1/orders/1005/lines/prepared/',
        responseBody: preparedLines,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    const widget = screen.getByText('Order 1005')
    userEvent.click(widget)
    await screen.findByText('My orders')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('widget_click', {
      id: 1005,
      slot_date: {
        start: '2020-08-25T19:00:00Z',
        end: '2020-08-25T20:00:00Z',
      },
      status: 'delivered',
      action: 'card',
    })
  })

  it('should rate the order when is available', async () => {
    const token = '12345'
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredWidget,
      },
      { path: `/service-rating/${token}/`, responseBody: serviceRating },
      { path: `/service-rating/${token}/steps/1/`, responseBody: moodStep },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    rateOrder()
    await screen.findByRole('dialog')

    expect(screen.getByText('How was your order?')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('widget_click', {
      id: 1005,
      slot_date: {
        start: '2020-08-25T19:00:00Z',
        end: '2020-08-25T20:00:00Z',
      },
      status: 'delivered',
      action: 'rate',
    })
  })

  it('should keep in the home after closing the rate modal', async () => {
    const token = '12345'
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredWidget,
      },
      { path: `/service-rating/${token}/`, responseBody: serviceRating },
      { path: `/service-rating/${token}/steps/1/`, responseBody: moodStep },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    rateOrder()
    await screen.findByRole('dialog')

    closeModal()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Próxima entrega')).toBeInTheDocument()
  })

  it('should stay in the home after interacting with the rate modal', async () => {
    const token = '12345'
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredWidget,
      },
      { path: `/service-rating/${token}/`, responseBody: serviceRating },
      { path: `/service-rating/${token}/steps/1/`, responseBody: moodStep },
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
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    rateOrder()
    await screen.findByRole('dialog')
    selectMood('Happy face')
    await screen.findByText('¿Quieres decirnos lo que más te gustó?')

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Próxima entrega')).toBeInTheDocument()
  })
})
