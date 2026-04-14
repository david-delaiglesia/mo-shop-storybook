import { act, screen, within } from '@testing-library/react'

import {
  clickOnEditDocumentId,
  closeDocumentStillNotRegisteredModal,
  closePersonalIdNotRegisteredModal,
  editDocumentId,
  fillPersonalDocument,
  goToPortalFacturas,
  invoiceRequest,
  invoiceRequestModalConfirm,
  invoiceRequested,
  modifyDocumentIdConfirm,
  onCancelInvoiceRequestModal,
  onCloseModifyModal,
  tryAgainDocumentRegistration,
} from './helpers'
import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { order, preparedLines } from 'app/order/__scenarios__/orderDetail'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('When there is an invoice request', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should display invoice request modal', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: { ...order, status_ui: 'preparing' },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    invoiceRequest()

    const modal = screen.getByRole('dialog', { name: 'Request invoice' })
    expect(
      within(modal).getByLabelText(
        'ID, resident ID or Corporate Tax ID number',
      ),
    )
    expect(
      within(modal).getByText(
        'The invoice will be available in the Invoices Portal.',
      ),
    ).toBeInTheDocument()
    expect(
      within(modal).getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument()
    expect(
      within(modal).getByRole('button', { name: 'Confirm' }),
    ).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_request_click',
      {
        purchase_id: 44051,
      },
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_request_view',
      {
        purchase_id: 44051,
      },
    )
    expect(screen.getByTestId('order-actions-container')).toHaveClass(
      'order-detail-container__cancelable-order-actions',
    )
  })

  it('should not display invoice request button when status_ui is cancelled', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: { ...order, status_ui: 'cancelled-by-customer' },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    expect(screen.queryByText('Request invoice')).not.toBeInTheDocument()
  })

  it('should confirm successfully invoice request', async () => {
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

    screen.getByRole('dialog', { name: 'Request invoice' })
    fillPersonalDocument('G123456')
    invoiceRequestModalConfirm()

    const invoiceConfirmationModal = await screen.findByRole('dialog', {
      name: 'Invoice requested',
    })

    expect(
      within(invoiceConfirmationModal).getByText(
        'The invoice will be available in the Invoices Portal.',
      ),
    ).toBeInTheDocument()
    expect(
      within(invoiceConfirmationModal).getByRole('button', {
        name: 'OK',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Invoice requested',
      }),
    ).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_confirm_document_click',
      {
        purchase_id: 44051,
        document_value: 'G123456',
      },
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_request_confirmation_view',
      {
        purchase_id: 44051,
      },
    )
  })

  it('should cancel invoice request modal', async () => {
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

    screen.getByRole('dialog', { name: 'Request invoice' })
    onCancelInvoiceRequestModal()

    expect(
      screen.queryByRole('dialog', { name: 'Request invoice' }),
    ).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_request_cancel_click',
    )
  })

  it('should show loader onConfirm modal button', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: order,
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
    await invoiceRequest()

    screen.getByRole('dialog', { name: 'Request invoice' })
    await fillPersonalDocument('G123456')
    await act(async () => {
      await invoiceRequestModalConfirm()
      expect(screen.getByLabelText('loader')).toBeInTheDocument()
    })
  })

  it('should display personal_id_not_registered error modal', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: order,
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        method: 'POST',
        status: 404,
        requestBody: {
          personal_id: 'idNotRegistered',
        },
        responseBody: {
          code: 'personal_id_not_registered',
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

    screen.getByRole('dialog', { name: 'Request invoice' })
    fillPersonalDocument('idNotRegistered')
    invoiceRequestModalConfirm()

    const personalIdNotRegisteredModal = await screen.findByRole('dialog', {
      name: 'Register the document in the Invoices portal',
    })

    expect(
      within(personalIdNotRegisteredModal).getByText(
        'Come back when you are finished to complete the application',
      ),
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_registration_view',
      {
        purchase_id: 44051,
        document_value: 'idNotRegistered',
      },
    )
  })

  it('should redirect to portal invoices registration', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: order,
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        method: 'POST',
        status: 404,
        requestBody: {
          personal_id: 'idNotRegistered',
        },
        responseBody: {
          code: 'personal_id_not_registered',
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

    screen.getByRole('dialog', { name: 'Request invoice' })
    fillPersonalDocument('idNotRegistered')
    invoiceRequestModalConfirm()

    await screen.findByRole('dialog', {
      name: 'Register the document in the Invoices portal',
    })

    const link = screen.getByRole('link', { name: 'Go to the Invoices portal' })

    goToPortalFacturas()

    expect(link).toHaveAttribute(
      'href',
      'https://www.portalcliente.itg.mercadona.es/pclie/web/op.htm?operation=pclie.flow.ri.registro&fwk.locale=es_ES',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_registration_link_click',
    )
  })

  it('should close personal_id_not_registered error modal', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: order,
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        method: 'POST',
        status: 404,
        requestBody: {
          personal_id: 'idNotRegistered',
        },
        responseBody: {
          code: 'personal_id_not_registered',
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

    screen.getByRole('dialog', { name: 'Request invoice' })
    fillPersonalDocument('idNotRegistered')
    invoiceRequestModalConfirm()

    await screen.findByRole('dialog', {
      name: 'Register the document in the Invoices portal',
    })

    closePersonalIdNotRegisteredModal()

    expect(
      screen.queryByRole('dialog', {
        name: 'Register the document in the Invoices portal',
      }),
    ).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_registration_cancel_click',
    )
  })

  it('should display document still not registered modal', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: order,
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        method: 'POST',
        status: 404,
        requestBody: {
          personal_id: 'idNotRegistered',
        },
        responseBody: {
          code: 'personal_id_not_registered',
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

    screen.getByRole('dialog', { name: 'Request invoice' })
    fillPersonalDocument('idNotRegistered')
    invoiceRequestModalConfirm()

    await screen.findByRole('dialog', {
      name: 'Register the document in the Invoices portal',
    })

    goToPortalFacturas()
    window.dispatchEvent(new Event('focus'))

    const documentStillNotRegisteredModal = await screen.findByRole('dialog', {
      name: 'It appears that the document is still not registered',
    })

    expect(
      within(documentStillNotRegisteredModal).getByText(
        'Please check that you have completed the registration in the invoices Portal or try again.',
      ),
    )
    expect(
      within(documentStillNotRegisteredModal).getByRole('img', {
        name: 'Warning icon',
      }),
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_registration_not_completed_alert',
    )
  })

  it('should close document still not registered modal', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: order,
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        method: 'POST',
        status: 404,
        requestBody: {
          personal_id: 'idNotRegistered',
        },
        responseBody: {
          code: 'personal_id_not_registered',
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

    screen.getByRole('dialog', { name: 'Request invoice' })
    fillPersonalDocument('idNotRegistered')
    invoiceRequestModalConfirm()

    await screen.findByRole('dialog', {
      name: 'Register the document in the Invoices portal',
    })

    goToPortalFacturas()
    window.dispatchEvent(new Event('focus'))

    await closeDocumentStillNotRegisteredModal()

    expect(
      screen.queryByRole('dialog', {
        name: 'It appears that the document is still not registered',
      }),
    ).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_registration_not_completed_exit_click',
    )
  })

  it('should try again document registration', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: order,
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        method: 'POST',
        status: 404,
        requestBody: {
          personal_id: 'idNotRegistered',
        },
        responseBody: {
          code: 'personal_id_not_registered',
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

    screen.getByRole('dialog', { name: 'Request invoice' })
    fillPersonalDocument('idNotRegistered')
    invoiceRequestModalConfirm()

    await screen.findByRole('dialog', {
      name: 'Register the document in the Invoices portal',
    })

    goToPortalFacturas()
    window.dispatchEvent(new Event('focus'))

    await tryAgainDocumentRegistration()

    expect(
      within(screen.getByRole('dialog', { name: 'Request invoice' })).getByRole(
        'textbox',
        {
          name: 'ID, resident ID or Corporate Tax ID number',
        },
      ).value,
    ).toBe('idNotRegistered')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_registration_not_completed_retry_click',
    )
  })

  it('should display invoice successfully requested modal after registration on invoices portal', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: order,
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: '/customers/1/orders/44051/bill/',
        method: 'POST',
        requestBody: {
          personal_id: 'idNotRegistered',
        },
        multipleResponses: [
          {
            status: 404,
            responseBody: {
              code: 'personal_id_not_registered',
            },
          },
          {
            status: 201,
            responseBody: {
              show_modal: false,
            },
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

    screen.getByRole('dialog', { name: 'Request invoice' })
    fillPersonalDocument('idNotRegistered')
    invoiceRequestModalConfirm()

    await screen.findByRole('dialog', {
      name: 'Register the document in the Invoices portal',
    })

    goToPortalFacturas()
    window.dispatchEvent(new Event('focus'))

    const invoiceConfirmationModal = await screen.findByRole('dialog', {
      name: 'Invoice requested',
    })

    expect(
      within(invoiceConfirmationModal).getByText(
        'The invoice will be available in the Invoices Portal.',
      ),
    ).toBeInTheDocument()

    const warningModal = screen.queryByRole('dialog', {
      name: 'Register the document in the Invoices portal',
    })
    expect(warningModal).not.toBeInTheDocument()
  })
})

