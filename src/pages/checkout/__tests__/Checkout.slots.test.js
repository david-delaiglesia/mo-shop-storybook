import { screen, within } from '@testing-library/react'

import {
  confirmSlot,
  selectFirstAvailableDay,
  selectNthAvailableDay,
  selectSlot,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { address } from 'app/address/__scenarios__/address'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { checkoutWithoutSlot } from 'app/checkout/__scenarios__/checkout'
import {
  mockDate,
  slotsAvailableOnlyTomorrow,
  slotsNoneAvailable,
} from 'app/delivery-area/__scenarios__/slots'
import { slotsUnavailableTomorrowMock } from 'containers/slots-container/__tests__/mocks'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Slots', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const { slots, resetMockDate } = mockDate()

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  afterAll(() => {
    resetMockDate()
  })

  it('should not preselect a day on checkout', async () => {
    const responses = [
      { path: `/customers/1/orders/`, responseBody: { results: [] } },
      { path: `/customers/1/checkouts/5/`, responseBody: checkoutWithoutSlot },
      { path: `/customers/1/orders/` },
      {
        path: `/customers/1/addresses/1/slots/`,
        responseBody: slotsUnavailableTomorrowMock,
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')

    expect(screen.queryByTestId('slot-detail')).not.toBeInTheDocument()
  })

  it('should display the proper calendar info', async () => {
    const responses = [
      { path: `/customers/1/orders/`, responseBody: { results: [] } },
      { path: `/customers/1/checkouts/5/`, responseBody: checkoutWithoutSlot },
      { path: `/customers/1/orders/` },
      { path: `/customers/1/addresses/1/slots/`, responseBody: slots },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')

    const daysSelector = screen.getByLabelText('Pick a day for 46010')
    const day = screen.getByText('Today')

    expect(daysSelector).toHaveTextContent(/Pick a day for/)
    expect(daysSelector).toHaveAccessibleDescription(
      'Choose a day to display the available delivery times',
    )
    expect(daysSelector).toContainElement(day)
  })

  it('should display the proper slot info', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/orders/' },
      { path: '/customers/1/addresses/1/slots/', responseBody: slots },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')
    selectFirstAvailableDay()

    const slotsSelector = screen
      .getAllByRole('group')
      .find((day) => day.textContent.includes('Slots for'))
    const slot = screen.getByRole('button', { name: 'From 13:00 to 14:00' })

    expect(slotsSelector).toHaveTextContent(/Slots for/)
    expect(slotsSelector).toHaveAccessibleDescription(
      'Choose a slot and confirm to proceed with the purchase',
    )
    expect(slotsSelector).toContainElement(slot)
  })

  it('should display the proper slot info when there are slots only for next day', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/orders/' },
      {
        path: '/customers/1/addresses/1/slots/',
        responseBody: slotsAvailableOnlyTomorrow,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')
    selectFirstAvailableDay()

    const slotsSelector = screen
      .getAllByRole('group')
      .find((day) => day.textContent.includes('Slots for'))
    const slot = screen.getByRole('button', { name: 'From 13:00 to 14:00' })

    expect(slotsSelector).toHaveAccessibleDescription(
      'Choose a slot and confirm to proceed with the purchase',
    )
    expect(slotsSelector).toContainElement(slot)
  })

  it('should display no available slots placeholder when there are no slots available', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/orders/' },
      {
        path: '/customers/1/addresses/1/slots/',
        responseBody: slotsNoneAvailable,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    const deliverySection = await screen.findByRole('region', {
      name: 'Delivery',
    })

    expect(deliverySection).toHaveTextContent('There are no slots available')
  })

  it('should maintain the selected slot after the user goes to a different day and comes back', async () => {
    const [selectedSlot] = slots.results

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            {
              responseBody: CheckoutMother.withoutSlot(),
            },
            {
              responseBody: {
                ...CheckoutMother.withoutSlot(),
                slot: selectedSlot,
              },
            },
          ],
        },
        { path: '/customers/1/orders/' },
        { path: '/customers/1/addresses/1/slots/', responseBody: slots },
        {
          path: '/customers/1/checkouts/5/delivery-info/',
          method: 'put',
          requestBody: {
            address,
            slot: selectedSlot,
          },
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    const deliverySection = await screen.findByRole('region', {
      name: 'Delivery',
    })

    selectNthAvailableDay(0)
    selectSlot('From 11:00 to 12:00')
    selectNthAvailableDay(1)

    const saveButton = within(deliverySection).getByRole('button', {
      name: 'Save',
    })
    expect(saveButton).toBeDisabled()

    selectNthAvailableDay(0)
    expect(saveButton).toBeEnabled()

    confirmSlot()
    await screen.findByText('Delivery')

    expect(deliverySection).toHaveTextContent(
      'Saturday 2 of January from 11:00 to 12:00',
    )
  })

  it('should render the correct slot for Europe/Madrid winter timezone', async () => {
    const [selectedSlot] = slots.results
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            {
              responseBody: CheckoutMother.withoutSlot(),
            },
            {
              responseBody: {
                ...CheckoutMother.withoutSlot(),
                slot: selectedSlot,
              },
            },
          ],
        },
        { path: '/customers/1/orders/' },
        { path: '/customers/1/addresses/1/slots/', responseBody: slots },
        {
          path: '/customers/1/checkouts/5/delivery-info/',
          method: 'put',
          requestBody: {
            address,
            slot: selectedSlot,
          },
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    const deliverySection = await screen.findByRole('region', {
      name: 'Delivery',
    })

    selectNthAvailableDay(0)
    selectSlot('From 11:00 to 12:00')
    selectNthAvailableDay(1)

    const saveButton = within(deliverySection).getByRole('button', {
      name: 'Save',
    })
    expect(saveButton).toBeDisabled()

    selectNthAvailableDay(0)
    expect(saveButton).toBeEnabled()

    confirmSlot()
    await screen.findByText('Delivery')

    expect(deliverySection).toHaveTextContent(
      'Saturday 2 of January from 11:00 to 12:00',
    )
  })
})
