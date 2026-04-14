import { screen, within } from '@testing-library/react'

import { openCart, startCheckout } from './helpers'
import userEvent from '@testing-library/user-event'
import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { MaxSizeAreaExceededException } from 'app/cart'
import { CartMother } from 'app/cart/__scenarios__/CartMother'
import { HomeSectionsBuilder } from 'app/home/__scenarios__/HomeSectionsBuilder'
import { knownFeatureFlags } from 'services/feature-flags/constants'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Order size limit', () => {
  it('should NOT show order size limit content when backend throws max_size_area_exceeded and flag is inactive', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: new HomeSectionsBuilder().build(),
        },
        { path: '/customers/1/cart/', responseBody: CartMother.simple() },
        {
          path: '/customers/1/checkouts/?lang=en&wh=vlc1',
          method: 'post',
          status: 400,
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [
                { id: 1, quantity: 5, product_id: '8731' },
                { id: 2, quantity: 5, product_id: '3317' },
              ],
            },
          },
          responseBody: {
            errors: [
              MaxSizeAreaExceededException.toJSON({
                areas_exceeded: {
                  ambient: true,
                  chilled: false,
                  frozen: false,
                },
              }),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findByText('Checkout')
    startCheckout()

    const dialog = screen.queryByRole('dialog')
    expect(dialog).not.toBeInTheDocument()
  })

  it('should show order size limit content when backend throws max_size_area_exceeded and flag is active', async () => {
    activeFeatureFlags([knownFeatureFlags.CHECKOUT_ORDER_SIZE_LIMIT])

    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: new HomeSectionsBuilder().build(),
        },
        { path: '/customers/1/cart/', responseBody: CartMother.simple() },
        {
          path: '/customers/1/checkouts/?lang=en&wh=vlc1',
          method: 'post',
          status: 400,
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [
                { id: 1, quantity: 5, product_id: '8731' },
                { id: 2, quantity: 5, product_id: '3317' },
              ],
            },
          },
          responseBody: {
            errors: [
              MaxSizeAreaExceededException.toJSON({
                areas_exceeded: {
                  ambient: true,
                  chilled: false,
                  frozen: false,
                },
              }),
            ],
          },
        },
      ])
      .debugRequests()
      .withLogin()
      .mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findByText('Checkout')
    startCheckout()

    expect(
      await screen.findByRole('dialog', { name: 'Order too large' }),
    ).toBeInTheDocument()
  })

  it('should close the modal when clicking the confirm button', async () => {
    activeFeatureFlags([knownFeatureFlags.CHECKOUT_ORDER_SIZE_LIMIT])

    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: new HomeSectionsBuilder().build(),
        },
        { path: '/customers/1/cart/', responseBody: CartMother.simple() },
        {
          path: '/customers/1/checkouts/?lang=en&wh=vlc1',
          method: 'post',
          status: 400,
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [
                { id: 1, quantity: 5, product_id: '8731' },
                { id: 2, quantity: 5, product_id: '3317' },
              ],
            },
          },
          responseBody: {
            errors: [
              MaxSizeAreaExceededException.toJSON({
                areas_exceeded: {
                  ambient: true,
                  chilled: false,
                  frozen: false,
                },
              }),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findByText('Checkout')
    startCheckout()

    const dialog = await screen.findByRole('dialog', {
      name: 'Order too large',
    })
    userEvent.click(within(dialog).getByRole('button', { name: 'OK' }))

    expect(dialog).not.toBeInTheDocument()
  })

  it('should send metric order_size_limit_alert_view when showing the modal', async () => {
    activeFeatureFlags([knownFeatureFlags.CHECKOUT_ORDER_SIZE_LIMIT])

    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: new HomeSectionsBuilder().build(),
        },
        { path: '/customers/1/cart/', responseBody: CartMother.simple() },
        {
          path: '/customers/1/checkouts/?lang=en&wh=vlc1',
          method: 'post',
          status: 400,
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [
                { id: 1, quantity: 5, product_id: '8731' },
                { id: 2, quantity: 5, product_id: '3317' },
              ],
            },
          },
          responseBody: {
            errors: [
              MaxSizeAreaExceededException.toJSON({
                areas_exceeded: {
                  ambient: true,
                  chilled: false,
                  frozen: false,
                },
              }),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findByText('Checkout')
    startCheckout()

    await screen.findByRole('dialog', { name: 'Order too large' })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'order_size_limit_alert_view',
      {
        dry_exceeded: true,
        chill_exceeded: false,
        frozen_exceeded: false,
      },
    )
  })

  it('should show exceeded accessibility text for each exceeded zone', async () => {
    activeFeatureFlags([knownFeatureFlags.CHECKOUT_ORDER_SIZE_LIMIT])

    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: new HomeSectionsBuilder().build(),
        },
        { path: '/customers/1/cart/', responseBody: CartMother.simple() },
        {
          path: '/customers/1/checkouts/?lang=en&wh=vlc1',
          method: 'post',
          status: 400,
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [
                { id: 1, quantity: 5, product_id: '8731' },
                { id: 2, quantity: 5, product_id: '3317' },
              ],
            },
          },
          responseBody: {
            errors: [
              MaxSizeAreaExceededException.toJSON({
                areas_exceeded: {
                  ambient: true,
                  chilled: true,
                  frozen: true,
                },
              }),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findByText('Checkout')
    startCheckout()

    const dialog = await screen.findByRole('dialog', {
      name: 'Order too large',
    })

    expect(
      within(dialog).getByRole('listitem', {
        name: "The ambient-temperature products exceed the truck's capacity.",
      }),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole('listitem', {
        name: "The refrigerated products exceed the truck's capacity.",
      }),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole('listitem', {
        name: "The frozen products exceed the truck's capacity.",
      }),
    ).toBeInTheDocument()
  })

  it('should show ok accessibility text for each non-exceeded zone', async () => {
    activeFeatureFlags([knownFeatureFlags.CHECKOUT_ORDER_SIZE_LIMIT])

    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: new HomeSectionsBuilder().build(),
        },
        { path: '/customers/1/cart/', responseBody: CartMother.simple() },
        {
          path: '/customers/1/checkouts/?lang=en&wh=vlc1',
          method: 'post',
          status: 400,
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [
                { id: 1, quantity: 5, product_id: '8731' },
                { id: 2, quantity: 5, product_id: '3317' },
              ],
            },
          },
          responseBody: {
            errors: [
              MaxSizeAreaExceededException.toJSON({
                areas_exceeded: {
                  ambient: true,
                  chilled: false,
                  frozen: false,
                },
              }),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findByText('Checkout')
    startCheckout()

    await screen.findByRole('dialog', { name: 'Order too large' })

    const dialog = await screen.findByRole('dialog', {
      name: 'Order too large',
    })

    expect(
      within(dialog).getByRole('listitem', {
        name: 'The refrigerated products fit in the truck and can be added to the order.',
      }),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole('listitem', {
        name: 'The frozen products fit in the truck and can be added to the order.',
      }),
    ).toBeInTheDocument()
  })

  it('should make zone list items and description focusable via keyboard', async () => {
    activeFeatureFlags([knownFeatureFlags.CHECKOUT_ORDER_SIZE_LIMIT])

    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: new HomeSectionsBuilder().build(),
        },
        { path: '/customers/1/cart/', responseBody: CartMother.simple() },
        {
          path: '/customers/1/checkouts/?lang=en&wh=vlc1',
          method: 'post',
          status: 400,
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [
                { id: 1, quantity: 5, product_id: '8731' },
                { id: 2, quantity: 5, product_id: '3317' },
              ],
            },
          },
          responseBody: {
            errors: [
              MaxSizeAreaExceededException.toJSON({
                areas_exceeded: {
                  ambient: true,
                  chilled: false,
                  frozen: false,
                },
              }),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findByText('Checkout')
    startCheckout()

    const dialog = await screen.findByRole('dialog', {
      name: 'Order too large',
    })

    expect(
      within(dialog).getByRole('listitem', {
        name: "The ambient-temperature products exceed the truck's capacity.",
      }),
    ).toHaveAttribute('tabindex', '0')
    expect(
      within(dialog).getByRole('listitem', {
        name: 'The refrigerated products fit in the truck and can be added to the order.',
      }),
    ).toHaveAttribute('tabindex', '0')
    expect(
      within(dialog).getByRole('listitem', {
        name: 'The frozen products fit in the truck and can be added to the order.',
      }),
    ).toHaveAttribute('tabindex', '0')
    expect(
      within(dialog).getByText(
        'To process the order, please reduce the number of items in your cart.',
      ),
    ).toHaveAttribute('tabindex', '0')
  })
})
