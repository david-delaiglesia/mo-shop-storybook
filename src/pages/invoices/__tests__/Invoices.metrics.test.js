import { screen, waitFor, within } from '@testing-library/react'

import {
  goToInvoicingDataLink,
  goToMyInvoiceLink,
  openModifyModal,
  saveInvoiceAutomationForm,
  updateInvoiceAutomationForm,
} from './helpers'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { InvoiceResponsesBuilder } from '__tests__/invoices/InvoiceResponsesBuilder'
import { App, history } from 'app'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Invoices Metrics', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    Tracker.sendViewChange.mockClear()
    Tracker.sendInteraction.mockClear()
  })

  it('should send metrics on enter to the page', async () => {
    wrap(App)
      .atPath('/user-area/invoices')
      .withNetwork(new InvoiceResponsesBuilder().addGetResponse().build())
      .withLogin({ user: { has_active_billing: true } })
      .mount()

    await waitFor(() => {
      expect(Tracker.sendInteraction).toHaveBeenCalledWith('invoice_view')
    })
  })

  it('should send metrics on show modal update', async () => {
    wrap(App)
      .atPath('/user-area/invoices')
      .withNetwork(new InvoiceResponsesBuilder().addGetResponse().build())
      .withLogin({ user: { has_active_billing: true } })
      .mount()

    await openModifyModal()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_automation_view',
      {
        user_flow: 'invoice_section',
      },
    )
  })

  it('should send metrics on cancel modal update', async () => {
    wrap(App)
      .atPath('/user-area/invoices')
      .withNetwork(new InvoiceResponsesBuilder().addGetResponse().build())
      .withLogin({ user: { has_active_billing: true } })
      .mount()

    await openModifyModal()

    const updateInvoiceAutomationModal = await screen.findByRole('dialog', {
      name: 'Automatic invoicing',
    })

    userEvent.click(
      within(updateInvoiceAutomationModal).getByRole('button', {
        name: 'Cancel',
      }),
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_automation_cancel_click',
    )
  })

  it('should send metrics on submit modal update', async () => {
    wrap(App)
      .atPath('/user-area/invoices')
      .withNetwork(new InvoiceResponsesBuilder().addGetResponse().build())
      .withLogin({ user: { has_active_billing: true } })
      .mount()

    await openModifyModal()
    await updateInvoiceAutomationForm(true, '987654321')
    await saveInvoiceAutomationForm()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_automation_change_click',
      {
        user_flow: 'invoice_section',
        changed_to: 'active',
        document: '987654321',
      },
    )
  })

  it('should send metrics on go to invoicing data', async () => {
    wrap(App)
      .atPath('/user-area/invoices')
      .withNetwork(new InvoiceResponsesBuilder().addGetResponse().build())
      .withLogin({ user: { has_active_billing: true } })
      .mount()

    await goToInvoicingDataLink()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_details_link_click',
    )
  })

  it('should send metrics on go to my invoices', async () => {
    wrap(App)
      .atPath('/user-area/invoices')
      .withNetwork(new InvoiceResponsesBuilder().addGetResponse().build())
      .withLogin({ user: { has_active_billing: true } })
      .mount()

    await goToMyInvoiceLink()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_my_invoices_link_click',
    )
  })

  it('should send metrics on show error handlers', async () => {
    wrap(App)
      .atPath('/user-area/invoices')
      .withNetwork(
        new InvoiceResponsesBuilder()
          .addGetResponse()
          .addUpdateErrorResponse('IdNotRegistered')
          .build(),
      )
      .withLogin({ user: { has_active_billing: true } })
      .mount()

    await openModifyModal()
    await updateInvoiceAutomationForm(true, 'IdNotRegistered')
    await saveInvoiceAutomationForm()

    await screen.findByRole('dialog', {
      name: 'Register the document in the Invoices portal',
    })

    await waitFor(() => {
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'invoice_registration_view',
        {
          purchase_id: undefined,
          document_value: 'IdNotRegistered',
        },
      )
    })
  })
})
