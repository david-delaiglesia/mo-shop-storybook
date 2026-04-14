import { Tracker } from 'services/tracker'

const invoiceRequestClick = (purchaseId) => {
  Tracker.sendInteraction('invoice_request_click', {
    purchase_id: purchaseId,
  })
}

const invoiceRequestView = (purchaseId) => {
  Tracker.sendInteraction('invoice_request_view', {
    purchase_id: purchaseId,
  })
}

const invoiceConfirmDocumentClick = (purchaseId, documentValue) => {
  Tracker.sendInteraction('invoice_confirm_document_click', {
    purchase_id: purchaseId,
    document_value: documentValue,
  })
}

const invoiceRequestCancelClick = () => {
  Tracker.sendInteraction('invoice_request_cancel_click')
}

const invoiceRequestConfirmationView = (purchaseId) => {
  Tracker.sendInteraction('invoice_request_confirmation_view', {
    purchase_id: purchaseId,
  })
}

const invoiceRegistrationLinkClick = () => {
  Tracker.sendInteraction('invoice_registration_link_click')
}

const invoiceLoginLinkClick = () => {
  Tracker.sendInteraction('invoice_login_link_click')
}

const invoiceRegistrationView = (documentValue, purchaseId) => {
  Tracker.sendInteraction('invoice_registration_view', {
    purchase_id: purchaseId,
    document_value: documentValue,
  })
}

const invoiceRegistrationCancelClick = () => {
  Tracker.sendInteraction('invoice_registration_cancel_click')
}

const invoiceRegistrationNotCompletedAlert = () => {
  Tracker.sendInteraction('invoice_registration_not_completed_alert')
}

const invoiceRegistrationNotCompletedRetryClick = () => {
  Tracker.sendInteraction('invoice_registration_not_completed_retry_click')
}

const invoiceRegistrationNotCompletedExitClick = () => {
  Tracker.sendInteraction('invoice_registration_not_completed_exit_click')
}

const invoiceEditClick = (purchaseId) => {
  Tracker.sendInteraction('invoice_edit_click', {
    purchase_id: purchaseId,
  })
}

const invoiceEditDocumentClick = (purchaseId, documentValue) => {
  Tracker.sendInteraction('invoice_edit_document_click', {
    purchase_id: purchaseId,
    document_value: documentValue,
  })
}

const invoiceEditConfirmationView = (purchaseId) => {
  Tracker.sendInteraction('invoice_edit_confirmation_view', {
    purchase_id: purchaseId,
  })
}

const invoiceEditCancelClick = (purchaseId) => {
  Tracker.sendInteraction('invoice_edit_cancel_click', {
    purchase_id: purchaseId,
  })
}

export const InvoicesMetrics = {
  USER_FLOW: {
    FIRST_INVOICE: 'first_invoice',
    INVOICE_SECTION: 'invoice_section',
  },

  invoiceRequestClick,
  invoiceRequestView,
  invoiceConfirmDocumentClick,
  invoiceRequestCancelClick,
  invoiceRequestConfirmationView,
  invoiceRegistrationLinkClick,
  invoiceLoginLinkClick,
  invoiceRegistrationView,
  invoiceRegistrationCancelClick,
  invoiceRegistrationNotCompletedAlert,
  invoiceRegistrationNotCompletedRetryClick,
  invoiceRegistrationNotCompletedExitClick,
  invoiceEditClick,
  invoiceEditDocumentClick,
  invoiceEditConfirmationView,
  invoiceEditCancelClick,

  invoiceAutomationView(userFlow) {
    Tracker.sendInteraction('invoice_automation_view', {
      user_flow: userFlow,
    })
  },

  invoiceAutomationChangeClick({ userFlow, active, document }) {
    Tracker.sendInteraction('invoice_automation_change_click', {
      user_flow: userFlow,
      changed_to: active ? 'active' : 'inactive',
      document,
    })
  },

  invoiceAutomationCancelClick() {
    Tracker.sendInteraction('invoice_automation_cancel_click')
  },

  invoiceAutomationConfirmationView(userFlow) {
    Tracker.sendInteraction('invoice_automation_confirmation_view', {
      user_flow: userFlow,
    })
  },

  invoicePageView() {
    Tracker.sendInteraction('invoice_view')
  },

  invoiceDetailsLinkClick() {
    Tracker.sendInteraction('invoice_details_link_click')
  },

  invoiceMyInvoicesLinkClick() {
    Tracker.sendInteraction('invoice_my_invoices_link_click')
  },
}
