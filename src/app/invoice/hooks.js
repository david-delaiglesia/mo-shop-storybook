import { useEffect, useState } from 'react'

import { InvoiceClient } from './client'

import { useUserUUID } from 'app/authentication'

export const useInvoiceAutomation = () => {
  const [invoiceAutomation, setInvoiceAutomation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)

  const customerId = useUserUUID()

  const fetchInvoiceAutomation = async (options) => {
    try {
      if (!options?.silence) setIsLoading(true)

      const response = await InvoiceClient.getInvoiceAutomation(customerId)
      setInvoiceAutomation(response)
    } catch {
      setInvoiceAutomation(null)
    } finally {
      setIsLoading(false)
    }
  }

  const automateInvoice = async (personalId) => {
    setIsMutating(true)

    try {
      await InvoiceClient.automateInvoice({
        customerId,
        personalId,
        isActive: true,
      })
      await fetchInvoiceAutomation({ silence: true })
    } finally {
      setIsMutating(false)
    }
  }

  const automateInvoiceCancel = async () => {
    setIsMutating(true)

    try {
      await InvoiceClient.automateInvoice({
        customerId,
        personalId: '',
        isActive: false,
      })
      await fetchInvoiceAutomation({ silence: true })
    } finally {
      setIsMutating(false)
    }
  }

  useEffect(() => {
    if (customerId) {
      fetchInvoiceAutomation()
    }
  }, [customerId])

  return {
    invoiceAutomation,
    isLoading,
    isMutating,
    refetchInvoiceAutomation: () => fetchInvoiceAutomation({ silence: true }),
    automateInvoice,
    automateInvoiceCancel,
  }
}
