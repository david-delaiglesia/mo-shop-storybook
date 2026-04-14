import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'

import {
  cancelPostalCodeForm,
  confirmPostalCodeForm,
  confirmPostalCodeFormPressingEnter,
  fillPostalCodeForm,
  goToOldWebsite,
  openCart,
  openChangeAddressModal,
  openChangeAddressModalFromUserMenu,
  openUserDropdown,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Delivery info', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    Storage.clear()
    localStorage.clear()
  })

  const pathnameMock = vi.fn()
  delete global.window.location
  global.window.location = {}
  Object.defineProperty(window.location, 'pathname', {
    set: pathnameMock,
    get: () => pathnameMock,
    configurable: true,
  })

  describe('Change postal code dialog', () => {
    it('is accessible from the user dropdown menu', async () => {
      const responses = [{ path: '/home/', responseBody: homeWithGrid }]
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByLabelText('Show cart')
      openUserDropdown()
      openChangeAddressModalFromUserMenu('46010')

      const postalCodeModal = screen.getByRole('dialog')
      expect(postalCodeModal).toHaveTextContent(
        'Where do you want to receive your order?',
      )
      expect(
        within(postalCodeModal).getByRole('textbox', { name: 'Postal code' })
          .value,
      ).toBe('46010')
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'change_postal_code_click',
        { source: 'profile' },
      )
    })

    it('is accessible from the cart sidebar', async () => {
      const responses = [{ path: '/home/', responseBody: homeWithGrid }]
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByLabelText('Show cart')
      openCart()
      openChangeAddressModal('46010')

      const postalCodeModal = screen.getByRole('dialog')
      expect(postalCodeModal).toHaveTextContent(
        'Where do you want to receive your order?',
      )
      expect(
        within(postalCodeModal).getByRole('textbox', { name: 'Postal code' })
          .value,
      ).toBe('46010')
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'change_postal_code_click',
        { source: 'cart' },
      )
    })

    it('changes the postal code by clicking on `Change`', async () => {
      const responses = [
        { path: '/home/', responseBody: homeWithGrid },
        {
          path: '/postal-codes/actions/change-pc/',
          method: 'put',
          requestBody: { new_postal_code: '46001' },
          headers: { 'x-customer-pc': '46001', 'x-customer-wh': 'vlc1' },
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByLabelText('Show cart')
      openUserDropdown()
      openChangeAddressModalFromUserMenu('46010')
      fillPostalCodeForm('46001')
      confirmPostalCodeForm()
      await waitForElementToBeRemoved(() => screen.getByRole('dialog'))

      openUserDropdown()
      openChangeAddressModalFromUserMenu('46001')

      const postalCodeDialog = await screen.findByRole('dialog')
      expect(
        within(postalCodeDialog).getByRole('textbox', { name: 'Postal code' })
          .value,
      ).toBe('46001')

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'change_postal_code_save_button_click',
        {
          new_postal_code: '46001',
          old_postal_code: '46010',
        },
      )
    })

    it('changes the postal code by pressing Enter', async () => {
      const responses = [
        { path: '/home/', responseBody: homeWithGrid },
        {
          path: '/postal-codes/actions/change-pc/',
          method: 'put',
          requestBody: { new_postal_code: '46001' },
          headers: { 'x-customer-pc': '46001', 'x-customer-wh': 'vlc1' },
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByLabelText('Show cart')
      openUserDropdown()
      openChangeAddressModalFromUserMenu('46010')
      fillPostalCodeForm('46001')
      confirmPostalCodeFormPressingEnter()
      await waitForElementToBeRemoved(() => screen.getByRole('dialog'))

      openUserDropdown()
      openChangeAddressModalFromUserMenu('46001')

      const postalCodeDialog = await screen.findByRole('dialog')
      expect(
        within(postalCodeDialog).getByRole('textbox', { name: 'Postal code' })
          .value,
      ).toBe('46001')

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'change_postal_code_save_button_click',
        {
          new_postal_code: '46001',
          old_postal_code: '46010',
        },
      )
    })

    it('allows to cancel changing the postal code', async () => {
      const responses = [
        { path: '/home/', responseBody: homeWithGrid },
        {
          path: '/postal-codes/actions/change-pc/',
          method: 'put',
          requestBody: { new_postal_code: '46001' },
          headers: { 'x-customer-pc': '46001', 'x-customer-wh': 'vlc1' },
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByLabelText('Show cart')
      openUserDropdown()
      openChangeAddressModalFromUserMenu('46010')
      cancelPostalCodeForm()

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'change_postal_code_cancel_button_click',
      )
    })

    it('redirects to the old website when the post code is outside the delivery area', async () => {
      const locationSpy = (window.location.assign = vi.fn())
      const responses = [
        { path: '/home/', responseBody: homeWithGrid },
        {
          path: '/postal-codes/actions/change-pc/',
          method: 'put',
          status: 400,
          requestBody: { new_postal_code: '08671' },
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByLabelText('Show cart')
      openUserDropdown()
      openChangeAddressModalFromUserMenu('46010')
      fillPostalCodeForm('08671')
      confirmPostalCodeForm()

      await screen.findByRole('button', {
        name: 'Go to classic version',
      })
      goToOldWebsite()

      expect(locationSpy).toHaveBeenCalledWith(
        'https://www.mercadona.es/ns/entrada.php?js=1&nidioma=5',
      )
    })
  })
})
