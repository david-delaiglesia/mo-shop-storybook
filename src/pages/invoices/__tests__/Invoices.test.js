import { screen, waitFor, within } from '@testing-library/react'

import {
  goToInvoicePortal,
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

describe('User Area - Invoices', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    Tracker.sendViewChange.mockClear()
    Tracker.sendInteraction.mockClear()
  })

  it('should show the invoices user area section', async () => {
    wrap(App)
      .atPath('/user-area/invoices')
      .withNetwork(new InvoiceResponsesBuilder().addGetResponse().build())
      .withLogin({ user: { has_active_billing: true } })
      .mount()

    const header = await screen.findByRole('heading', {
      name: 'Invoices',
      level: 1,
    })

    expect(header).toBeInTheDocument()
  })

  it('should how current invoice automation status deactivated', async () => {
    wrap(App)
      .atPath('/user-area/invoices')
      .withNetwork(new InvoiceResponsesBuilder().addGetResponse().build())
      .withLogin({ user: { has_active_billing: true } })
      .mount()

    const invoicingDataSection = await screen.findByLabelText(
      'Automatic invoicing',
    )

    expect(
      within(invoicingDataSection).getByRole('heading', {
        name: 'Automatic invoicing',
        label: 5,
      }),
    ).toBeInTheDocument()
    expect(invoicingDataSection).toHaveTextContent('Deactivated')
  })

  it('should how current invoice automation status activated', async () => {
    wrap(App)
      .atPath('/user-area/invoices')
      .withNetwork(
        new InvoiceResponsesBuilder().addGetResponse('48712039V').build(),
      )
      .withLogin({ user: { has_active_billing: true } })
      .mount()

    const invoicingDataSection = await screen.findByLabelText(
      'Automatic invoicing',
    )

    expect(
      within(invoicingDataSection).getByRole('heading', {
        name: 'Automatic invoicing',
        label: 5,
      }),
    ).toBeInTheDocument()
    expect(invoicingDataSection).toHaveTextContent(
      'Number of document with which we will send your invoices',
    )
    expect(invoicingDataSection).toHaveTextContent('48712039V')
  })

  it('should show the invoicing data', async () => {
    wrap(App)
      .atPath('/user-area/invoices')
      .withNetwork(new InvoiceResponsesBuilder().addGetResponse().build())
      .withLogin({ user: { has_active_billing: true } })
      .mount()

    const invoicingDataSection = await screen.findByLabelText('Invoicing data')
    const invoicingDataLink = within(invoicingDataSection).getByRole('link', {
      name: 'Invoices Portal',
    })

    expect(
      within(invoicingDataSection).getByRole('heading', {
        name: 'Invoicing data',
        label: 5,
      }),
    ).toBeInTheDocument()
    expect(invoicingDataSection).toHaveTextContent(
      'You can modify your invoicing data on the Invoices Portal.',
    )
    expect(invoicingDataLink).toHaveAttribute(
      'href',
      'https://portal-facturas.com?billing_data_url',
    )
  })

  it('should show my invoices data', async () => {
    wrap(App)
      .atPath('/user-area/invoices')
      .withNetwork(new InvoiceResponsesBuilder().addGetResponse().build())
      .withLogin({ user: { has_active_billing: true } })
      .mount()

    const myInvoicesSection = await screen.findByLabelText('My invoices')
    const myInvoicesLink = within(myInvoicesSection).getByRole('link', {
      name: 'Invoices Portal',
    })

    expect(
      within(myInvoicesSection).getByRole('heading', {
        name: 'My invoices',
        label: 5,
      }),
    ).toBeInTheDocument()
    expect(myInvoicesSection).toHaveTextContent(
      'You can find your invoices on the Invoices Portal.',
    )
    expect(myInvoicesLink).toHaveAttribute(
      'href',
      'https://portal-facturas.com?my_bills_url',
    )
  })

  describe('Invoice automation edition', () => {
    it('should disable save button until form was dirty', async () => {
      wrap(App)
        .atPath('/user-area/invoices')
        .withNetwork(
          new InvoiceResponsesBuilder().addGetResponse('123456789').build(),
        )
        .withLogin({ user: { has_active_billing: true } })
        .mount()

      await openModifyModal()

      const updateInvoiceAutomationModal = await screen.findByRole('dialog', {
        name: 'Automatic invoicing',
      })

      const saveButton = within(updateInvoiceAutomationModal).getByRole(
        'button',
        {
          name: 'Save',
        },
      )

      expect(saveButton).toBeDisabled()

      await updateInvoiceAutomationForm(true, '987654321')
      expect(saveButton).toBeEnabled()
    })

    it('should show disclaimer on update personal id', async () => {
      wrap(App)
        .atPath('/user-area/invoices')
        .withNetwork(
          new InvoiceResponsesBuilder().addGetResponse('123456789').build(),
        )
        .withLogin({ user: { has_active_billing: true } })
        .mount()

      await openModifyModal()

      const updateInvoiceAutomationModal = await screen.findByRole('dialog', {
        name: 'Automatic invoicing',
      })

      await updateInvoiceAutomationForm(true, '987654321')

      expect(updateInvoiceAutomationModal).toHaveTextContent(
        'This will be applied in your future orders.',
      )
    })

    it('should show current invoice automation status deactivated', async () => {
      wrap(App)
        .atPath('/user-area/invoices')
        .withNetwork(new InvoiceResponsesBuilder().addGetResponse().build())
        .withLogin({ user: { has_active_billing: true } })
        .mount()

      await openModifyModal()

      const updateInvoiceAutomationModal = await screen.findByRole('dialog', {
        name: 'Automatic invoicing',
      })

      const switchStatus = within(updateInvoiceAutomationModal).getByRole(
        'switch',
        {
          name: 'Always send invoices',
        },
      )
      const personalIdInput = within(updateInvoiceAutomationModal).queryByRole(
        'textbox',
        {
          name: 'ID, resident ID or Corporate Tax ID number',
        },
      )

      expect(switchStatus).not.toBeChecked()
      expect(personalIdInput).not.toBeInTheDocument()
    })

    it('should show current invoice automation status activated', async () => {
      wrap(App)
        .atPath('/user-area/invoices')
        .withNetwork(
          new InvoiceResponsesBuilder().addGetResponse('123456789').build(),
        )
        .withLogin({ user: { has_active_billing: true } })
        .mount()

      await openModifyModal()

      const updateInvoiceAutomationModal = await screen.findByRole('dialog', {
        name: 'Automatic invoicing',
      })

      const switchStatus = within(updateInvoiceAutomationModal).getByRole(
        'switch',
        {
          name: 'Always send invoices',
        },
      )

      const personalIdInput = within(updateInvoiceAutomationModal).getByRole(
        'textbox',
        {
          name: 'ID, resident ID or Corporate Tax ID number',
        },
      )

      expect(switchStatus).toBeChecked()
      expect(personalIdInput).toHaveValue('123456789')
    })

    it('should activate the invoice automation on confirm changes', async () => {
      wrap(App)
        .atPath('/user-area/invoices')
        .withNetwork(
          new InvoiceResponsesBuilder()
            .addMultipleGetResponses(['123456789', '987654321'])
            .build(),
        )
        .withLogin({ user: { has_active_billing: true } })
        .mount()

      const invoicingDataSection = await screen.findByLabelText(
        'Automatic invoicing',
      )

      expect(invoicingDataSection).toHaveTextContent('123456789')

      await openModifyModal()

      const updateInvoiceAutomationModal = await screen.findByRole('dialog', {
        name: 'Automatic invoicing',
      })
      const saveButton = within(updateInvoiceAutomationModal).getByRole(
        'button',
        {
          name: 'Save',
        },
      )

      await updateInvoiceAutomationForm(true, '987654321')
      await saveInvoiceAutomationForm()
      expect(saveButton).toBeDisabled()
      expect(saveButton).toHaveClass('ui-button--loading')

      const invoiceAutomationConfirmedModal = await screen.findByRole(
        'dialog',
        {
          name: 'Your future invoices will be sent automatically',
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
        expect(updateInvoiceAutomationModal).not.toBeInTheDocument()
      })

      expect('/customers/1/bill-automation/').toHaveBeenFetchedWith({
        method: 'POST',
        body: {
          personal_id: '987654321',
          is_active: true,
        },
      })
      expect(invoicingDataSection).toHaveTextContent('987654321')
    })

    it('should deactivate the invoice automation on confirm changes', async () => {
      wrap(App)
        .atPath('/user-area/invoices')
        .withNetwork(
          new InvoiceResponsesBuilder()
            .addMultipleGetResponses(['987654321', ''])
            .build(),
        )
        .withLogin({ user: { has_active_billing: true } })
        .mount()

      const invoicingDataSection = await screen.findByLabelText(
        'Automatic invoicing',
      )

      expect(invoicingDataSection).toHaveTextContent('987654321')

      await openModifyModal()

      await updateInvoiceAutomationForm(false)
      await saveInvoiceAutomationForm()

      expect('/customers/1/bill-automation/').toHaveBeenFetchedWith({
        method: 'POST',
        body: {
          personal_id: '',
          is_active: false,
        },
      })

      await waitFor(() => {
        expect(invoicingDataSection).toHaveTextContent('Deactivated')
      })
    })

    it('should manage the error on save invoice automation', async () => {
      wrap(App)
        .atPath('/user-area/invoices')
        .withNetwork(
          new InvoiceResponsesBuilder()
            .addGetResponse('123456789')
            .addUpdateErrorResponse('IdNotRegistered')
            .build(),
        )
        .withLogin({ user: { has_active_billing: true } })
        .mount()

      await openModifyModal()

      await updateInvoiceAutomationForm(true, 'IdNotRegistered')
      await saveInvoiceAutomationForm()

      const personalIdNotRegisteredModal = await screen.findByRole('dialog', {
        name: 'Register the document in the Invoices portal',
      })

      expect(personalIdNotRegisteredModal).toBeInTheDocument()

      goToInvoicePortal()
      window.dispatchEvent(new Event('focus'))

      const documentStillNotRegisteredModal = await screen.findByRole(
        'dialog',
        {
          name: 'It appears that the document is still not registered',
        },
      )

      expect(documentStillNotRegisteredModal).toBeInTheDocument()
    })
  })
})
