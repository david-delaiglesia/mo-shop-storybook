import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'

import {
  acceptOnboardingModal,
  openChangeAddressModalFromUserMenu,
  openUserDropdown,
  setPostalCode,
} from './helpers'
import { wrap } from 'wrapito'

import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

it('displays the postal code set during the onboarding', async () => {
  // clear cookies to trigger the onboarding when going to /home
  Cookie.get = vi.fn(() => ({})) as <CookieValueType>(
    cookieName: string,
  ) => CookieValueType | undefined

  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/postal-codes/actions/change-pc/',
        method: 'put',
        requestBody: { new_postal_code: '46010' },
      },
    ])
    .mount()

  const onboardingDialog = await screen.findByRole('dialog')

  expect(onboardingDialog).toHaveTextContent(
    'Enter your postal code in order to access your shop',
  )

  setPostalCode('46010')
  acceptOnboardingModal()

  await waitForElementToBeRemoved(() => screen.getByRole('dialog'))
  openUserDropdown()
  openChangeAddressModalFromUserMenu('46010')

  const changePostalCodeDialog = await screen.findByRole('dialog')

  const postalCodeInput = within(changePostalCodeDialog).getByRole('textbox', {
    name: 'Postal code',
  }) as HTMLInputElement
  expect(postalCodeInput.value).toBe('46010')
})
