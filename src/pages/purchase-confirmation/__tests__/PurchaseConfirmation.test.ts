import { screen, waitFor, within } from '@testing-library/react'

import { acceptDialogMessage, finishCheckout } from './helpers'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { HomeSectionMother } from 'app/home/__scenarios__/HomeSectionMother'
import { HomeSectionsBuilder } from 'app/home/__scenarios__/HomeSectionsBuilder'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { Cache } from 'services/cache'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Confirmation', () => {
  configure({
    changeRoute: history.push,
  })

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  })

  it('should see the proper information', async () => {
    wrap(App)
      .atPath('/purchases/44051/confirmation')
      .withNetwork([
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.confirmed(),
        },
      ])
      .withLogin()
      .mount()

    const confirmationSection = await screen.findByRole('region', {
      name: 'Order 44051 confirmed',
    })

    const confirmationTotal = within(confirmationSection).getByRole(
      'definition',
      {
        name: 'Estimated total May vary for products sold by weight',
      },
    )
    const confirmationDelivery = within(confirmationSection).getByRole(
      'definition',
      {
        name: 'Delivery',
      },
    )

    const confirmationThanks = within(confirmationSection).getByRole(
      'heading',
      {
        level: 2,
        name: 'Thank you',
      },
    )
    const confirmationTitle = within(confirmationSection).getByRole('heading', {
      level: 1,
      name: 'Order 44051 confirmed',
    })

    const confirmationAction = within(confirmationSection).getByRole('button', {
      name: 'OK',
    })

    expect(confirmationSection).toBeInTheDocument()
    expect(confirmationTitle).toBeInTheDocument()
    expect(confirmationThanks).toBeInTheDocument()
    expect(confirmationSection).toHaveTextContent(
      'Check the confirmation in your email johndoe@gmail.com',
    )
    expect(confirmationTotal).toHaveTextContent('€70.96')
    expect(confirmationDelivery).toHaveTextContent(
      'Wednesday 26 of February from 18:00 to 19:00',
    )
    expect(confirmationDelivery).toHaveTextContent('Calle Arquitecto Mora, 10')
    expect(confirmationDelivery).toHaveTextContent('Piso 8 Puerta 14')
    expect(confirmationDelivery).toHaveTextContent('46010, València')
    expect(confirmationAction).toBeInTheDocument()
  })

  it('should go to the home page', async () => {
    vi.spyOn(Cache, 'clearAndReload')

    wrap(App)
      .atPath('/purchases/44051/confirmation')
      .withNetwork([
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.confirmed(),
        },
        {
          path: '/customers/1/home/',
          responseBody: new HomeSectionsBuilder().withSection(
            HomeSectionMother.widgetOrders([OrderMother.confirmed()]),
          ),
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('region', {
      name: 'Order 44051 confirmed',
    })

    finishCheckout(44051)

    const homePage = await screen.findByText('Próxima entrega')

    expect(homePage).toBeInTheDocument()
    expect(Cache.clearAndReload).toHaveBeenCalled()
  })

  describe('when an Order has earlier cutoff time', () => {
    it('should see the proper dialog ok confirm', async () => {
      wrap(App)
        .atPath('/purchases/44051/confirmation')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: '/customers/1/orders/44051/earlier-cutoff/',
            responseBody: { earlier_cutoff: true },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      })

      finishCheckout(44051)

      const earlierCutOffDialog = await screen.findByRole('dialog')
      expect(
        within(earlierCutOffDialog).getByRole('heading', {
          name: 'Deadline to change this order',
          level: 3,
        }),
      ).toBeInTheDocument()
      expect(
        within(earlierCutOffDialog).getByText(
          'Please keep in mind that you can change your order if you forget something.',
        ),
      ).toBeInTheDocument()
      expect(
        within(earlierCutOffDialog).getByText('Deadline 23:00'),
      ).toBeInTheDocument()
      expect(
        within(earlierCutOffDialog).getByText('Tuesday 25 February'),
      ).toBeInTheDocument()
    })
  })

  describe('Events', () => {
    it('should send an event on click to OK', async () => {
      wrap(App)
        .atPath('/purchases/44051/confirmation')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      })

      finishCheckout(44051)

      expect(Tracker.sendInteraction).toBeCalledWith(
        'order_confirmation_ok_click',
        {
          order_id: 44051,
        },
      )
    })

    it('should send an event if the early cutoff dialog appears', async () => {
      wrap(App)
        .atPath('/purchases/44051/confirmation')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: '/customers/1/orders/44051/earlier-cutoff/',
            responseBody: {
              earlier_cutoff: true,
            },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      })

      finishCheckout(44051)

      await screen.findByRole('dialog')

      expect(Tracker.sendInteraction).toBeCalledWith(
        'different_cutoff_modal_view',
        {
          order_id: 44051,
          cutoff_time: '23:00',
        },
      )
    })

    it('should send an event when accepting the early cut off dialog', async () => {
      wrap(App)
        .atPath('/purchases/44051/confirmation')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: '/customers/1/orders/44051/earlier-cutoff/',
            responseBody: {
              earlier_cutoff: true,
            },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      })

      finishCheckout(44051)

      await screen.findByRole('dialog')

      acceptDialogMessage()

      expect(Tracker.sendInteraction).toBeCalledWith(
        'different_cutoff_modal_accept',
        {
          order_id: 44051,
          cutoff_time: '23:00',
        },
      )
    })
  })

  describe('PaymentTimingModal', () => {
    it('should display the PaymentTimingModal when based on backend response', async () => {
      wrap(App)
        .atPath('/purchases/44051/confirmation')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: '/customers/1/orders/44051/confirmation/',
            responseBody: {
              show_payment_timing_modal: true,
            },
          },
        ])
        .withLogin()
        .mount()

      const dialog = await screen.findByRole('dialog', {
        name: 'The charge to your account will be made on the delivery day',
      })

      const dialogAction = within(dialog).getByRole('button', { name: 'OK' })

      expect(dialogAction).toBeInTheDocument()

      expect(dialog).toHaveTextContent(
        'The charge will be automatic: check that the payment method is active and has enough balance on the delivery day.',
      )
      expect(dialog).toHaveTextContent('Order confirmed Today')
      expect(dialog).toHaveTextContent('Order payment Delivery day')
    })

    it('should not display the PaymentTimingModal when based on backend response', async () => {
      wrap(App)
        .atPath('/purchases/44051/confirmation')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: '/customers/1/orders/44051/confirmation/',
            responseBody: {
              show_payment_timing_modal: false,
            },
          },
          {
            path: '/customers/1/home/',
            responseBody: new HomeSectionsBuilder().withSection(
              HomeSectionMother.widgetOrders([OrderMother.confirmed()]),
            ),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      })

      finishCheckout(44051)

      const homePage = await screen.findByText('Próxima entrega')

      expect(homePage).toBeInTheDocument()
    })

    it('should not display the PaymentTimingModal when based on flag', async () => {
      wrap(App)
        .atPath('/purchases/44051/confirmation')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: '/customers/1/orders/44051/confirmation/',
            responseBody: {
              show_payment_timing_modal: true,
            },
          },
          {
            path: '/customers/1/home/',
            responseBody: new HomeSectionsBuilder().withSection(
              HomeSectionMother.widgetOrders([OrderMother.confirmed()]),
            ),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      })

      finishCheckout(44051)

      const homePage = await screen.findByText('Próxima entrega')

      expect(homePage).toBeInTheDocument()
    })

    it('should close the PaymentTimingModal on OK button click', async () => {
      wrap(App)
        .atPath('/purchases/44051/confirmation')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: '/customers/1/orders/44051/confirmation/',
            responseBody: {
              show_payment_timing_modal: true,
            },
          },
        ])
        .withLogin()
        .mount()

      const dialog = await screen.findByRole('dialog', {
        name: 'The charge to your account will be made on the delivery day',
      })

      userEvent.click(within(dialog).getByRole('button', { name: 'OK' }))

      await waitFor(() => {
        expect(dialog).not.toBeInTheDocument()
      })
    })

    it('should track events related to the PaymentTimingModal', async () => {
      wrap(App)
        .atPath('/purchases/44051/confirmation')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: '/customers/1/orders/44051/confirmation/',
            responseBody: {
              show_payment_timing_modal: true,
            },
          },
        ])
        .withLogin()
        .mount()

      const dialog = await screen.findByRole('dialog', {
        name: 'The charge to your account will be made on the delivery day',
      })

      expect(Tracker.sendInteraction).toBeCalledWith(
        'order_payment_timeline_modal_view',
      )

      userEvent.click(within(dialog).getByRole('button', { name: 'OK' }))

      await waitFor(() => {
        expect(dialog).not.toBeInTheDocument()
        expect(Tracker.sendInteraction).toBeCalledWith(
          'order_payment_timeline_modal_click',
        )
      })
    })
  })
})
