import { screen, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

export const openModifyModal = async () => {
  const invoicingDataSection = await screen.findByLabelText(
    'Automatic invoicing',
  )
  const updateButton = within(invoicingDataSection).getByRole('button', {
    name: 'Modify',
  })
  userEvent.click(updateButton)
}

export const updateInvoiceAutomationForm = async (status, personalId) => {
  const updateInvoiceAutomationModal = await screen.findByRole('dialog', {
    name: 'Automatic invoicing',
  })

  const switchStatus = within(updateInvoiceAutomationModal).getByRole(
    'switch',
    {
      name: 'Always send invoices',
    },
  )

  if (status && !switchStatus.checked) {
    userEvent.click(switchStatus)
  }
  if (!status && switchStatus.checked) {
    userEvent.click(switchStatus)
  }

  const personalIdInput = within(updateInvoiceAutomationModal).queryByRole(
    'textbox',
    {
      name: 'ID, resident ID or Corporate Tax ID number',
    },
  )

  if (personalIdInput) {
    await userEvent.clear(personalIdInput)
    if (personalId) {
      userEvent.type(personalIdInput, personalId)
    }
  }
}

export const saveInvoiceAutomationForm = async () => {
  const updateInvoiceAutomationModal = await screen.findByRole('dialog', {
    name: 'Automatic invoicing',
  })

  const saveButton = within(updateInvoiceAutomationModal).getByRole('button', {
    name: 'Save',
  })

  userEvent.click(saveButton)
}

export const goToInvoicePortal = () => {
  userEvent.click(
    screen.getByRole('link', { name: 'Go to the Invoices portal' }),
  )
}

export const goToInvoicingDataLink = async () => {
  const invoicingDataSection = await screen.findByLabelText('Invoicing data')
  const invoicingDataLink = within(invoicingDataSection).getByRole('link', {
    name: 'Invoices Portal',
  })
  userEvent.click(invoicingDataLink)
}

export const goToMyInvoiceLink = async () => {
  const myInvoicesSection = await screen.findByLabelText('My invoices')
  const myInvoicesLink = within(myInvoicesSection).getByRole('link', {
    name: 'Invoices Portal',
  })
  userEvent.click(myInvoicesLink)
}
