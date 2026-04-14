import { screen } from '@testing-library/react'

import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import { cart } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  laterButtonDraftAlert,
  seeChangesButtonDraftAlert,
} from 'pages/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

it('should send metric when show the draft alert', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      multipleResponses: [{ responseBody: cart }],
    },
    {
      path: '/customers/1/orders/cart/drafts/?lang=en&wh=vlc1',
      responseBody: {
        order_id: 26523,
        payment_status: 0,
        start_date: '2023-11-13T19:00:00Z',
        end_date: '2023-11-13T20:00:00Z',
        service_rating_token: null,
        warehouse_code: 'vlc1',
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByLabelText('Show cart')

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'unsaved_edition_modal_view',
    {
      order_id: 26523,
      isShowhedByTime: 'false',
    },
  )
})

it('should send metric unsaved_edition_modal_click when user clicks on the later draft alert', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      multipleResponses: [{ responseBody: cart }],
    },
    {
      path: '/customers/1/orders/cart/drafts/?lang=en&wh=vlc1',
      responseBody: {
        order_id: 26523,
        payment_status: 0,
        start_date: '2023-11-13T19:00:00Z',
        end_date: '2023-11-13T20:00:00Z',
        service_rating_token: null,
        warehouse_code: 'vlc1',
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByLabelText('Show cart')
  laterButtonDraftAlert()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'unsaved_edition_modal_view',
    {
      order_id: 26523,
      isShowhedByTime: 'false',
    },
  )

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'unsaved_edition_modal_click',
    {
      order_id: 26523,
      option: 'view_later',
    },
  )
})

it('should send metric unsaved_edition_modal_click when user clicks on the see changes draft alert', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      multipleResponses: [{ responseBody: cart }],
    },
    {
      path: '/customers/1/orders/cart/drafts/?lang=en&wh=vlc1',
      responseBody: {
        order_id: 26523,
        payment_status: 0,
        start_date: '2023-11-13T19:00:00Z',
        end_date: '2023-11-13T20:00:00Z',
        service_rating_token: null,
        warehouse_code: 'vlc1',
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByLabelText('Show cart')
  seeChangesButtonDraftAlert()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'unsaved_edition_modal_view',
    {
      order_id: 26523,
      isShowhedByTime: 'false',
    },
  )

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'unsaved_edition_modal_click',
    {
      order_id: 26523,
      option: 'view_changes',
    },
  )
})