describe('When invoice is already requested', () => {
  it('should display invoice requested modal', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: { ...order, is_bill_requested: true },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        responseBody: {
          personal_id: '12345G',
        },
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    invoiceRequested()

    const modal = await screen.findByRole('dialog', {
      name: 'Invoice requested',
    })
    expect(
      within(modal).getByRole('textbox', {
        name: 'ID, resident ID or Corporate Tax ID number',
      }).value,
    ).toBe('12345G')
    expect(
      within(modal).queryByText('Enter the document number'),
    ).not.toBeInTheDocument()
    expect(
      within(modal).getByText(
        'The invoice will be available in the Invoices Portal.',
      ),
    ).toBeInTheDocument()
    expect(
      within(modal).getByRole('button', { name: 'Accept' }),
    ).toBeInTheDocument()
  })

  it('should navigate to portal facturas', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: { ...order, is_bill_requested: true },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        responseBody: {
          personal_id: '12345G',
        },
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    invoiceRequested()

    await screen.findByRole('dialog', { name: 'Invoice requested' })

    const link = screen.getByRole('link', { name: 'Go to the Invoices portal' })

    goToPortalFacturas()

    expect(link).toHaveAttribute(
      'href',
      'https://www.portalcliente.itg.mercadona.es/pclie/web/op.htm?operation=pclie.flow.ri.login&fwk.locale=es_ES',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_login_link_click',
    )
  })

  it('should display invoice requested edition modal', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: { ...order, is_bill_requested: true },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        responseBody: {
          personal_id: '12345G',
        },
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    invoiceRequested()

    const modal = await screen.findByRole('dialog', {
      name: 'Invoice requested',
    })

    clickOnEditDocumentId()

    const modifyInvoiceModal = await screen.findByRole('dialog', {
      name: 'Modify invoice',
    })

    expect(
      within(modifyInvoiceModal).getByRole('textbox', {
        name: 'ID, resident ID or Corporate Tax ID number',
      }).value,
    ).toBe('12345G')
    expect(
      within(modal).queryByText('Enter the document number'),
    ).toBeInTheDocument()
    expect(
      within(modal).getByText(
        'The invoice will be available in the Invoices Portal.',
      ),
    ).toBeInTheDocument()
    expect(
      within(modal).queryByRole('button', { name: 'Accept' }),
    ).not.toBeInTheDocument()
    expect(
      within(modal).getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument()
    expect(
      within(modal).getByRole('button', { name: 'Confirm' }),
    ).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('invoice_edit_click', {
      purchase_id: 44051,
    })
  })

  it('should disable invoice requested edition modal input when the payment is Ok', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: {
          ...order,
          is_bill_requested: true,
          payment_status: 1,
        },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        responseBody: {
          personal_id: '12345G',
        },
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    invoiceRequested()

    const modal = await screen.findByRole('dialog', {
      name: 'Invoice requested',
    })

    expect(
      within(modal).getByRole('textbox', {
        name: 'ID, resident ID or Corporate Tax ID number',
      }),
    ).toBeDisabled()
    expect(
      within(modal).queryByRole('button', { name: 'Accept' }),
    ).toBeInTheDocument()
  })

  it('should enable invoice request modal input when the payment is Ok but bill is not requested', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: {
          ...order,
          is_bill_requested: false,
          payment_status: 1,
        },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        responseBody: {
          personal_id: '12345G',
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

    const modal = await screen.findByRole('dialog', {
      name: 'Request invoice',
    })

    expect(
      within(modal).queryByRole('textbox', {
        name: 'ID, resident ID or Corporate Tax ID number',
      }),
    ).not.toBeDisabled()
    expect(
      within(modal).queryByRole('button', { name: 'Accept' }),
    ).not.toBeInTheDocument()
  })

  it('should modify the document id', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: { ...order, is_bill_requested: true },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        responseBody: {
          personal_id: '12345G',
        },
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        method: 'PATCH',
        status: 200,
        requestBody: {
          personal_id: '12345G5F',
        },
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    invoiceRequested()

    await screen.findByRole('dialog', {
      name: 'Invoice requested',
    })

    clickOnEditDocumentId()

    await screen.findByRole('dialog', {
      name: 'Modify invoice',
    })

    editDocumentId('5F')
    modifyDocumentIdConfirm()

    expect('/customers/1/orders/44051/bill/').toHaveBeenFetchedWith({
      method: 'PATCH',
      body: {},
    })

    const requestedInvoiceModal = await screen.findByRole('dialog', {
      name: 'Invoice requested',
    })
    expect(requestedInvoiceModal).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_edit_document_click',
      {
        purchase_id: 44051,
        document_value: '12345G5F',
      },
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_edit_confirmation_view',
      {
        purchase_id: 44051,
      },
    )
  })

  it('should handle modified invoice error', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: { ...order, is_bill_requested: true },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        responseBody: {
          personal_id: '12345G',
        },
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        method: 'PATCH',
        status: 404,
        requestBody: {
          personal_id: '12345GF',
        },
        responseBody: {
          code: 'personal_id_not_registered',
        },
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    invoiceRequested()

    await screen.findByRole('dialog', {
      name: 'Invoice requested',
    })

    clickOnEditDocumentId()

    await screen.findByRole('dialog', {
      name: 'Modify invoice',
    })

    editDocumentId('F')
    modifyDocumentIdConfirm()

    await screen.findByRole('dialog', {
      name: 'Register the document in the Invoices portal',
    })

    goToPortalFacturas()
    window.dispatchEvent(new Event('focus'))

    const documentStillNotRegisteredModal = await screen.findByRole('dialog', {
      name: 'It appears that the document is still not registered',
    })

    expect(
      within(documentStillNotRegisteredModal).getByText(
        'Please check that you have completed the registration in the invoices Portal or try again.',
      ),
    )
  })

  it('should handle onClose modify invoice modal', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: { ...order, is_bill_requested: true },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/orders/44051/bill/`,
        responseBody: {
          personal_id: '12345G',
        },
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    invoiceRequested()

    await screen.findByRole('dialog', {
      name: 'Invoice requested',
    })

    clickOnEditDocumentId()

    const modifiyInvoiceModal = await screen.findByRole('dialog', {
      name: 'Modify invoice',
    })

    onCloseModifyModal()
    invoiceRequested()

    await screen.findByRole('dialog', {
      name: 'Invoice requested',
    })

    expect(modifiyInvoiceModal).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'invoice_edit_cancel_click',
      {
        purchase_id: 44051,
      },
    )
  })
})
