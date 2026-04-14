import { screen } from '@testing-library/react'

import {
  downloadTicket,
  goToEditOrder,
  goToPendingOrderDetail,
  goToPendingOrderDetailFromCard,
  openChat,
  showNextWidget,
} from './helpers'
import MockDate from 'mockdate'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import {
  homeWithConfirmedWidget,
  homeWithDelayedWidget,
  homeWithDeliveringWidget,
  homeWithManyWidgets,
  homeWithPreparedWidget,
  homeWithUserUnreachableWidget,
  homeWithWidget,
  homeWithWidgets,
} from 'app/catalog/__scenarios__/home'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { order, preparedLines } from 'app/order/__scenarios__/orderDetail'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'
import { Support } from 'services/support'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Widget', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })
  MockDate.set(new Date('2020-08-25T19:00:00Z'))

  afterEach(() => {
    vi.restoreAllMocks()
    Storage.clear()
  })

  it('should show all the widgets', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidgets },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    expect(screen.queryByLabelText('Next order card')).not.toBeInTheDocument()
    expect(screen.getByText('Order 1001')).toBeInTheDocument()
    expect(screen.getByText('Order 1002')).toBeInTheDocument()
  })

  it('should show the arrows to navigate throw the widgets', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithManyWidgets },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    expect(
      screen.queryByLabelText('Previous order card'),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText('Next order card')).toBeInTheDocument()
    expect(screen.getByText('Order 1001')).toBeInTheDocument()
    expect(screen.getByText('Order 1002')).toBeInTheDocument()
    expect(screen.getByText('Order 1003')).toBeInTheDocument()
    expect(screen.getByText('Order 1004')).toBeInTheDocument()

    showNextWidget()

    expect(screen.queryByLabelText('Next order card')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Previous order card')).toBeInTheDocument()
  })

  it('should show the delivering order widget section', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveringWidget,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    expect(screen.getByTestId('purchase-status-image')).toBeInTheDocument()
    expect(screen.getByText('Order 1004')).toBeInTheDocument()
    expect(screen.getByText('Out for delivery')).toBeInTheDocument()
    expect(
      screen.getByText('Delivery today from 21:00 to 22:00'),
    ).toBeInTheDocument()
    expect(screen.getByText('See order')).toBeInTheDocument()
    expect(screen.queryByText('Modify')).not.toBeInTheDocument()
    expect(screen.getByText('See ticket')).toBeInTheDocument()
  })

  it('should show the delayed order widget section', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithDelayedWidget },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    expect(screen.getByTestId('purchase-status-image')).toBeInTheDocument()
    expect(screen.getByText('Order 1008')).toBeInTheDocument()
    expect(screen.getByText('Incident with the delivery')).toBeInTheDocument()
    expect(screen.getByText('See order')).toBeInTheDocument()
    expect(screen.getByText('Chat')).toBeInTheDocument()
  })

  it('should show the chat order widget section', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithUserUnreachableWidget,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    expect(screen.getByTestId('purchase-status-image')).toBeInTheDocument()
    expect(screen.getByText('Order 1007')).toBeInTheDocument()
    expect(screen.getByText('Incident with the delivery')).toBeInTheDocument()
    expect(
      screen.getByText('We have tried to deliver your order'),
    ).toBeInTheDocument()
    expect(screen.getByText('See order')).toBeInTheDocument()
    expect(screen.getByText('Chat')).toBeInTheDocument()
  })

  it('should show the order detail clicking in the widget', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      {
        path: '/customers/1/orders/1003/',
        responseBody: { ...order, id: 1003 },
      },
      {
        path: '/customers/1/orders/1003/lines/prepared/',
        responseBody: preparedLines,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    goToPendingOrderDetailFromCard(1003)
    await screen.findByText('My orders')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('widget_click', {
      id: 1003,
      slot_date: {
        start: '2020-06-20T07:00:00Z',
        end: '2020-06-20T08:00:00Z',
      },
      status: 'prepared',
      action: 'card',
    })
  })

  it('should show the order detail clicking in the see order widget action', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithPreparedWidget,
      },
      {
        path: '/customers/1/orders/1003/',
        responseBody: { ...order, id: 1003 },
      },
      {
        path: '/customers/1/orders/1003/lines/prepared/',
        responseBody: preparedLines,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    goToPendingOrderDetail()
    await screen.findByText('My orders')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('widget_click', {
      id: 1003,
      slot_date: {
        start: '2020-06-20T07:00:00Z',
        end: '2020-06-20T08:00:00Z',
      },
      status: 'prepared',
      action: 'review',
    })
  })

  it('should go to edit order clicking in the widget action', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithConfirmedWidget,
      },
      { path: '/customers/1/orders/1001/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1001/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: `/categories/${categoryDetail.id}/`,
        responseBody: categoryDetail,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    goToEditOrder()
    await screen.findByText('Products in my order')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('widget_click', {
      id: 1001,
      slot_date: {
        start: '2020-06-20T07:00:00Z',
        end: '2020-06-20T08:00:00Z',
      },
      status: 'confirmed',
      action: 'edit',
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'edit_purchase_products_click',
      {
        purchase_id: 1001,
        source: 'widget',
      },
    )
  })

  it('should download the ticket when is available', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithPreparedWidget,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    downloadTicket()
    await screen.findByText('Próxima entrega')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('widget_click', {
      id: 1003,
      slot_date: {
        start: '2020-06-20T07:00:00Z',
        end: '2020-06-20T08:00:00Z',
      },
      status: 'prepared',
      action: 'see_ticket',
    })
    expect('/customers/1/orders/1003/receipt/').toHaveBeenFetched()
  })

  it('should open the chat when user unreachable', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithUserUnreachableWidget,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    openChat()

    expect(Support.openWidget).toHaveBeenCalledTimes(1)
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('widget_click', {
      id: 1007,
      slot_date: {
        start: '2020-08-25T19:00:00Z',
        end: '2020-08-25T20:00:00Z',
      },
      status: 'user-unreachable',
      action: 'chat',
    })
  })
})
