import { CheckoutClient } from '../client'
import { vi } from 'vitest'

import { HttpWithErrorHandler } from 'services/http'

describe('CheckoutClient', () => {
  const userId = '1'
  const checkoutId = '1'

  beforeEach(() => {
    HttpWithErrorHandler.auth().post = vi.fn(() =>
      Promise.resolve({ order_id: 123 }),
    )
    HttpWithErrorHandler.auth().put = vi.fn()
  })

  afterEach(() => {
    HttpWithErrorHandler.auth().post.mockClear()
    HttpWithErrorHandler.auth().put.mockClear()
  })

  it('should update the customer contact info of a checkout', () => {
    const contactInfo = {
      phone_country_code: '34',
      phone_national_number: '680994612',
    }
    const expectedPath = `/customers/${userId}/checkouts/${checkoutId}/phone-number/`
    const expectedOptions = {
      body: JSON.stringify(contactInfo),
      shouldCatchErrors: false,
    }

    CheckoutClient.updateContactInfo(userId, checkoutId, contactInfo)

    expect(HttpWithErrorHandler.auth().put).toHaveBeenCalledWith(
      expectedPath,
      expectedOptions,
    )
  })

  it('should update the customer delivery info of a checkout', () => {
    const deliveryInfo = {
      address: { id: '34' },
      slot: { id: '62' },
    }
    const expectedPath = `/customers/${userId}/checkouts/${checkoutId}/delivery-info/`
    const expectedOptions = {
      body: JSON.stringify(deliveryInfo),
      shouldCatchErrors: false,
    }

    CheckoutClient.updateDeliveryInfo(userId, checkoutId, deliveryInfo)

    expect(HttpWithErrorHandler.auth().put).toHaveBeenCalledWith(
      expectedPath,
      expectedOptions,
    )
  })

  it('should update the customer payment info of a checkout', () => {
    const paymentInfo = {
      id: '34',
    }
    const expectedPath = `/customers/${userId}/checkouts/${checkoutId}/payment-method/`
    const expectedOptions = {
      body: JSON.stringify({ payment_method: paymentInfo }),
      shouldCatchErrors: false,
    }

    CheckoutClient.updatePaymentInfo(userId, checkoutId, paymentInfo)

    expect(HttpWithErrorHandler.auth().put).toHaveBeenCalledWith(
      expectedPath,
      expectedOptions,
    )
  })

  it('should confirm a checkout', async () => {
    const expectedPath = `/customers/${userId}/checkouts/${checkoutId}/orders/`

    const response = await CheckoutClient.confirmLegacy(userId, checkoutId)

    expect(HttpWithErrorHandler.auth().post).toHaveBeenCalledWith(
      expectedPath,
      {
        shouldCatchErrors: false,
      },
    )
    expect(response).toEqual({ orderId: 123 })
  })
})
