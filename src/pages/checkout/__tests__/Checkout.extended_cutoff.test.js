import { screen } from '@testing-library/react'

import { confirmAddressList, selectAddress } from './helpers'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { address, secondaryAddress } from 'app/address/__scenarios__/address'
import { checkoutWithoutSlot } from 'app/checkout/__scenarios__/checkout'
import { slotsWithTodayAvailable } from 'containers/slots-container/__tests__/mocks'
import { Storage } from 'services/storage'
import { getNumberDay } from 'utils/dates'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

function selectToday() {
  const todayButton = screen.getByRole('button', { name: /today/i })
  userEvent.click(todayButton)
}

describe('Checkout - Extended cut-off', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should render TODAY as available', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: checkoutWithoutSlot,
      },
      { path: '/customers/1/orders/' },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address, secondaryAddress] },
      },
      {
        path: `/customers/1/addresses/${secondaryAddress.id}/slots/`,
        responseBody: slotsWithTodayAvailable,
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
    const today = new Date()
    await screen.findByText('Delivery')

    selectAddress(secondaryAddress.address)
    confirmAddressList()
    await screen.findByText(
      'Calle Colón, 10, Piso 8 Puerta 14, 46010, València',
    )

    selectToday()

    const dayNumber = getNumberDay(today)

    expect(
      await screen.findByText(`Slots for Today ${dayNumber}`),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Choose a slot and confirm to proceed with the purchase',
      ),
    ).toBeInTheDocument()
  })
})
