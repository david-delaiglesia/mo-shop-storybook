import { screen, within } from '@testing-library/react'

import {
  cancelPhoneNumberEdition,
  editContactInfo,
  fillPhone,
  openCountryCodeSelector,
  saveContactInfo,
  selectCountryCode,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Contact', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('displays an inactive contact card when the checkout has no delivery info', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutDeliveryInfo(),
        },
      ])
      .withLogin()
      .mount()

    const contactSection = await screen.findByRole('region', { name: 'Phone' })

    expect(
      within(contactSection).queryByRole('button', { name: 'Modify' }),
    ).not.toBeInTheDocument()
    expect(contactSection).not.toHaveTextContent(expect.stringContaining('+34'))
    expect(
      within(contactSection).queryByLabelText('Phone number'),
    ).not.toBeInTheDocument()
  })

  it('should allow to add the phone number', async () => {
    const newPhoneNumber = '666777888'

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            {
              responseBody: CheckoutMother.withoutContactInfo(),
            },
            {
              responseBody: {
                ...CheckoutMother.withoutContactInfo(),
                phone_country_code: '34',
                phone_national_number: newPhoneNumber,
              },
            },
          ],
        },
        {
          path: '/customers/1/checkouts/5/phone-number/',
          method: 'put',
          requestBody: {
            phone_country_code: '34',
            phone_national_number: newPhoneNumber,
          },
        },
      ])
      .withLogin()
      .mount()

    const contactSection = await screen.findByRole('region', { name: 'Phone' })

    expect(
      within(contactSection).queryByRole('button', { name: 'Modify' }),
    ).not.toBeInTheDocument()

    fillPhone(newPhoneNumber)
    saveContactInfo()
    await screen.findByText('+34 666 77 78 88')

    expect(contactSection).toHaveTextContent('+34 666 77 78 88')
    expect(
      within(contactSection).getByRole('button', { name: 'Modify' }),
    ).toBeInTheDocument()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'phone_number_save_click',
      {
        country_code: '34',
        national_phone_number: '666777888',
      },
    )
  })

  it('should not allow to add incorrect phone numbers', async () => {
    const incorrectPhoneNumber = '66677788'

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutContactInfo(),
        },
      ])
      .withLogin()
      .mount()

    const contactSection = await screen.findByRole('region', { name: 'Phone' })

    fillPhone(incorrectPhoneNumber)
    const saveButton = within(contactSection).getByRole('button', {
      name: 'Save',
    })

    expect(saveButton).toBeDisabled()
  })

  it('should display the contact form if there is not a contact information', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutContactInfo(),
        },
      ])
      .withLogin()
      .mount()

    const contactSection = await screen.findByRole('region', { name: 'Phone' })

    expect(
      within(contactSection).getByLabelText('Phone number'),
    ).toBeInTheDocument()
    expect(
      within(contactSection).getByRole('button', { name: 'Save' }),
    ).toBeDisabled()
    expect(
      within(contactSection).queryByRole('button', { name: 'Cancel' }),
    ).not.toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('telephone')
  })

  it('should display the contact information', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
      ])
      .withLogin()
      .mount()

    const contactSection = await screen.findByRole('region', { name: 'Phone' })

    expect(
      within(contactSection).getByRole('button', { name: 'Modify' }),
    ).toBeInTheDocument()
    expect(contactSection).toHaveTextContent('+34 645 78 59 24')
  })

  it('should allow to edit the contact information only with a valid phone', async () => {
    const newCountryCode = '351'
    const newPhoneNumber = '218447000'

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            {
              responseBody: CheckoutMother.filled(),
            },
            {
              responseBody: {
                ...CheckoutMother.filled(),
                phone_country_code: newCountryCode,
                phone_national_number: newPhoneNumber,
              },
            },
          ],
        },
        {
          path: '/customers/1/checkouts/5/phone-number/',
          method: 'put',
          requestBody: {
            phone_country_code: newCountryCode,
            phone_national_number: newPhoneNumber,
          },
        },
      ])
      .withLogin()
      .mount()

    const contactSection = await screen.findByRole('region', { name: 'Phone' })

    editContactInfo()
    fillPhone('666')

    expect(
      within(contactSection).queryByRole('button', { name: 'Modify' }),
    ).not.toBeInTheDocument()
    expect(
      within(contactSection).getByRole('button', { name: 'Save' }),
    ).toBeDisabled()

    openCountryCodeSelector('34')
    selectCountryCode('351')
    fillPhone(newPhoneNumber)
    saveContactInfo()
    await screen.findByText('Phone number')

    expect(contactSection).toHaveTextContent('+351 21 844 7000')
  })

  it('can cancel the edition of the phone number', async () => {
    const newPhoneNumber = '218447000'

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
      ])
      .withLogin()
      .mount()

    const contactSection = await screen.findByRole('region', { name: 'Phone' })

    expect(contactSection).toHaveTextContent('+34 645 78 59 24')

    editContactInfo()
    fillPhone(newPhoneNumber)

    cancelPhoneNumberEdition()

    expect(contactSection).toHaveTextContent('+34 645 78 59 24')
    expect(contactSection).not.toHaveTextContent(newPhoneNumber)
  })

  it('sends a `change_telephone_click` event when editing the contact information', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('region', { name: 'Phone' })
    editContactInfo()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'change_telephone_click',
      {
        checkout_id: 5,
        country_code: '34',
        has_phone: true,
        national_phone_number: '645 78 59 24',
        purchase_id: 5,
      },
    )
  })
})
