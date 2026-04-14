import { screen, waitFor, within } from '@testing-library/react'

import {
  fillPersonalDocument,
  invoiceRequest,
  invoiceRequestModalConfirm,
} from './helpers'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { order, preparedLines } from 'app/order/__scenarios__/orderDetail'
import { user } from 'app/user/__scenarios__/user'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('When there is an invoice automation request', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should not show automation flow when was already done', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        multipleResponses: [
          {
            responseBody: order,
          },
          {
            responseBody: { ...order, is_bill_requested: true },
          },
        ],
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        method: 'POST',
        status: 201,
        requestBody: { personal_id: 'G123456' },
        responseBody: {
          show_modal: false,
        },
      },
    ]

    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    invoiceRequest()

    await screen.findByRole('dialog', { name: 'Request invoice' })
    fillPersonalDocument('G123456')
    invoiceRequestModalConfirm()

    const invoiceConfirmationModal = await screen.findByRole('dialog', {
      name: 'Invoice requested',
    })

    const okButton = within(invoiceConfirmationModal).getByRole('button', {
      name: 'OK',
    })

    userEvent.click(okButton)

    const invoiceAutomationModal = screen.queryByRole('dialog', {
      name: 'Do you want an invoice for your future orders?',
    })

    expect(invoiceAutomationModal).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
      'invoice_automation_view',
      {
        user_flow: 'first_invoice',
      },
    )
  })

  it('should show automation flow on confirm successfully invoice request', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        multipleResponses: [
          {
            responseBody: order,
          },
          {
            responseBody: { ...order, is_bill_requested: true },
          },
        ],
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        method: 'POST',
        status: 201,
        requestBody: { personal_id: 'G123456' },
        responseBody: {
          show_modal: true,
        },
      },
      {
        path: '/customers/1/',
        multipleResponses: [
          {
            responseBody: { ...user, has_active_billing: false },
          },
          {
            responseBody: { ...user, has_active_billing: true },
          },
        ],
      },
    ]

    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    invoiceRequest()

    await screen.findByRole('dialog', { name: 'Request invoice' })
    fillPersonalDocument('G123456')
    invoiceRequestModalConfirm()

    const invoiceConfirmationModal = await screen.findByRole('dialog', {
      name: 'Invoice requested',
    })

    const okButton = within(invoiceConfirmationModal).getByRole('button', {
      name: 'OK',
    })

    userEvent.click(okButton)

    const invoiceAutomationModal = await screen.findByRole('dialog', {
      name: 'Do you want an invoice for your future orders?',
    })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_automation_view',
      {
        user_flow: 'first_invoice',
      },
    )

    const confirmButton = within(invoiceAutomationModal).getByRole('button', {
      name: 'Yes, always',
    })
    userEvent.click(confirmButton)

    expect('/customers/1/bill-automation/').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        personal_id: 'G123456',
        is_active: true,
      },
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_automation_change_click',
      {
        user_flow: 'first_invoice',
        changed_to: 'active',
        document: 'G123456',
      },
    )

    const invoiceAutomationConfirmedModal = await screen.findByRole('dialog', {
      name: 'Your future invoices will be sent automatically',
    })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_automation_confirmation_view',
      {
        user_flow: 'first_invoice',
      },
    )

    const successButton = within(invoiceAutomationConfirmedModal).getByRole(
      'button',
      {
        name: 'OK',
      },
    )
    userEvent.click(successButton)

    await waitFor(() => {
      expect(invoiceAutomationConfirmedModal).not.toBeInTheDocument()
    })

    const [userAreaMenu] = await screen.findAllByRole('complementary')
    await waitFor(() => {
      expect(userAreaMenu).toHaveTextContent('Invoices')
    })
  })

  it('should close automation flow on cancel', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        multipleResponses: [
          {
            responseBody: order,
          },
          {
            responseBody: { ...order, is_bill_requested: true },
          },
        ],
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        method: 'POST',
        status: 201,
        requestBody: { personal_id: 'G123456' },
        responseBody: {
          show_modal: true,
        },
      },
    ]

    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    invoiceRequest()

    await screen.findByRole('dialog', { name: 'Request invoice' })
    fillPersonalDocument('G123456')
    invoiceRequestModalConfirm()

    const invoiceConfirmationModal = await screen.findByRole('dialog', {
      name: 'Invoice requested',
    })

    const okButton = within(invoiceConfirmationModal).getByRole('button', {
      name: 'OK',
    })

    userEvent.click(okButton)

    const invoiceAutomationModal = await screen.findByRole('dialog', {
      name: 'Do you want an invoice for your future orders?',
    })

    const cancelButton = within(invoiceAutomationModal).getByRole('button', {
      name: 'No',
    })
    userEvent.click(cancelButton)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_automation_change_click',
      {
        user_flow: 'first_invoice',
        changed_to: 'inactive',
        document: 'G123456',
      },
    )

    await waitFor(() => {
      expect(invoiceAutomationModal).not.toBeInTheDocument()
    })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect('/customers/1/bill-automation/').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        personal_id: '',
        is_active: false,
      },
    })
  })
})
