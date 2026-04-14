const getInvoiceModalTitle = ({ isEditionModeActive, isBillRequested, t }) => {
  if (isEditionModeActive) return t('invoices.modify_invoice.title')
  if (isBillRequested) return t('invoices.requested_invoice.title')

  return t('invoices.request_invoice.title')
}

export { getInvoiceModalTitle }
