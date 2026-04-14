import { screen, within } from '@testing-library/react'

import {
  cancelAgeVerificationAlert,
  confirmAgeVerificationAlert,
  startCheckout,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  ageVerificationCart,
  ageVerificationWithUnpublishedProductCart,
} from 'app/cart/__scenarios__/cart'
import { homeWithWidgets } from 'app/catalog/__scenarios__/home'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Cart - Age Verification Alert', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    Storage.clear()
    vi.clearAllMocks()
  })

  it('displays the age verification alert when the cart has a +18 product', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidgets },
      ])
      .withLogin({ cart: ageVerificationCart })
      .mount()

    await screen.findByLabelText('Home')

    startCheckout()

    const ageVerificationAlert = screen.getByRole('dialog')
    expect(ageVerificationAlert).toHaveTextContent('Are you over 18?')
    expect(ageVerificationAlert).toHaveTextContent(
      'Your order contains a product that requires being over 18 years of age',
    )
    expect(
      within(ageVerificationAlert).getByRole('button', {
        name: 'Yes, I am over 18 years of age',
      }),
    )
    expect(
      within(ageVerificationAlert).getByRole('button', {
        name: 'No, check cart',
      }),
    )
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('18_yearsold_modal', {
      price: 59.96,
    })
  })

  it('allows to close the age verification alert', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidgets },
      ])
      .withLogin({ cart: ageVerificationCart })
      .mount()

    await screen.findByLabelText('Home')

    startCheckout()

    const ageVerificationAlert = screen.getByRole('dialog')

    cancelAgeVerificationAlert()

    expect(ageVerificationAlert).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      '18_yearsold_modal_cancel_button_click',
    )
  })

  it('starts checkout process when the age verification alert is confirmed', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidgets },
        {
          path: '/customers/1/checkouts/',
          method: 'post',
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [{ quantity: 4, product_id: '28775', sources: [] }],
            },
          },
          multipleResponses: [
            { responseBody: CheckoutMother.default() },
            { responseBody: { ...CheckoutMother.default(), id: 123 } },
          ],
        },
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.default(),
        },
        {
          path: '/customers/1/checkouts/123/',
          responseBody: { ...CheckoutMother.default(), id: 123 },
        },
      ])
      .withLogin({ cart: ageVerificationCart })
      .mount()

    await screen.findByLabelText('Home')

    startCheckout()

    const ageVerificationAlert = screen.getByRole('dialog')
    confirmAgeVerificationAlert()
    expect(ageVerificationAlert).not.toBeInTheDocument()
    await screen.findByText('Summary')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      '18_yearsold_modal_confirmation_button_click',
    )
  })

  it('dont displays the age verification alert when the cart has a unpublished +18 product', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithWidgets },
        {
          path: '/customers/1/checkouts/',
          method: 'post',
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [
                { quantity: 1, product_id: '28775', sources: ['+CT'] },
                { quantity: 20, product_id: '28491', sources: [] },
              ],
            },
          },
          responseBody: CheckoutMother.default(),
        },
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.default(),
        },
      ])
      .withLogin({ cart: ageVerificationWithUnpublishedProductCart })
      .mount()

    await screen.findByLabelText('Home')

    startCheckout()
    await screen.findByText('Summary')
  })
})
